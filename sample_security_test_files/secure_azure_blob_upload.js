// Secure Azure Storage Blob Upload (Production Ready)
const { BlobServiceClient } = require('@azure/storage-blob');

// SECURE: Uses Environment Variables for connection credentials
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING environment variable is missing!");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

async function uploadSecureAsset(containerName, blobName, content) {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // SECURE: Private container creation (default access)
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(content, content.length);
    console.log(`Successfully uploaded ${blobName} securely.`);
}

module.exports = { uploadSecureAsset };
