const QRCode = require('qrcode');
const { QR_CODE_WIDTH, QR_CODE_MARGIN } = require('../constants');

// Generate QR code as Data URL
const generateQRCode = async (downloadUrl) => {
  try {
    const qrCodeImage = await QRCode.toDataURL(downloadUrl, {
      width: QR_CODE_WIDTH,
      margin: QR_CODE_MARGIN,
    });
    return qrCodeImage;
  } catch (err) {
    console.error('Failed to generate QR code:', err.message);
    throw err;
  }
};

module.exports = {
  generateQRCode,
};
