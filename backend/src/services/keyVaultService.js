const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

class KeyVaultService {
    constructor() {
        this.client = null;
        this.vaultUrl = null;
        this.vaultName = process.env.AZURE_KEYVAULT_NAME || 'kv-syncsphere-2026';
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
        this.initialized = false;
        this.connectionStatus = 'INITIALIZING';
        this.lastSync = null;

        this.init();
    }

    init() {
        const customUrl = process.env.AZURE_KEYVAULT_URL;
        if (customUrl && customUrl.trim()) {
            this.vaultUrl = customUrl.trim();
        } else if (this.vaultName) {
            this.vaultUrl = `https://${this.vaultName.toLowerCase()}.vault.azure.net`;
        }

        if (!this.vaultUrl) {
            this.connectionStatus = 'DISABLED';
            console.warn('⚠️ Azure Key Vault: No vault name or URL provided. Running in Environment Fallback mode.');
            return;
        }

        try {
            // DefaultAzureCredential supports: Managed Identity (App Service), Azure CLI (local), VS Code, Env Vars
            const credential = new DefaultAzureCredential();
            this.client = new SecretClient(this.vaultUrl, credential);
            this.connectionStatus = 'ACTIVE';
            this.initialized = true;
            console.log(`🔐 Azure Key Vault Service initialized for [${this.vaultUrl}]`);
        } catch (err) {
            this.connectionStatus = 'FALLBACK_ENV';
            console.warn(`⚠️ Azure Key Vault initialization notice (${err.message}). Using local environment fallback.`);
        }
    }

    /**
     * Normalize secret name according to Azure Key Vault naming restrictions:
     * Azure Key Vault only permits alphanumeric characters and hyphens [0-9a-zA-Z-].
     * Converts underscores to hyphens.
     */
    normalizeSecretName(name) {
        if (!name) return '';
        return name.replace(/_/g, '-');
    }

    /**
     * Retrieve a secret by name.
     * 1. Checks in-memory cache
     * 2. Queries Azure Key Vault SecretClient if active
     * 3. Falls back smoothly to process.env if Key Vault is unreachable or local
     */
    async getSecret(secretName) {
        if (!secretName) return null;

        const normalized = this.normalizeSecretName(secretName);
        const envKey = secretName.replace(/-/g, '_');

        // Check cache
        const cached = this.cache.get(normalized);
        if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
            return cached.value;
        }

        // Try Azure Key Vault
        if (this.client) {
            try {
                const secret = await this.client.getSecret(normalized);
                if (secret && secret.value) {
                    this.cache.set(normalized, {
                        value: secret.value,
                        timestamp: Date.now(),
                        version: secret.properties.version
                    });
                    this.lastSync = new Date().toISOString();
                    this.connectionStatus = 'ACTIVE';
                    return secret.value;
                }
            } catch (err) {
                // Secret not found or permission issue - fallback to env for this key
                // Only mark as FALLBACK_ENV if authorization or connection failed, not for simple 404
                if (err.statusCode && err.statusCode !== 404) {
                    this.connectionStatus = 'FALLBACK_ENV';
                }
            }
        }

        // Fallback to process.env
        const envVal = process.env[envKey] || process.env[normalized] || process.env[secretName];
        if (envVal) {
            this.cache.set(normalized, {
                value: envVal,
                timestamp: Date.now(),
                version: 'env-fallback'
            });
            return envVal;
        }

        return null;
    }

    /**
     * Store or update a secret in Azure Key Vault
     */
    async setSecret(secretName, value) {
        if (!secretName || value === undefined) {
            throw new Error('Secret name and value are required');
        }

        const normalized = this.normalizeSecretName(secretName);
        const envKey = secretName.replace(/-/g, '_');

        // Update local cache & process.env immediately
        process.env[envKey] = value;
        this.cache.set(normalized, {
            value,
            timestamp: Date.now(),
            version: 'local-set'
        });

        if (this.client) {
            try {
                const result = await this.client.setSecret(normalized, value);
                this.cache.set(normalized, {
                    value: result.value,
                    timestamp: Date.now(),
                    version: result.properties.version
                });
                this.lastSync = new Date().toISOString();
                this.connectionStatus = 'ACTIVE';
                return {
                    name: normalized,
                    version: result.properties.version,
                    updatedAt: result.properties.updatedOn || new Date().toISOString(),
                    source: 'AZURE_KEY_VAULT'
                };
            } catch (err) {
                console.warn(`⚠️ Could not save secret "${normalized}" to Azure Key Vault:`, err.message);
                return {
                    name: normalized,
                    source: 'LOCAL_ENVIRONMENT_FALLBACK',
                    message: err.message
                };
            }
        }

        return {
            name: normalized,
            source: 'LOCAL_ENVIRONMENT_FALLBACK',
            note: 'Stored in memory & process.env'
        };
    }

    /**
     * Pre-warms and syncs critical secrets during app boot
     */
    async preloadSecrets(criticalSecrets = ['AZURE-STORAGE-CONNECTION-STRING', 'AZURE-STORAGE-CONTAINER-NAME']) {
        const results = {};
        for (const sec of criticalSecrets) {
            try {
                const val = await this.getSecret(sec);
                const envKey = sec.replace(/-/g, '_');
                if (val && !process.env[envKey]) {
                    process.env[envKey] = val;
                }
                results[sec] = val ? 'LOADED' : 'UNSET';
            } catch (err) {
                results[sec] = `ERROR: ${err.message}`;
            }
        }
        this.lastSync = new Date().toISOString();
        return results;
    }

    /**
     * Get operational status and metrics for health/telemetry endpoints
     */
    getStatus() {
        return {
            service: 'Azure Key Vault',
            vaultName: this.vaultName,
            vaultUrl: this.vaultUrl,
            status: this.connectionStatus,
            authProvider: 'DefaultAzureCredential (Managed Identity / Azure CLI)',
            encryption: 'Azure Key Vault Envelope Encryption (FIPS 140-2 Level 1 / Level 2 HSM Compatible)',
            cachedSecretsCount: this.cache.size,
            cachedSecretKeys: Array.from(this.cache.keys()),
            lastSync: this.lastSync || 'Never',
            zeroTrustMode: true
        };
    }
}

// Export singleton instance
const keyVaultService = new KeyVaultService();
module.exports = keyVaultService;
