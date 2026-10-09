// RISKY / VULNERABLE CODE SAMPLE (For Testing AI Security Scanner)
const express = require('express');
const cors = require('cors');

const app = express();

// 🚨 VULNERABILITY 1: Hardcoded Connection String with HTTP protocol
const connectionString = "DefaultEndpointsProtocol=http;AccountName=teststorageaccount;AccountKey=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890==";

// 🚨 VULNERABILITY 2: Permissive Wildcard CORS Policy
app.use(cors({ origin: '*' }));

// 🚨 VULNERABILITY 3: Hardcoded API Secret Token
const jwtSecretToken = "super_secret_hardcoded_jwt_private_key_12345";

app.get('/api/data', (req, res) => {
    res.json({ secret: jwtSecretToken, connection: connectionString });
});

app.listen(5000);
