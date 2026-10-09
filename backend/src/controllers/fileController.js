const azureBlobService = require('../services/azureBlobService');
const stateStore = require('../services/stateStoreService');
const { runSecurityScan } = require('./aiController');

// Upload file to Azure Blob Storage with Automated Security Scan & Email Attribution
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { originalname, buffer, mimetype } = req.file;
        const userEmail = req.headers['x-user-email'] || req.body.uploaderEmail || 'Authenticated User';
        const sessionId = req.headers['x-client-session-id'] || '';

        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceTag = isMobile ? '📱 Mobile' : '💻 Desktop';

        // Upload directly to Azure Blob Container
        const blobResult = await azureBlobService.uploadFileToBlob(buffer, originalname, mimetype);

        // Automated AI Security Scan for code / config text files
        let securityScan = null;
        const isTextOrCode = mimetype.startsWith('text/') ||
            /\.(js|ts|py|json|yml|yaml|env|sql|bicep|tf|html|css|txt|sh)$/i.test(originalname);

        if (isTextOrCode && buffer) {
            const fileContent = buffer.toString('utf-8');
            securityScan = runSecurityScan(fileContent);

            if (securityScan.score < 80) {
                stateStore.addLog(
                    'Azure AI Security Scanner',
                    `🚨 Security Alert: Asset "${originalname}" uploaded by ${userEmail} (${deviceTag}) with risks (Score: ${securityScan.score}/100)`,
                    'Warning',
                    deviceTag,
                    sessionId
                );
            } else {
                stateStore.addLog(
                    userEmail,
                    `Uploaded asset "${originalname}" (${(buffer.length / 1024).toFixed(1)} KB) to Azure Storage (${deviceTag}) [Security Score: ${securityScan.score}/100]`,
                    'Success',
                    deviceTag,
                    sessionId
                );
            }
        } else {
            stateStore.addLog(
                userEmail,
                `Uploaded asset "${originalname}" (${(buffer.length / 1024).toFixed(1)} KB) to Azure Storage (${deviceTag})`,
                'Success',
                deviceTag,
                sessionId
            );
        }

        res.status(201).json({
            success: true,
            message: `File "${originalname}" uploaded successfully by ${userEmail}!`,
            data: blobResult,
            securityScan
        });
    } catch (error) {
        console.error('File upload error:', error);
        stateStore.addLog('System', `File upload failed: ${error.message}`, 'Error');
        res.status(500).json({ success: false, message: error.message });
    }
};

// List all files from Azure Blob Storage Container
exports.listFiles = async (req, res) => {
    try {
        const blobs = await azureBlobService.listWorkspaceBlobs();
        res.json({ success: true, count: blobs.length, data: blobs });
    } catch (error) {
        console.error('Error listing blobs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete blob from Azure Container with User Email attribution
exports.deleteFile = async (req, res) => {
    try {
        const { blobName } = req.params;
        const userEmail = req.headers['x-user-email'] || req.body.uploaderEmail || 'Authenticated User';
        const sessionId = req.headers['x-client-session-id'] || '';

        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceTag = isMobile ? '📱 Mobile' : '💻 Desktop';

        const deleted = await azureBlobService.deleteBlob(blobName);
        if (deleted) {
            stateStore.addLog(
                userEmail,
                `Deleted asset "${blobName}" from Azure Storage (${deviceTag})`,
                'Info',
                deviceTag,
                sessionId
            );
            res.json({ success: true, message: `Blob ${blobName} deleted successfully` });
        } else {
            res.status(404).json({ success: false, message: 'Blob not found or already deleted' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
