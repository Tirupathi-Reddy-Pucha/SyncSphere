const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.storageBlob('processBlobUpload', {
    path: 'workspace-assets/{name}',
    connection: 'AzureWebJobsStorage',
    handler: async (blob, context) => {
        const blobName = context.triggerMetadata.name;
        const blobSize = blob ? blob.length : 0;
        const timestamp = new Date().toISOString();

        context.log(`⚡ [Serverless Event Worker] Triggered for blob: "${blobName}", Size: ${blobSize} bytes`);

        // Extract metadata and security classification
        const isArchive = /\.(zip|tar|gz|7z)$/i.test(blobName);
        const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(blobName);
        const isCode = /\.(js|py|json|html|css|ts)$/i.test(blobName);

        let fileTypeTag = 'Document';
        if (isArchive) fileTypeTag = 'Archive Package';
        else if (isImage) fileTypeTag = 'Image Asset';
        else if (isCode) fileTypeTag = 'Code Artifact';

        // Persist event into Azure Cosmos DB auditLogs container
        const endpoint = process.env.AZURE_COSMOS_ENDPOINT;
        const key = process.env.AZURE_COSMOS_KEY;

        if (endpoint && key) {
            try {
                const client = new CosmosClient({ endpoint, key });
                const container = client.database('syncspheredb').container('auditLogs');

                const auditDoc = {
                    id: `func-evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
                    user: '⚡ Azure Functions (Serverless Event Worker)',
                    action: `Serverless Event-Driven Process: analyzed "${blobName}" [${fileTypeTag}] (${(blobSize / 1024).toFixed(1)} KB)`,
                    level: 'Success',
                    severity: 'Success',
                    fileType: fileTypeTag,
                    blobName,
                    blobSizeBytes: blobSize,
                    timestamp
                };

                await container.items.create(auditDoc);
                context.log(`✅ [Serverless Event Worker] Logged event to Cosmos DB auditLogs: ${auditDoc.id}`);
            } catch (err) {
                context.error(`⚠️ Cosmos DB audit write error: ${err.message}`);
            }
        }
    }
});
