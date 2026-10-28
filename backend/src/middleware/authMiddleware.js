const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SyncSphere2026_CloudComputing_SuperSecureJwtSecret_Key!';

/**
 * Authentication Middleware:
 * Verifies signed JWT token from Authorization header (Bearer <token>)
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    let token = null;

    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else {
            token = authHeader.trim();
        }
    }

    if (!token) {
        // Fallback for transitional requests: check user email header if set
        const legacyEmail = req.headers['x-user-email'];
        if (legacyEmail) {
            req.user = { email: legacyEmail, role: 'Collaborator', isLegacy: true };
            return next();
        }
        return res.status(401).json({
            success: false,
            message: 'Access Denied: Missing cryptographic JWT authorization token.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired authentication token. Please sign in again.'
        });
    }
}

/**
 * Optional / Permissive Auth Middleware:
 * Populates req.user if a valid token exists, but doesn't block unauthenticated reads
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    let token = null;

    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else {
            token = authHeader.trim();
        }
    }

    if (token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
            req.userEmail = req.user.email;
        } catch {
            // Ignore invalid token on optional routes
        }
    }

    if (!req.user && req.headers['x-user-email']) {
        req.user = { email: req.headers['x-user-email'], role: 'Collaborator' };
        req.userEmail = req.headers['x-user-email'];
    }

    next();
}

module.exports = {
    authenticateToken,
    optionalAuth,
    JWT_SECRET
};
