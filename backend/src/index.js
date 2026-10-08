const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const workspaceRoutes = require('./routes/workspaceRoutes');
const fileRoutes = require('./routes/fileRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'HEALTHY',
        service: 'SyncSphere Azure API Gateway',
        timestamp: new Date().toISOString(),
        azureRegion: 'eastus2',
        cloudStorageContainer: process.env.AZURE_STORAGE_CONTAINER_NAME || 'workspace-assets'
    });
});

// API Routes
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);

// Serve compiled React Frontend SPA static assets
const distPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// Fallback for React Router / SPA routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
    }
    const indexHtml = path.join(distPath, 'index.html');
    res.sendFile(indexHtml, (err) => {
        if (err) {
            res.json({
                name: 'SyncSphere Cloud Project Collaboration API',
                version: '1.0.0',
                documentation: '/health',
                status: 'ONLINE'
            });
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 SyncSphere API Server running on port ${PORT}`);
        console.log(`📡 Health Check Endpoint: http://localhost:${PORT}/health`);
    });
}

module.exports = app;
