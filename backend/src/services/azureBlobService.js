const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'workspace-assets';

function getBlobServiceClient() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        console.warn('⚠️ AZURE_STORAGE_CONNECTION_STRING is missing in environment.');
        return null;
    }
    return BlobServiceClient.fromConnectionString(connectionString);
}

/**
 * Uploads a buffer directly to Azure Blob Storage
 */
async function uploadFileToBlob(fileBuffer, originalName, mimeType) {
    const blobServiceClient = getBlobServiceClient();
    if (!blobServiceClient) {
        throw new Error('Azure Storage connection string is missing.');
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'blob' });

    const blobName = `${Date.now()}-${originalName.replace(/\s+/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log(`Uploading file ${blobName} to Azure Blob Storage...`);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: { blobContentType: mimeType }
    });

    return {
        blobName,
        url: blockBlobClient.url,
        size: fileBuffer.length,
        uploadedAt: new Date().toISOString()
    };
}

/**
 * Lists all blobs inside the workspace container
 */
async function listWorkspaceBlobs() {
    const blobServiceClient = getBlobServiceClient();
    if (!blobServiceClient) return [];

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobs = [];

    try {
        for await (const blob of containerClient.listBlobsFlat()) {
            const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
            blobs.push({
                name: blob.name,
                url: blockBlobClient.url,
                size: blob.properties.contentLength,
                contentType: blob.properties.contentType,
                lastModified: blob.properties.lastModified
            });
        }
    } catch (err) {
        console.error('Error in listWorkspaceBlobs:', err.message);
    }

    return blobs;
}

/**
 * Deletes a blob from Azure Blob Storage
 */
async function deleteBlob(blobName) {
    const blobServiceClient = getBlobServiceClient();
    if (!blobServiceClient) return false;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blockBlobClient.deleteIfExists();
    return response.succeeded;
}

module.exports = {
    uploadFileToBlob,
    listWorkspaceBlobs,
    deleteBlob
};
