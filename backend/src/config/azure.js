const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_CONTAINER_NAME) {
  console.error('Missing Azure environment variables');
  process.exit(1);
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);

// Initialize container
const initializeContainer = async () => {
  try {
    await containerClient.createIfNotExists({ access: 'blob' });
    console.log(`Container "${AZURE_STORAGE_CONTAINER_NAME}" ready.`);
  } catch (err) {
    console.error('Failed to initialize container:', err.message);
  }
};

module.exports = {
  containerClient,
  initializeContainer,
  AZURE_STORAGE_CONTAINER_NAME,
};
