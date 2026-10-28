/**
 * Azure Cosmos DB Service (SQL / NoSQL API)
 * Enterprise-grade distributed NoSQL database for SyncSphere
 * Provides globally distributed, low-latency persistence for Workspaces, Tasks, and Audit Logs.
 */
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const keyVaultService = require('./keyVaultService');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_ID = 'syncspheredb';
const CONTAINERS = {
    WORKSPACES: 'workspaces',
    TASKS: 'tasks',
    LOGS: 'auditLogs'
};

const SEED_WORKSPACES = [
    {
        id: 'ws-101',
        title: 'Cloud Native Microservices Architecture',
        description: 'Azure App Service, Key Vault & Cosmos DB Integration for Enterprise Collaboration',
        category: 'Cloud Engineering',
        status: 'In Progress',
        author: 'Tirupathi Reddy (Project Lead)',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        members: [
            { id: 'usr-1', name: 'Tirupathi Reddy (Project Lead)', role: 'Lead Architect' },
            { id: 'usr-2', name: 'Cloud SecOps Lead', role: 'Security Reviewer' },
            { id: 'usr-3', name: 'Azure DevOps Specialist', role: 'CI/CD Engineer' }
        ]
    },
    {
        id: 'ws-102',
        title: 'Azure Serverless AI Workflow',
        description: 'Event-driven security scanner for cloud assets with Azure Key Vault Zero-Trust credentials',
        category: 'Serverless & Security',
        status: 'Active',
        author: 'Cloud Team',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        members: [
            { id: 'usr-1', name: 'Tirupathi Reddy', role: 'Lead Architect' },
            { id: 'usr-2', name: 'Cloud SecOps Lead', role: 'Security Reviewer' }
        ]
    }
];

const SEED_TASKS = [
    { id: 'tsk-1', workspaceId: 'ws-101', title: 'Provision Azure Key Vault & Secure JWT Secrets', priority: 'High', status: 'Completed', assignee: 'Tirupathi Reddy' },
    { id: 'tsk-2', workspaceId: 'ws-101', title: 'Integrate Azure Cosmos DB Distributed NoSQL Store', priority: 'High', status: 'Completed', assignee: 'DevOps Lead' },
    { id: 'tsk-3', workspaceId: 'ws-102', title: 'Connect App Service Managed Identity with RBAC', priority: 'High', status: 'Completed', assignee: 'Tirupathi Reddy' },
    { id: 'tsk-4', workspaceId: 'ws-102', title: 'Automated GitHub Actions CI/CD Pipeline', priority: 'High', status: 'In Progress', assignee: 'DevOps Lead' }
];

class CosmosDbService {
    constructor() {
        this.client = null;
        this.database = null;
        this.containers = {};
        this.status = 'DISCONNECTED';
        this.endpoint = null;
        this.databaseId = DATABASE_ID;
        this.initialized = false;
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) return this.initPromise;
        this.initPromise = this._doInit();
        return this.initPromise;
    }

    async _doInit() {
        try {
            // Check direct env vars or Key Vault cache
            let endpoint = process.env.AZURE_COSMOS_ENDPOINT || process.env.COSMOS_ENDPOINT;
            let key = process.env.AZURE_COSMOS_KEY || process.env.COSMOS_KEY;

            if (!endpoint && keyVaultService.cache.has('COSMOS-ENDPOINT')) {
                endpoint = keyVaultService.cache.get('COSMOS-ENDPOINT')?.value;
            }
            if (!key && keyVaultService.cache.has('COSMOS-KEY')) {
                key = keyVaultService.cache.get('COSMOS-KEY')?.value;
            }

            // Fallback: Check Key Vault asynchronously if client exists
            if (!endpoint || !key) {
                try {
                    const kvEndpoint = await keyVaultService.getSecret('COSMOS-ENDPOINT');
                    const kvKey = await keyVaultService.getSecret('COSMOS-KEY');
                    if (kvEndpoint) endpoint = kvEndpoint;
                    if (kvKey) key = kvKey;
                } catch (_) { }
            }

            // Default account fallback endpoint if configured
            if (!endpoint && (process.env.AZURE_COSMOS_ACCOUNT || process.env.COSMOS_ACCOUNT_NAME)) {
                const acc = process.env.AZURE_COSMOS_ACCOUNT || process.env.COSMOS_ACCOUNT_NAME;
                endpoint = `https://${acc}.documents.azure.com:443/`;
            }

            if (!endpoint || !key) {
                this.status = 'UNCONFIGURED';
                console.log('ℹ️ Azure Cosmos DB: Endpoint/Key not configured yet. Fallback to Azure Table Storage active.');
                return false;
            }

            this.endpoint = endpoint;
            this.client = new CosmosClient({ endpoint, key });

            // Create database if not exists
            const { database } = await this.client.databases.createIfNotExists({ id: DATABASE_ID });
            this.database = database;

            // Create containers with appropriate partition keys
            const { container: wsContainer } = await database.containers.createIfNotExists({
                id: CONTAINERS.WORKSPACES,
                partitionKey: { paths: ['/category'] }
            });
            this.containers[CONTAINERS.WORKSPACES] = wsContainer;

            const { container: taskContainer } = await database.containers.createIfNotExists({
                id: CONTAINERS.TASKS,
                partitionKey: { paths: ['/workspaceId'] }
            });
            this.containers[CONTAINERS.TASKS] = taskContainer;

            const { container: logContainer } = await database.containers.createIfNotExists({
                id: CONTAINERS.LOGS,
                partitionKey: { paths: ['/level'] }
            });
            this.containers[CONTAINERS.LOGS] = logContainer;

            // Seed initial data if workspaces container is empty
            await this._seedInitialData();

            this.status = 'CONNECTED';
            this.initialized = true;
            console.log(`🪐 Azure Cosmos DB connected to [${DATABASE_ID}] at ${endpoint}`);
            return true;
        } catch (err) {
            this.status = 'ERROR';
            console.warn(`⚠️ Azure Cosmos DB initialization error (${err.message}). Using Table Storage fallback.`);
            return false;
        }
    }

    async _seedInitialData() {
        try {
            const wsContainer = this.containers[CONTAINERS.WORKSPACES];
            const { resources } = await wsContainer.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
            const count = resources[0] || 0;
            if (count === 0) {
                for (const ws of SEED_WORKSPACES) {
                    await wsContainer.items.create(ws);
                }
                const taskContainer = this.containers[CONTAINERS.TASKS];
                for (const tsk of SEED_TASKS) {
                    await taskContainer.items.create(tsk);
                }
            }

            // Seed initial auditLogs if empty
            const logContainer = this.containers[CONTAINERS.LOGS];
            if (logContainer) {
                const { resources: logRes } = await logContainer.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
                if ((logRes[0] || 0) === 0) {
                    const seedLogs = [
                        {
                            id: `log-seed-1`,
                            user: 'admin@cloud.com',
                            action: 'Azure Key Vault & Cosmos DB NoSQL cluster initialized',
                            level: 'Success',
                            severity: 'Success',
                            sessionId: 'sys-init',
                            timestamp: new Date(Date.now() - 3600000).toISOString()
                        },
                        {
                            id: `log-seed-2`,
                            user: 'cb.sc.u4cse23568@cb.students.amrita.edu (💻 Desktop)',
                            action: 'Session authenticated via Cryptographic JWT Token (Lead Architect)',
                            level: 'Info',
                            severity: 'Info',
                            sessionId: 'sys-init',
                            timestamp: new Date().toISOString()
                        }
                    ];
                    for (const l of seedLogs) {
                        await logContainer.items.create(l);
                    }
                    console.log('✅ Azure Cosmos DB: Seeded initial auditLogs');
                }
            }
        } catch (err) {
            console.warn('⚠️ Cosmos DB seeding notice:', err.message);
        }
    }

    // ─── Workspaces ─────────────────────────────────────────────────────────────
    async getWorkspaces() {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.WORKSPACES]) return null;
        try {
            const querySpec = {
                query: 'SELECT * FROM c ORDER BY c.createdAt DESC'
            };
            const { resources } = await this.containers[CONTAINERS.WORKSPACES].items.query(querySpec).fetchAll();
            return resources;
        } catch (err) {
            console.warn('⚠️ Cosmos DB getWorkspaces query failed:', err.message);
            return null;
        }
    }

    async getWorkspaceById(id) {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.WORKSPACES]) return null;
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [{ name: '@id', value: id }]
            };
            const { resources } = await this.containers[CONTAINERS.WORKSPACES].items.query(querySpec).fetchAll();
            return resources[0] || null;
        } catch (err) {
            return null;
        }
    }

    async createWorkspace(data) {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.WORKSPACES]) return null;
        try {
            const ws = {
                id: data.id || `ws-${Date.now().toString(36)}`,
                title: data.title,
                description: data.description || '',
                category: data.category || 'General',
                status: data.status || 'Active',
                author: data.author || 'Tirupathi Reddy',
                createdAt: new Date().toISOString(),
                members: data.members || [
                    { id: 'usr-1', name: data.author || 'Tirupathi Reddy', role: 'Owner' }
                ]
            };
            const { resource } = await this.containers[CONTAINERS.WORKSPACES].items.create(ws);
            return resource;
        } catch (err) {
            console.warn('⚠️ Cosmos DB createWorkspace failed:', err.message);
            return null;
        }
    }

    // ─── Tasks ──────────────────────────────────────────────────────────────────
    async getTasks(workspaceId) {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.TASKS]) return null;
        try {
            let querySpec;
            if (workspaceId) {
                querySpec = {
                    query: 'SELECT * FROM c WHERE c.workspaceId = @workspaceId',
                    parameters: [{ name: '@workspaceId', value: workspaceId }]
                };
            } else {
                querySpec = { query: 'SELECT * FROM c' };
            }
            const { resources } = await this.containers[CONTAINERS.TASKS].items.query(querySpec).fetchAll();
            return resources;
        } catch (err) {
            return null;
        }
    }

    async createTask(data) {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.TASKS]) return null;
        try {
            const task = {
                id: data.id || `tsk-${Date.now().toString(36)}`,
                workspaceId: data.workspaceId,
                title: data.title,
                priority: data.priority || 'Medium',
                status: data.status || 'Pending',
                assignee: data.assignee || 'Unassigned',
                createdAt: new Date().toISOString()
            };
            const { resource } = await this.containers[CONTAINERS.TASKS].items.create(task);
            return resource;
        } catch (err) {
            return null;
        }
    }

    async updateTaskStatus(taskId, status, workspaceId) {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.TASKS]) return null;
        try {
            // Find task first
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [{ name: '@id', value: taskId }]
            };
            const { resources } = await this.containers[CONTAINERS.TASKS].items.query(querySpec).fetchAll();
            if (!resources || resources.length === 0) return null;

            const existing = resources[0];
            existing.status = status;
            existing.updatedAt = new Date().toISOString();

            const { resource } = await this.containers[CONTAINERS.TASKS].item(existing.id, existing.workspaceId).replace(existing);
            return resource;
        } catch (err) {
            return null;
        }
    }

    // ─── Audit Logs ────────────────────────────────────────────────────────────
    async addLog(logData) {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.LOGS]) return null;
        try {
            const logItem = {
                id: logData.id || `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
                user: logData.user,
                action: logData.action,
                level: logData.severity || logData.level || 'Info',
                severity: logData.severity || logData.level || 'Info',
                sessionId: logData.sessionId || '',
                timestamp: logData.timestamp || new Date().toISOString()
            };
            const { resource } = await this.containers[CONTAINERS.LOGS].items.create(logItem);
            return resource;
        } catch (err) {
            console.warn('⚠️ Cosmos DB addLog error:', err.message);
            return null;
        }
    }

    async getLogs(limit = 50) {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.LOGS]) return null;
        try {
            const querySpec = {
                query: 'SELECT TOP @limit * FROM c ORDER BY c.timestamp DESC',
                parameters: [{ name: '@limit', value: limit }]
            };
            const { resources } = await this.containers[CONTAINERS.LOGS].items.query(querySpec).fetchAll();
            return resources;
        } catch (err) {
            return null;
        }
    }

    async clearLogs() {
        await this.init();
        if (!this.initialized || !this.containers[CONTAINERS.LOGS]) return;
        try {
            const { resources } = await this.containers[CONTAINERS.LOGS].items.query('SELECT c.id, c.level FROM c').fetchAll();
            for (const item of resources) {
                await this.containers[CONTAINERS.LOGS].item(item.id, item.level).delete().catch(() => { });
            }
        } catch (_) { }
    }

    // ─── Health / Status ────────────────────────────────────────────────────────
    getStatus() {
        return {
            service: 'Azure Cosmos DB',
            status: this.status,
            database: this.databaseId,
            endpoint: this.endpoint || 'Not Configured',
            consistencyLevel: 'Session (Sub-10ms Read/Write SLA)',
            containers: Object.keys(this.containers),
            api: 'SQL (Core NoSQL API)',
            geoReplication: 'East Asia (Primary R/W)'
        };
    }
}

const cosmosDbService = new CosmosDbService();
module.exports = cosmosDbService;
