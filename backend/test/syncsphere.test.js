const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

const { runSecurityScan } = require('../src/controllers/aiController');
const keyVaultService = require('../src/services/keyVaultService');
const stateStore = require('../src/services/stateStoreService');
const { JWT_SECRET } = require('../src/middleware/authMiddleware');

test('🔐 Cloud Security Heuristic Scanner Tests', async (t) => {
    await t.test('detects insecure HTTP connection strings and deducts points', () => {
        const insecureCode = `const conn = "DefaultEndpointsProtocol=http;AccountName=test;AccountKey=abc";`;
        const result = runSecurityScan(insecureCode);
        assert.ok(result.score < 100, 'Score should be penalized for HTTP');
        assert.ok(result.issues.some(i => i.includes('Insecure Connection')));
    });

    await t.test('detects hardcoded secrets and rewards Key Vault SecretClient usage', () => {
        const hardcoded = `const token = "secret_1234567890_abcdef";`;
        const scanHardcoded = runSecurityScan(hardcoded);
        assert.ok(scanHardcoded.issues.some(i => i.includes('Security Alert') || i.includes('Hardcoded credentials')));

        const enterpriseVault = `const client = new SecretClient(vaultUrl, credential);`;
        const scanVault = runSecurityScan(enterpriseVault);
        assert.ok(scanVault.issues.some(i => i.includes('Enterprise Grade') || i.includes('Azure Key Vault')));
    });

    await t.test('flags wildcard CORS as security risk', () => {
        const corsCode = `app.use(cors()); origin: "*"`;
        const result = runSecurityScan(corsCode);
        assert.ok(result.issues.some(i => i.includes('Permissive CORS')));
    });
});

test('🔑 Cryptographic JWT Authentication & Key Vault Service Tests', async (t) => {
    await t.test('signs and verifies valid JWT session token', () => {
        const payload = { email: 'tirupathi@cb.students.amrita.edu', role: 'Project Owner', sessionId: 'sess-123' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(token, JWT_SECRET);
        assert.strictEqual(decoded.email, payload.email);
        assert.strictEqual(decoded.sessionId, payload.sessionId);
    });

    await t.test('Key Vault normalizes secret names according to Azure naming conventions', () => {
        assert.strictEqual(keyVaultService.normalizeSecretName('AZURE_STORAGE_KEY'), 'AZURE-STORAGE-KEY');
        assert.strictEqual(keyVaultService.normalizeSecretName('MY_CUSTOM_SECRET'), 'MY-CUSTOM-SECRET');
    });
});

test('🗄️ State Store & Table Persistence Layer Tests', async (t) => {
    await t.test('retrieves workspaces with populated members', async () => {
        const workspaces = await stateStore.getWorkspaces();
        assert.ok(Array.isArray(workspaces), 'Workspaces should be an array');
        assert.ok(workspaces.length > 0, 'Should return at least seed workspaces');
        assert.ok(Array.isArray(workspaces[0].members), 'Workspace should have members array');
        assert.ok(workspaces[0].members.length > 0, 'Members should be populated');
    });

    await t.test('getWorkspaceById finds workspace without returning 404', async () => {
        const workspaces = await stateStore.getWorkspaces();
        const firstId = workspaces[0].id;
        const found = await stateStore.getWorkspaceById(firstId);
        assert.ok(found !== null, 'Workspace should be found by ID');
        assert.strictEqual(found.id, firstId);
    });

    await t.test('addLog correctly attributes user and sessionId across 4 and 5 parameter calls', async () => {
        const log5 = await stateStore.addLog('dev@cloud.com', 'Uploaded file', 'Success', '💻 Desktop', 'session-xyz');
        assert.strictEqual(log5.sessionId, 'session-xyz');
        assert.ok(log5.user.includes('💻 Desktop'));

        const log4 = await stateStore.addLog('admin@cloud.com', 'Created task', 'Info', 'session-abc');
        assert.strictEqual(log4.sessionId, 'session-abc');
    });
});
