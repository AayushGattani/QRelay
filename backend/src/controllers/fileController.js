const { MAX_TOTAL_SIZE, EXPIRY_MS } = require('../constants');
const { uploadToAzureBlob, downloadFromAzureBlob } = require('../services/azureService');
const { generateQRCode } = require('../services/qrService');
const { generateCode, generateBlobName } = require('../utils/helpers');
const {
  createSession,
  getSession,
  deleteSession,
  isSessionExpired,
  getAllSessions,
} = require('../services/sessionService');

// POST /upload — accept multiple files and create a session
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided.' });
    }

    const totalSize = req.files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return res.status(413).json({ error: 'Total file size exceeds the 10 MB limit.' });
    }

    const code = generateCode(getAllSessions());
    const uploadedFiles = [];

    // Upload each file to Azure
    for (const file of req.files) {
      const blobName = generateBlobName(code, file.originalname);
      await uploadToAzureBlob(file.buffer, blobName, file.mimetype);
      uploadedFiles.push({
        blobName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      });
    }

    // Create session
    createSession(code, uploadedFiles);

    // Generate QR code
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const downloadUrl = `${FRONTEND_URL}/download?code=${code}`;
    const qrCodeImage = await generateQRCode(downloadUrl);

    return res.status(200).json({
      code,
      qrCodeImage,
      expiresIn: EXPIRY_MS / 1000,
      files: uploadedFiles.map(f => ({ originalName: f.originalName, size: f.size })),
      totalSize,
    });
  } catch (err) {
    console.error('Upload error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'A file exceeds the 10 MB individual limit.' });
    }
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
};

// GET /file-info/:code — retrieve file info for a session
const getFileInfo = (req, res) => {
  const { code } = req.params;
  const entry = getSession(code.toUpperCase());

  if (!entry) {
    return res.status(404).json({ error: 'Invalid or expired code.' });
  }

  if (isSessionExpired(code.toUpperCase())) {
    deleteSession(code.toUpperCase());
    return res.status(410).json({ error: 'Session has expired.' });
  }

  const now = Date.now();
  return res.json({
    files: entry.files.map(f => ({ originalName: f.originalName, size: f.size })),
    expiresAt: entry.expiresAt,
    uploadedAt: entry.uploadedAt,
    timeLeft: Math.max(0, Math.floor((entry.expiresAt - now) / 1000)),
  });
};

// GET /download/:code/:filename — download a specific file
const downloadFile = async (req, res) => {
  const { code } = req.params;
  const filename = decodeURIComponent(req.params.filename);
  const entry = getSession(code.toUpperCase());

  if (!entry) {
    return res.status(404).json({ error: 'Invalid or expired code.' });
  }

  if (isSessionExpired(code.toUpperCase())) {
    await deleteSession(code.toUpperCase());
    return res.status(410).json({ error: 'Session has expired.' });
  }

  const fileEntry = entry.files.find(f => f.originalName === filename);
  if (!fileEntry) {
    return res.status(404).json({ error: 'File not found in this session.' });
  }

  try {
    const downloadResponse = await downloadFromAzureBlob(fileEntry.blobName);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileEntry.originalName)}"`
    );
    res.setHeader('Content-Type', downloadResponse.contentType || 'application/octet-stream');

    downloadResponse.readableStreamBody.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ error: 'Failed to download file.' });
  }
};

// DELETE /terminate/:code — immediately end a session
const terminateSession = async (req, res) => {
  const code = req.params.code.toUpperCase();
  const entry = getSession(code);

  if (!entry) {
    return res.status(404).json({ error: 'Session not found or already expired.' });
  }

  await deleteSession(code);
  return res.json({ message: 'Session terminated successfully.' });
};

// GET /health — health check endpoint
const healthCheck = (req, res) => {
  return res.json({ status: 'ok', sessions: getAllSessions().size });
};

module.exports = {
  uploadFiles,
  getFileInfo,
  downloadFile,
  terminateSession,
  healthCheck,
};
