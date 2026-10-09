// Secure Express Server Configuration (Production Ready)
const express = require('express');
const cors = require('cors');

const app = express();

// SECURE: Restrict allowed CORS origins to trusted domain
const allowedOrigins = ['https://app-syncsphere-api-2026.azurewebsites.net'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS policy'));
        }
    }
}));

// SECURE: Port retrieved from process.env
const PORT = process.env.PORT || 5000;

app.get('/health', (req, res) => {
    res.json({ status: 'Healthy', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server listening securely on port ${PORT}`);
});
