const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  uploadFiles,
  getFileInfo,
  downloadFile,
  terminateSession,
  healthCheck,
} = require('../controllers/fileController');

// POST /upload — accepts multiple files
router.post('/upload', upload, uploadFiles);

// GET /file-info/:code — retrieve file info for a session
router.get('/file-info/:code', getFileInfo);

// GET /download/:code/:filename — download a specific file
router.get('/download/:code/:filename', downloadFile);

// DELETE /terminate/:code — immediately end a session
router.delete('/terminate/:code', terminateSession);

// GET /health — health check
router.get('/health', healthCheck);

module.exports = router;
