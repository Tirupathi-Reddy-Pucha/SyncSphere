const keyVaultService = require('../services/keyVaultService');
const stateStore = require('../services/stateStoreService');

// Get Key Vault status and health metrics
exports.getVaultStatus = (req, res) => {
    try {
        const status = keyVaultService.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// List managed secrets (with sensitive values masked)
exports.listSecrets = async (req, res) => {
    try {
        const managedKeys = ['AZURE-STORAGE-CONNECTION-STRING', 'AZURE-STORAGE-CONTAINER-NAME'];
        const secrets = [];

        for (const key of managedKeys) {
            const val = await keyVaultService.getSecret(key);
            let masked = 'Not Configured';
            if (val) {
                if (val.length > 12) {
                    masked = `${val.substring(0, 8)}...${val.substring(val.length - 4)}`;
                } else {
                    masked = '••••••••';
                }
            }

            secrets.push({
                key,
                maskedValue: masked,
                isConfigured: !!val,
                status: val ? 'Active & Encrypted' : 'Missing',
                vaultName: keyVaultService.vaultName
            });
        }

        res.json({
            success: true,
            vault: keyVaultService.getStatus(),
            count: secrets.length,
            data: secrets
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Whitelist of permitted manageable cloud secrets
const ALLOWED_SECRET_PREFIXES = ['AZURE-', 'APP-', 'SYNCHSPHERE-'];
const FORBIDDEN_ENV_KEYS = ['PATH', 'NODE_OPTIONS', 'PORT', 'NODE_ENV', 'SHELL', 'COMSPEC'];

// Store or rotate a secret
exports.setSecret = async (req, res) => {
    try {
        const { secretName, secretValue } = req.body;
        const userEmail = req.user?.email || req.headers['x-user-email'] || 'Security Administrator';
        const sessionId = req.user?.sessionId || req.headers['x-client-session-id'] || '';

        if (!secretName || secretValue === undefined) {
            return res.status(400).json({ success: false, message: 'secretName and secretValue are required.' });
        }

        const normalizedName = keyVaultService.normalizeSecretName(secretName).toUpperCase();

        // Security check: prevent arbitrary system environment variable pollution
        if (FORBIDDEN_ENV_KEYS.includes(normalizedName.replace(/-/g, '_'))) {
            return res.status(403).json({ success: false, message: 'Security Alert: Modifying protected runtime environment keys is prohibited.' });
        }

        // Validate character set (Azure Key Vault accepts only 0-9a-zA-Z-)
        if (!/^[a-zA-Z0-9-]+$/.test(normalizedName)) {
            return res.status(400).json({ success: false, message: 'Invalid secret name. Key Vault allows only alphanumeric characters and hyphens.' });
        }

        const result = await keyVaultService.setSecret(normalizedName, secretValue);

        // Audit log in Azure Table Storage
        await stateStore.addLog(
            userEmail,
            `Rotated/Updated Azure Key Vault secret: [${normalizedName}]`,
            'Success',
            '🔐 Key Vault',
            sessionId
        );

        res.json({
            success: true,
            message: `Secret ${normalizedName} successfully updated.`,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Force cache refresh
exports.refreshSecrets = async (req, res) => {
    try {
        const results = await keyVaultService.preloadSecrets();
        res.json({
            success: true,
            message: 'Key Vault secrets refreshed and synced successfully.',
            data: results
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
