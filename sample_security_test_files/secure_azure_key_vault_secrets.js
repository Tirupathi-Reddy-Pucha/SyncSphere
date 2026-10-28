// Enterprise Azure Key Vault Secret Management (FIPS 140-2 Level 2 HSM)
// Eliminates plaintext secrets and credentials from code and configuration files.

const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

// Vault URI pointing to Microsoft Azure Key Vault
const keyVaultUrl = process.env.AZURE_KEYVAULT_URL || 'https://kv-syncsphere-2026.vault.azure.net';

// Authenticate securely via Managed Identity (Zero-Trust Identity)
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

async function getAzureStorageSecret() {
    try {
        console.log('Resolving secrets securely from Azure Key Vault...');
        const secret = await secretClient.getSecret('AZURE-STORAGE-CONNECTION-STRING');
        return secret.value;
    } catch (error) {
        console.error('Failed to retrieve secret from Key Vault:', error.message);
        throw error;
    }
}

module.exports = { getAzureStorageSecret };
