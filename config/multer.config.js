const multer = require('multer');

const storageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images/');
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      uniquePrefix +
        '-' +
        file.fieldname +
        '.' +
        file.originalname.split('.')[1]
    );
  },
});

const fileFilterImage = (req, file, cb) => {
  if (
    file.mimetype !== 'image/jpeg' ||
    file.mimetype !== 'image/png' ||
    file.mimetype !== 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadImage = multer({
  storage: storageImage,
  fileFilter: fileFilterImage,
});

module.exports = {
  uploadImage,
};
