const { v4: uuidv4 } = require('uuid');

// Generate a unique 6-character alphanumeric code
const generateCode = (existingCodes) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existingCodes.has(code));
  return code;
};

// Generate a safe blob name with UUID and sanitized filename
const generateBlobName = (code, originalFilename) => {
  const uniqueId = uuidv4();
  const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${code}/${uniqueId}-${safeName}`;
};

module.exports = {
  generateCode,
  generateBlobName,
};
