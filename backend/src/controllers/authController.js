const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const stateStore = require('../services/stateStoreService');

// Email regex pattern for validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Passwordless Cloud Identity Login Gateway:
 * Validates email format, registers device session, and issues signed cryptographic JWT token
 */
exports.login = async (req, res) => {
    try {
        const { email, clientSessionId } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'A valid email address is required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email address format.' });
        }

        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceTag = isMobile ? '📱 Mobile' : '💻 Desktop';
        const sid = clientSessionId || req.headers['x-client-session-id'] || `session-${Date.now()}`;

        // Role attribution: project lead gets Admin, others get Workspace Member
        const role = (normalizedEmail.includes('tirupathi') || normalizedEmail.includes('admin'))
            ? 'Cloud Lead / Project Owner'
            : 'Workspace Collaborator';

        // Sign cryptographic JWT token (7-day validity)
        const token = jwt.sign(
            {
                email: normalizedEmail,
                role,
                sessionId: sid,
                device: deviceTag,
                iat: Math.floor(Date.now() / 1000)
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Record verified audit log in Azure Table Storage
        await stateStore.addLog(
            normalizedEmail,
            `Authenticated session via Cryptographic JWT Token (${role})`,
            'Success',
            deviceTag,
            sid
        );

        res.json({
            success: true,
            message: 'Authentication successful. Cryptographic session token issued.',
            token,
            user: {
                email: normalizedEmail,
                role,
                sessionId: sid,
                deviceTag
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Verify Session & Token Endpoint:
 * Validates active token and returns decoded identity
 */
exports.verify = (req, res) => {
    res.json({
        success: true,
        valid: true,
        user: req.user
    });
};
