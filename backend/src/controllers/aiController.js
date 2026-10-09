const stateStore = require('../services/stateStoreService');

// Reusable Security Scanner Heuristic Core
const runSecurityScan = (codeSnippet) => {
    const issues = [];
    let score = 100;

    if (/connectionString\s*=\s*['"]DefaultEndpointsProtocol=http;/i.test(codeSnippet)) {
        issues.push('⚠️ Insecure Connection: Azure Blob Storage connection string uses HTTP instead of HTTPS.');
        score -= 25;
    }
    if (/process\.env\.[A-Z0-9_]+/i.test(codeSnippet)) {
        issues.push('✅ Good Practice: Environment variables properly used for configuration settings.');
    } else if (/(key|secret|password|token)\s*=\s*['"][^'"]{8,}['"]/i.test(codeSnippet)) {
        issues.push('🚨 Security Alert: Hardcoded credentials or secrets detected. Move secrets to Azure Key Vault or environment variables.');
        score -= 40;
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
exports.analyzeCode = (req, res) => {
    try {
        const { codeSnippet } = req.body;
        if (!codeSnippet) {
            return res.status(400).json({ success: false, message: 'codeSnippet is required' });
        }

        const scanResult = runSecurityScan(codeSnippet);
        const reviewRecord = stateStore.addAiCodeReview(codeSnippet, scanResult.feedback, scanResult.score);
        stateStore.addLog('Azure AI Scanner', `Ran automated security audit (Score: ${scanResult.score}/100)`, scanResult.score < 70 ? 'Warning' : 'Success');

        res.json({
            success: true,
            data: reviewRecord
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.runSecurityScan = runSecurityScan;

// Get past AI Code Reviews
exports.getReviews = (req, res) => {
    try {
        const reviews = stateStore.getAiCodeReviews();
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
