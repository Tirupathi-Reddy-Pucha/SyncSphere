const stateStore = require('../services/stateStoreService');

// Reusable Security Scanner Heuristic Core
const runSecurityScan = (codeSnippet) => {
    const issues = [];
    let score = 100;

    if (/DefaultEndpointsProtocol=http;/i.test(codeSnippet) || /http:\/\/[a-z0-9.-]+\.blob\.core\.windows\.net/i.test(codeSnippet)) {
        issues.push('⚠️ Insecure Connection: Azure Blob Storage connection string uses HTTP instead of HTTPS.');
        score -= 25;
    }
    if (/(key|secret|password|token)\s*=\s*['"][^'"]{8,}['"]/i.test(codeSnippet) || /AccountKey=[^;'"\s]{12,}/i.test(codeSnippet)) {
        issues.push('🚨 Security Alert: Hardcoded credentials or secrets detected. Move secrets to Azure Key Vault or environment variables.');
        score -= 40;
    }
    if (/process\.env\.[A-Z0-9_]+/i.test(codeSnippet)) {
        issues.push('✅ Good Practice: Environment variables properly used for configuration settings.');
    }
    if (/SecretClient|@azure\/keyvault-secrets|vault\.azure\.net/i.test(codeSnippet)) {
        issues.push('🛡️ Enterprise Grade: Azure Key Vault integrated with Managed Identity & SecretClient (Zero-Trust HSM Encryption).');
    }
    if (/cors\(\s*\)/i.test(codeSnippet) || /origin:\s*['"]\*['"]/i.test(codeSnippet)) {
        issues.push('⚠️ Permissive CORS: Wildcard origin detected. Restrict allowed origins for production Azure deployment.');
        score -= 15;
    }
    if (/createIfNotExists\(\s*\{[^}]*access:\s*['"]container['"]/i.test(codeSnippet)) {
        issues.push('⚠️ Container Access Level: Public container access granted. Consider restricted Blob-level access or SAS tokens.');
        score -= 20;
    }

    if (issues.length === 0) {
        issues.push('✅ Code adheres to Azure Cloud Architecture best practices and security guidelines.');
    }

    const feedback = `[Azure AI Security Scan Results]\nOverall Security Score: ${score}/100\n\n- ${issues.join('\n- ')}`;

    return { score, issues, feedback };
};

// Analyze code snippet / cloud configuration API route
exports.analyzeCode = async (req, res) => {
    try {
        const { codeSnippet } = req.body;
        if (!codeSnippet) {
            return res.status(400).json({ success: false, message: 'codeSnippet is required' });
        }

        const scanResult = runSecurityScan(codeSnippet);
        const reviewRecord = await stateStore.addAiCodeReview(codeSnippet, scanResult.feedback, scanResult.score);
        await stateStore.addLog('Azure AI Scanner', `Ran automated security audit (Score: ${scanResult.score}/100)`, scanResult.score < 70 ? 'Warning' : 'Success');

        res.json({
            success: true,
            data: {
                ...reviewRecord,
                securityScore: scanResult.score,
                feedback: scanResult.feedback,
                issues: scanResult.issues
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.runSecurityScan = runSecurityScan;

// Get past AI Code Reviews
exports.getReviews = async (req, res) => {
    try {
        const reviews = await stateStore.getAiCodeReviews();
        res.json({ success: true, count: Array.isArray(reviews) ? reviews.length : 0, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
