const { v4: uuidv4 } = require('uuid');

// In-Memory Cloud Project Store with seed data for instant evaluation & real-world workflow
const state = {
    workspaces: [
        {
            id: 'ws-101',
            title: 'Cloud Native Microservices Architecture',
            description: 'Azure App Service & Blob Storage Integration for Enterprise Collaboration',
            category: 'Cloud Engineering',
            status: 'In Progress',
            author: 'Tirupathi Reddy (Project Lead)',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            members: [
                { id: 'usr-1', name: 'Tirupathi Reddy', role: 'Cloud Architect', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
                { id: 'usr-2', name: 'DevOps Lead', role: 'DevOps & CI/CD Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
                { id: 'usr-3', name: 'AI Specialist', role: 'Azure AI & Security Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
            ]
        },
        {
            id: 'ws-102',
            title: 'Azure Serverless AI Workflow',
            description: 'Event-driven security scanner for cloud assets uploaded to Azure Blob Containers',
            category: 'Serverless & Security',
            status: 'Active',
            author: 'Cloud Team',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            members: [
                { id: 'usr-1', name: 'Tirupathi Reddy', role: 'Cloud Architect', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }
            ]
        }
    ],
    tasks: [
        { id: 'tsk-1', workspaceId: 'ws-101', title: 'Provision Azure Storage Account & Blob Container', priority: 'High', status: 'Completed', assignee: 'Tirupathi Reddy' },
        { id: 'tsk-2', workspaceId: 'ws-101', title: 'Configure App Service Free Tier (F1) Web App', priority: 'High', status: 'Completed', assignee: 'DevOps Lead' },
        { id: 'tsk-3', workspaceId: 'ws-101', title: 'Implement Real-Time Multi-User Collaborative Editor', priority: 'High', status: 'In Progress', assignee: 'Tirupathi Reddy' },
        { id: 'tsk-4', workspaceId: 'ws-101', title: 'Azure Application Insights Telemetry Dashboard', priority: 'Medium', status: 'In Progress', assignee: 'AI Specialist' }
    ],
    logs: [
        { id: 'log-1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), user: 'Tirupathi Reddy', action: 'Provisioned Storage Account stsyncsphere2026', severity: 'Info' },
        { id: 'log-2', timestamp: new Date(Date.now() - 1800000).toISOString(), user: 'Azure System', action: 'Blob Container workspace-assets verified active', severity: 'Success' },
        { id: 'log-3', timestamp: new Date().toISOString(), user: 'API Gateway', action: 'App Service app-syncsphere-api-2026 deployed successfully', severity: 'Success' }
    ],
    aiCodeReviews: [
        {
            id: 'rev-1',
            timestamp: new Date().toISOString(),
            codeSnippet: `const containerClient = blobServiceClient.getContainerClient('workspace-assets');\nawait containerClient.createIfNotExists();`,
            feedback: '✅ Azure Blob Storage Container initialization adheres to cloud SDK best practices. Ensure SAS tokens are used for client-side direct access.',
            securityScore: 95
        }
    ]
};

// Data Access Methods
const getWorkspaces = () => state.workspaces;
const getWorkspaceById = (id) => state.workspaces.find(w => w.id === id);
const createWorkspace = (data) => {
    const newWs = {
        id: `ws-${Date.now()}`,
        title: data.title,
        description: data.description || '',
        category: data.category || 'Cloud Engineering',
        status: 'In Progress',
        author: data.author || 'User',
        createdAt: new Date().toISOString(),
        members: data.members || []
    };
    state.workspaces.unshift(newWs);
    state.logs.unshift({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        user: data.author || 'User',
        action: `Created workspace: "${newWs.title}"`,
        severity: 'Info'
    });
    return newWs;
};

const getTasks = (workspaceId) => workspaceId ? state.tasks.filter(t => t.workspaceId === workspaceId) : state.tasks;
const createTask = (taskData) => {
    const newTask = {
        id: `tsk-${Date.now()}`,
        workspaceId: taskData.workspaceId,
        title: taskData.title,
        priority: taskData.priority || 'Medium',
        status: taskData.status || 'Pending',
        assignee: taskData.assignee || 'Unassigned'
    };
    state.tasks.push(newTask);
    return newTask;
};

const getLogs = () => state.logs;
const addLog = (user, action, severity = 'Info') => {
    const newLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        user,
        action,
        severity
    };
    state.logs.unshift(newLog);
    return newLog;
};

const getAiCodeReviews = () => state.aiCodeReviews;
const addAiCodeReview = (codeSnippet, feedback, securityScore) => {
    const review = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        codeSnippet,
        feedback,
        securityScore
    };
    state.aiCodeReviews.unshift(review);
    return review;
};

const updateTaskStatus = (taskId, status, updatedBy, deviceTag = '') => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.status = status;
        const user = (updatedBy || task.assignee || 'User') + (deviceTag ? ` (${deviceTag})` : '');
        state.logs.unshift({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            user: user,
            action: `Updated task "${task.title}" status to ${status}`,
            severity: 'Info'
        });
    }
    return task;
};

module.exports = {
    getWorkspaces,
    getWorkspaceById,
    createWorkspace,
    getTasks,
    createTask,
    updateTaskStatus,
    getLogs,
    addLog,
    getAiCodeReviews,
    addAiCodeReview
};
