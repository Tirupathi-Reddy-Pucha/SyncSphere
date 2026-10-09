const azureBlobService = require('../services/azureBlobService');
const stateStore = require('../services/stateStoreService');
const { runSecurityScan } = require('./aiController');

// Upload file to Azure Blob Storage with Automated Security Scan
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { originalname, buffer, mimetype } = req.file;

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
                    `🚨 Security Alert: Asset "${originalname}" uploaded with risks (Score: ${securityScan.score}/100)`,
                    'Warning'
                );
            } else {
                stateStore.addLog(
                    'Azure AI Security Scanner',
                    `✅ Asset "${originalname}" security scan passed (Score: ${securityScan.score}/100)`,
                    'Success'
                );
            }
        } else {
            stateStore.addLog('User', `Uploaded asset "${originalname}" (${(buffer.length / 1024).toFixed(1)} KB) to Azure Blob Storage`, 'Success');
        }

        res.status(201).json({
            success: true,
            message: `File "${originalname}" uploaded successfully to Azure Blob Storage!`,
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

// Delete blob from Azure Container
exports.deleteFile = async (req, res) => {
    try {
        const { blobName } = req.params;
        const deleted = await azureBlobService.deleteBlob(blobName);
        if (deleted) {
            stateStore.addLog('User', `Deleted asset "${blobName}" from Azure Blob Storage`, 'Info');
            res.json({ success: true, message: `Blob ${blobName} deleted successfully` });
        } else {
            res.status(404).json({ success: false, message: 'Blob not found or already deleted' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
