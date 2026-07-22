const multer = require('multer');
const { MAX_FILE_SIZE, MAX_FILES } = require('../constants');

// Configure multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!file) {
      cb(new Error('No file provided'));
    } else {
      cb(null, true);
    }
  },
});

module.exports = upload.array('files', MAX_FILES);
