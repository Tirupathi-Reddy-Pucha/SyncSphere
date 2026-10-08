const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Multer memory storage for direct buffer streaming to Azure Blob SDK
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB file upload limit
});

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.listFiles);
router.delete('/:blobName', fileController.deleteFile);

module.exports = router;
