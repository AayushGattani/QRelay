const { containerClient } = require('../config/azure');

// Upload file buffer to Azure Blob Storage
const uploadToAzureBlob = async (buffer, blobName, mimeType) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType || 'application/octet-stream' },
  });
  return blockBlobClient.url;
};

// Delete file from Azure Blob Storage
const deleteFromAzureBlob = async (blobName) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    console.log(`Deleted blob: ${blobName}`);
  } catch (err) {
    console.error(`Failed to delete blob ${blobName}:`, err.message);
  }
};

// Download file from Azure Blob Storage
const downloadFromAzureBlob = async (blobName) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download(0);
    return downloadResponse;
  } catch (err) {
    console.error(`Failed to download blob ${blobName}:`, err.message);
    throw err;
  }
};

module.exports = {
  uploadToAzureBlob,
  deleteFromAzureBlob,
  downloadFromAzureBlob,
};
