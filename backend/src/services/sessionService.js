const { EXPIRY_MS } = require('../constants');
const { deleteFromAzureBlob } = require('./azureService');

// In-Memory Store
// Map<code, { files: [{blobName, originalName, size, mimeType}], expiresAt, uploadedAt, timerId }>
const fileStore = new Map();

// Create a new session
const createSession = (code, uploadedFiles) => {
  const expiresAt = Date.now() + EXPIRY_MS;
  const uploadedAt = Date.now();
  const timerId = scheduleExpiry(code, EXPIRY_MS);

  fileStore.set(code, {
    files: uploadedFiles,
    expiresAt,
    uploadedAt,
    timerId,
  });

  return {
    code,
    expiresAt,
    uploadedAt,
    files: uploadedFiles,
  };
};

// Get session info
const getSession = (code) => {
  return fileStore.get(code);
};

// Delete session and clean up blobs
const deleteSession = async (code) => {
  const entry = fileStore.get(code);
  if (!entry) return;

  if (entry.timerId) clearTimeout(entry.timerId);
  fileStore.delete(code);

  for (const f of entry.files) {
    await deleteFromAzureBlob(f.blobName);
  }
  console.log(`Session deleted: ${code} (${entry.files.length} file(s))`);
};

// Schedule session expiry
const scheduleExpiry = (code, delayMs) => {
  const timerId = setTimeout(async () => {
    if (fileStore.has(code)) {
      await deleteSession(code);
      console.log(`Expired & cleaned up session: ${code}`);
    }
  }, delayMs);
  return timerId;
};

// Check if session has expired
const isSessionExpired = (code) => {
  const entry = fileStore.get(code);
  if (!entry) return true;
  return Date.now() > entry.expiresAt;
};

// Get all sessions (for health check)
const getAllSessions = () => {
  return fileStore;
};

module.exports = {
  createSession,
  getSession,
  deleteSession,
  scheduleExpiry,
  isSessionExpired,
  getAllSessions,
  fileStore,
};
