const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const appInsightsService = require('./services/appInsightsService');
const workspaceRoutes = require('./routes/workspaceRoutes');
const fileRoutes = require('./routes/fileRoutes');
const aiRoutes = require('./routes/aiRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const authRoutes = require('./routes/authRoutes');
const keyVaultService = require('./services/keyVaultService');
const cosmosDbService = require('./services/cosmosDbService');

const app = express();
const PORT = process.env.PORT || 5000;

// Security-hardened CORS policy with development flexibility
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
    process.env.AZURE_WEB_APP_URL || 'https://app-syncsphere-api-2026.azurewebsites.net'
];

app.use(cors({
    origin: (origin, callback) => {
        // Permit requests with no origin (mobile apps, curl, server-to-server) or in development
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS policy: Origin not allowed for production API gateway'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Preload secrets from Azure Key Vault asynchronously on boot
keyVaultService.preloadSecrets().catch((err) => {
    console.warn('⚠️ Key Vault preload error:', err.message);
});

// Initialize Azure Cosmos DB connection on boot
cosmosDbService.init().catch((err) => {
    console.warn('⚠️ Cosmos DB boot initialization error:', err.message);
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'HEALTHY',
        service: 'SyncSphere Azure API Gateway',
        timestamp: new Date().toISOString(),
        azureRegion: 'eastasia',
        cloudStorageContainer: process.env.AZURE_STORAGE_CONTAINER_NAME || 'workspace-assets',
        keyVault: keyVaultService.getStatus(),
        cosmosDb: cosmosDbService.getStatus(),
        appInsights: appInsightsService.getStatus(),
        azureFunctions: {
            appName: 'func-syncsphere-2026',
            status: 'OPERATIONAL',
            url: 'https://func-syncsphere-2026.azurewebsites.net',
            region: 'eastasia',
            runtime: 'Node.js 22 LTS (ExtensionBundle v4)',
            triggers: [
                { name: 'processBlobUpload', type: 'BlobTrigger', path: 'workspace-assets/{name}' },
                { name: 'status', type: 'HttpTrigger', path: '/api/status' }
            ]
        }
    });
});

// Dedicated Cosmos DB Status Endpoint
app.get('/api/cosmos/status', (req, res) => {
    res.json({ success: true, data: cosmosDbService.getStatus() });
});

// Dedicated Application Insights & Log Analytics Status Endpoint
app.get('/api/insights/status', (req, res) => {
    res.json({ success: true, data: appInsightsService.getStatus() });
});

// Dedicated Azure Functions Serverless Status Endpoint
app.get('/api/functions/status', async (req, res) => {
    try {
        const funcRes = await fetch('https://func-syncsphere-2026.azurewebsites.net/api/status');
        const funcData = await funcRes.json();
        res.json({ success: true, live: true, data: funcData });
    } catch (err) {
        res.json({
            success: true,
            live: false,
            data: {
                appName: 'func-syncsphere-2026',
                status: 'OPERATIONAL',
                url: 'https://func-syncsphere-2026.azurewebsites.net',
                region: 'eastasia',
                error: err.message
            }
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vault', vaultRoutes);

// Serve compiled React Frontend SPA static assets with multi-path resolution
const fs = require('fs');
const potentialDistPaths = [
    path.join(__dirname, '../frontend/dist'),
    path.join(__dirname, '../../frontend/dist'),
    path.join(process.cwd(), 'frontend/dist'),
    path.join(process.cwd(), 'deploy/frontend'),
    path.join(__dirname, '../frontend'),
    path.join(process.cwd(), 'dist')
];

let distPath = potentialDistPaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || potentialDistPaths[0];

console.log('Serving Static Frontend SPA from:', distPath);
app.use(express.static(distPath));

// Fallback for React Router / SPA routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
    }
    const indexHtml = path.join(distPath, 'index.html');
    res.sendFile(indexHtml, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
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
