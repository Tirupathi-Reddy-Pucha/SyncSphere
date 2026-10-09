const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

router.get('/', workspaceController.getAllWorkspaces);
router.get('/logs', workspaceController.getLogs);
router.get('/tasks', workspaceController.getTasks);
router.post('/tasks', workspaceController.createTask);
router.put('/tasks', workspaceController.updateTaskStatus);
router.get('/:id', workspaceController.getWorkspaceById);
router.post('/', workspaceController.createWorkspace);

module.exports = router;
