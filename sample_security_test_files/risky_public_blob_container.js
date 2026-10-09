// RISKY / VULNERABLE AZURE BLOB STORAGE SETUP
const { BlobServiceClient } = require('@azure/storage-blob');

// 🚨 VULNERABILITY 1: Hardcoded Account Key
const accountKey = "SecretAzureAccountKey1234567890abcdef==";
const connectionString = `DefaultEndpointsProtocol=https;AccountName=myblobacc;AccountKey=${accountKey}`;

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

async function createPublicContainer() {
    const containerClient = blobServiceClient.getContainerClient('public-assets');

    // 🚨 VULNERABILITY 2: Public Container Access Level
    // Setting access to 'container' makes all blobs in this container publicly readable to the internet!
    await containerClient.createIfNotExists({ access: 'container' });
    console.log("Public container created.");
}

createPublicContainer();
