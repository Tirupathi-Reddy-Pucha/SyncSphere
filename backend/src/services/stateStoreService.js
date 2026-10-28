/**
 * Azure Table Storage Service
 * Persistent cloud database using Azure Storage Tables (free with existing storage account)
 * Replaces the in-memory stateStoreService with durable cloud persistence
 */
const { TableServiceClient, TableClient, odata } = require('@azure/data-tables');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const keyVaultService = require('./keyVaultService');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function getConnectionString() {
    let conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!conn && keyVaultService.cache.has('AZURE-STORAGE-CONNECTION-STRING')) {
        conn = keyVaultService.cache.get('AZURE-STORAGE-CONNECTION-STRING')?.value;
    }
    return conn || '';
}

// Table names
const TABLES = {
    WORKSPACES: 'syncsphereWorkspaces',
    TASKS: 'syncsphereTasks',
    LOGS: 'syncsphereLogs',
    AI_REVIEWS: 'syncsphereAiReviews'
};

// Seed data for initial workspace setup
const SEED_WORKSPACES = [
    {
        partitionKey: 'workspaces',
        rowKey: 'ws-101',
        title: 'Cloud Native Microservices Architecture',
        description: 'Azure App Service & Blob Storage Integration for Enterprise Collaboration',
        category: 'Cloud Engineering',
        status: 'In Progress',
        author: 'Tirupathi Reddy (Project Lead)',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
        partitionKey: 'workspaces',
        rowKey: 'ws-102',
        title: 'Azure Serverless AI Workflow',
        description: 'Event-driven security scanner for cloud assets uploaded to Azure Blob Containers',
        category: 'Serverless & Security',
        status: 'Active',
        author: 'Cloud Team',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
];

const SEED_TASKS = [
    { partitionKey: 'tasks', rowKey: 'tsk-1', workspaceId: 'ws-101', title: 'Provision Azure Storage Account & Blob Container', priority: 'High', status: 'Completed', assignee: 'Tirupathi Reddy' },
    { partitionKey: 'tasks', rowKey: 'tsk-2', workspaceId: 'ws-101', title: 'Configure App Service Free Tier Web App', priority: 'High', status: 'Completed', assignee: 'DevOps Lead' },
    { partitionKey: 'tasks', rowKey: 'tsk-3', workspaceId: 'ws-102', title: 'Integrate Azure Table Storage Persistence Layer', priority: 'High', status: 'Completed', assignee: 'Tirupathi Reddy' },
    { partitionKey: 'tasks', rowKey: 'tsk-4', workspaceId: 'ws-102', title: 'Setup GitHub Actions CI/CD Pipeline', priority: 'High', status: 'In Progress', assignee: 'DevOps Lead' }
];

let tableServiceClient;
let initialized = false;

function getTableServiceClient() {
    const conn = getConnectionString();
    if (!conn || conn.trim() === '') return null;
    try {
        return TableServiceClient.fromConnectionString(conn);
    } catch (err) {
        console.warn('⚠️ Azure Table Storage: Could not init client:', err.message);
        return null;
    }
}

const tableClients = new Map();

function defaultWorkspaceMembers(author = 'Tirupathi Reddy') {
    return [
        { id: 'usr-1', name: author, role: 'Lead Architect', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
        { id: 'usr-2', name: 'Cloud SecOps Lead', role: 'Security Reviewer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        { id: 'usr-3', name: 'Azure DevOps Specialist', role: 'CI/CD Engineer', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' }
    ];
}

function getTableClient(tableName) {
    const conn = getConnectionString();
    if (!conn || conn.trim() === '') return null;
    if (tableClients.has(tableName)) return tableClients.get(tableName);
    try {
        const client = TableClient.fromConnectionString(conn, tableName);
        tableClients.set(tableName, client);
        return client;
    } catch (err) {
        return null;
    }
}

async function ensureTablesExist() {
    if (initialized) return;
    const svc = getTableServiceClient();
    if (!svc) {
        console.warn('⚠️ Azure Table Storage not available — running with in-memory fallback');
        initialized = true;
        return;
    }

    try {
        for (const tableName of Object.values(TABLES)) {
            await svc.createTable(tableName).catch(() => { }); // ignore already-exists
        }

        // Seed workspaces if empty
        const wsClient = getTableClient(TABLES.WORKSPACES);
        const existing = wsClient.listEntities({ queryOptions: { filter: `PartitionKey eq 'workspaces'` } });
        let count = 0;
        for await (const entity of existing) { count++; break; }

        if (count === 0) {
            for (const ws of SEED_WORKSPACES) {
                await wsClient.createEntity(ws).catch(() => { });
            }
            const taskClient = getTableClient(TABLES.TASKS);
            for (const task of SEED_TASKS) {
                await taskClient.createEntity(task).catch(() => { });
            }
            console.log('✅ Azure Table Storage: Seeded initial workspace & task data');
        }

        console.log('✅ Azure Table Storage: Tables initialized successfully');
        initialized = true;
    } catch (err) {
        console.warn('⚠️ Azure Table Storage init error:', err.message);
        initialized = true;
    }
}

// ─── Workspace Methods ───────────────────────────────────────────────────────
async function getWorkspaces() {
    await ensureTablesExist();
    const client = getTableClient(TABLES.WORKSPACES);
    if (!client) return fallbackState.workspaces;
    try {
        const entities = client.listEntities({ queryOptions: { filter: `PartitionKey eq 'workspaces'` } });
        const results = [];
        for await (const entity of entities) {
            results.push({
                id: entity.rowKey,
                title: entity.title,
                description: entity.description,
                category: entity.category,
                status: entity.status,
                author: entity.author,
                createdAt: entity.createdAt,
                members: defaultWorkspaceMembers(entity.author)
            });
        }
        return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
        console.warn('⚠️ Table Storage read error:', err.message);
        return fallbackState.workspaces;
    }
}

async function createWorkspace(data) {
    await ensureTablesExist();
    const id = `ws-${Date.now()}`;
    const author = data.author || 'User';
    const entity = {
        partitionKey: 'workspaces',
        rowKey: id,
        title: data.title || 'New Workspace',
        description: data.description || '',
        category: data.category || 'Cloud Engineering',
        status: 'In Progress',
        author,
        createdAt: new Date().toISOString()
    };
    const client = getTableClient(TABLES.WORKSPACES);
    if (client) await client.createEntity(entity).catch(err => console.warn(err.message));
    await addLog(author, `Created workspace: "${entity.title}"`, 'Info');
    const members = defaultWorkspaceMembers(author);
    const newWs = { id, ...entity, members };
    fallbackState.workspaces.unshift(newWs);
    return newWs;
}

// ─── Task Methods ────────────────────────────────────────────────────────────
async function getTasks(workspaceId) {
    await ensureTablesExist();
    const client = getTableClient(TABLES.TASKS);
    if (!client) return fallbackState.tasks.filter(t => !workspaceId || t.workspaceId === workspaceId);
    try {
        const filter = workspaceId
            ? `PartitionKey eq 'tasks' and workspaceId eq '${workspaceId}'`
            : `PartitionKey eq 'tasks'`;
        const entities = client.listEntities({ queryOptions: { filter } });
        const results = [];
        for await (const entity of entities) {
            results.push({
                id: entity.rowKey,
                workspaceId: entity.workspaceId,
                title: entity.title,
                priority: entity.priority,
                status: entity.status,
                assignee: entity.assignee
            });
        }
        return results;
    } catch (err) {
        console.warn('⚠️ Task read error:', err.message);
        return fallbackState.tasks;
    }
}

async function createTask(taskData) {
    await ensureTablesExist();
    const id = `tsk-${Date.now()}`;
    const entity = {
        partitionKey: 'tasks',
        rowKey: id,
        workspaceId: taskData.workspaceId || '',
        title: taskData.title || 'New Task',
        priority: taskData.priority || 'Medium',
        status: taskData.status || 'Pending',
        assignee: taskData.assignee || 'Unassigned'
    };
    const client = getTableClient(TABLES.TASKS);
    if (client) await client.createEntity(entity).catch(err => console.warn(err.message));
    return { id, ...entity };
}

async function updateTaskStatus(taskId, status, updatedBy, deviceTag = '', sessionId = '') {
    await ensureTablesExist();
    const client = getTableClient(TABLES.TASKS);
    if (client) {
        try {
            const entity = await client.getEntity('tasks', taskId);
            entity.status = status;
            await client.updateEntity(entity, 'Merge');
        } catch (err) {
            console.warn('⚠️ Task update error:', err.message);
        }
    }
    const user = (updatedBy || 'User') + (deviceTag ? ` (${deviceTag})` : '');
    await addLog(user, `Updated task "${taskId}" status to ${status}`, 'Info', sessionId);
    return { id: taskId, status };
}

// ─── Audit Log Methods ───────────────────────────────────────────────────────
async function getLogs() {
    await ensureTablesExist();
    const client = getTableClient(TABLES.LOGS);
    if (!client) return fallbackState.logs;
    try {
        const entities = client.listEntities({ queryOptions: { filter: `PartitionKey eq 'logs'` } });
        const results = [];
        for await (const entity of entities) {
            results.push({
                id: entity.rowKey,
                timestamp: entity.logTimestamp,
                user: entity.user,
                action: entity.action,
                severity: entity.severity,
                sessionId: entity.sessionId || ''
            });
        }
        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
    } catch (err) {
        console.warn('⚠️ Log read error:', err.message);
        return fallbackState.logs;
    }
}

async function addLog(user, action, severity = 'Info', param4 = '', param5 = '') {
    await ensureTablesExist();
    const id = uuidv4();

    // Dynamically resolve parameter formats:
    // Call format A: addLog(user, action, severity, sessionId) -> param4 = sessionId
    // Call format B: addLog(user, action, severity, deviceTag, sessionId) -> param4 = deviceTag, param5 = sessionId
    let sessionId = '';
    let deviceTag = '';
    if (param5 !== '' && param5 !== undefined) {
        deviceTag = param4 || '';
        sessionId = param5 || '';
    } else {
        sessionId = param4 || '';
    }

    let finalUser = user || 'User';
    if (deviceTag && !finalUser.includes(deviceTag)) {
        finalUser = `${finalUser} (${deviceTag})`;
    }

    const entity = {
        partitionKey: 'logs',
        rowKey: id,
        user: finalUser,
        action,
        severity,
        sessionId: sessionId || '',
        logTimestamp: new Date().toISOString()
    };
    const client = getTableClient(TABLES.LOGS);
    if (client) {
        await client.createEntity(entity).catch(err => {
            console.warn('⚠️ Log write error:', err.message);
            fallbackState.logs.unshift({ id, timestamp: entity.logTimestamp, user: finalUser, action, severity, sessionId });
        });
    } else {
        fallbackState.logs.unshift({ id, timestamp: entity.logTimestamp, user: finalUser, action, severity, sessionId });
    }
    return { id, timestamp: entity.logTimestamp, user: finalUser, action, severity, sessionId };
}

async function clearLogs() {
    const client = getTableClient(TABLES.LOGS);
    if (client) {
        try {
            const entities = client.listEntities({ queryOptions: { filter: `PartitionKey eq 'logs'` } });
            for await (const entity of entities) {
                await client.deleteEntity('logs', entity.rowKey).catch(() => { });
            }
        } catch (err) {
            console.warn('⚠️ Log clear error:', err.message);
        }
    }
    fallbackState.logs = [];
    return [];
}

// ─── AI Code Review Methods ──────────────────────────────────────────────────
async function getAiCodeReviews() {
    await ensureTablesExist();
    const client = getTableClient(TABLES.AI_REVIEWS);
    if (!client) return fallbackState.aiCodeReviews;
    try {
        const entities = client.listEntities({ queryOptions: { filter: `PartitionKey eq 'reviews'` } });
        const results = [];
        for await (const entity of entities) {
            results.push({
                id: entity.rowKey,
                timestamp: entity.reviewTimestamp,
                codeSnippet: entity.codeSnippet,
                feedback: entity.feedback,
                securityScore: entity.securityScore
            });
        }
        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (err) {
        return fallbackState.aiCodeReviews;
    }
}

async function addAiCodeReview(codeSnippet, feedback, securityScore) {
    await ensureTablesExist();
    const id = uuidv4();
    const entity = {
        partitionKey: 'reviews',
        rowKey: id,
        codeSnippet: (codeSnippet || '').substring(0, 1000),
        feedback,
        securityScore,
        reviewTimestamp: new Date().toISOString()
    };
    const client = getTableClient(TABLES.AI_REVIEWS);
    if (client) await client.createEntity(entity).catch(() => { });
    return { id, timestamp: entity.reviewTimestamp, codeSnippet, feedback, securityScore };
}

// ─── In-Memory Fallback ──────────────────────────────────────────────────────
const fallbackState = {
    workspaces: SEED_WORKSPACES.map(ws => ({
        id: ws.rowKey,
        title: ws.title,
        description: ws.description,
        category: ws.category,
        status: ws.status,
        author: ws.author,
        createdAt: ws.createdAt,
        members: defaultWorkspaceMembers(ws.author)
    })),
    tasks: SEED_TASKS.map(t => ({ id: t.rowKey, workspaceId: t.workspaceId, title: t.title, priority: t.priority, status: t.status, assignee: t.assignee })),
    logs: [],
    aiCodeReviews: []
};

// Azure Table Storage-backed workspace lookup with in-memory fallback
async function getWorkspaceById(id) {
    await ensureTablesExist();
    const client = getTableClient(TABLES.WORKSPACES);
    if (client) {
        try {
            const entity = await client.getEntity('workspaces', id);
            if (entity) {
                return {
                    id: entity.rowKey,
                    title: entity.title,
                    description: entity.description,
                    category: entity.category,
                    status: entity.status,
                    author: entity.author,
                    createdAt: entity.createdAt,
                    members: defaultWorkspaceMembers(entity.author)
                };
            }
        } catch (err) {
            // Not found in table or table query failed, fall back to memory
        }
    }
    const mem = fallbackState.workspaces.find(w => w.id === id);
    if (mem) {
        return {
            ...mem,
            members: mem.members && mem.members.length > 0 ? mem.members : defaultWorkspaceMembers(mem.author)
        };
    }
    return null;
}

module.exports = {
    getWorkspaces,
    getWorkspaceById,
    createWorkspace,
    getTasks,
    createTask,
    updateTaskStatus,
    getLogs,
    addLog,
    clearLogs,
    getAiCodeReviews,
    addAiCodeReview
};
