const stateStore = require('../services/stateStoreService');

// Get all workspaces
exports.getAllWorkspaces = (req, res) => {
    try {
        const workspaces = stateStore.getWorkspaces();
        res.json({ success: true, count: workspaces.length, data: workspaces });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single workspace by ID
exports.getWorkspaceById = (req, res) => {
    try {
        const workspace = stateStore.getWorkspaceById(req.params.id);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }
        const tasks = stateStore.getTasks(req.params.id);
        res.json({ success: true, data: { ...workspace, tasks } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new workspace
exports.createWorkspace = (req, res) => {
    try {
        const { title, description, category, author } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const newWorkspace = stateStore.createWorkspace({
            title,
            description,
            category,
            author: author || 'Tirupathi Reddy',
            members: [
                { id: 'usr-1', name: author || 'Tirupathi Reddy', role: 'Project Owner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }
            ]
        });

        res.status(201).json({ success: true, data: newWorkspace });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get tasks
exports.getTasks = (req, res) => {
    try {
        const { workspaceId } = req.query;
        const tasks = stateStore.getTasks(workspaceId);
        res.json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create task
exports.createTask = (req, res) => {
    try {
        const { workspaceId, title, priority, assignee, clientSessionId: bodySid } = req.body;
        if (!title || !workspaceId) {
            return res.status(400).json({ success: false, message: 'Title and workspaceId are required' });
        }

        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceTag = isMobile ? '📱 Mobile' : '💻 Desktop';
        const sessionId = req.headers['x-client-session-id'] || bodySid || '';

        const newTask = stateStore.createTask({ workspaceId, title, priority, assignee });
        stateStore.addLog(assignee + ` (${deviceTag})`, `Created task "${title}" in workspace ${workspaceId}`, 'Info', sessionId);
        res.status(201).json({ success: true, data: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update task status
exports.updateTaskStatus = (req, res) => {
    try {
        const { taskId, status, updatedBy, clientSessionId: bodySid } = req.body;
        if (!taskId || !status) {
            return res.status(400).json({ success: false, message: 'taskId and status are required' });
        }

        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceTag = isMobile ? '📱 Mobile' : '💻 Desktop';
        const sessionId = req.headers['x-client-session-id'] || bodySid || '';

        const updatedTask = stateStore.updateTaskStatus(taskId, status, updatedBy, deviceTag, sessionId);
        res.json({ success: true, data: updatedTask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Log identity change event
exports.logIdentityChange = (req, res) => {
    try {
        const { oldEmail, newEmail, clientSessionId: bodySid } = req.body;
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceTag = isMobile ? '📱 Mobile' : '💻 Desktop';
        const sessionId = req.headers['x-client-session-id'] || bodySid || '';

        stateStore.addLog(
            `${oldEmail || 'User'} (${deviceTag})`,
            `Changed device account email identity from "${oldEmail || 'default'}" to "${newEmail}"`,
            'Warning',
            sessionId
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get System Audit Logs
exports.getLogs = (req, res) => {
    try {
        const logs = stateStore.getLogs();
        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
