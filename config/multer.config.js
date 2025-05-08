// config/multer.config.js
const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../lib/cloudinary');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const types = /jpeg|jpg|png/;
  const isImage = types.test(file.mimetype);
  if (isImage) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadSingle = async (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return next();

    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'users' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        Readable.from(req.file.buffer).pipe(stream);
      });

      req.imageUrl = result.secure_url; // حفظ الرابط المؤقت للصورة
      next();
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      res.status(500).json({ error: 'Image upload failed' });
    }
  });
};
const uploadMultiple = (req, res, next) => {
  upload.array('images', 10)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || req.files.length === 0) return next();

    try {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'multiple' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          Readable.from(file.buffer).pipe(stream);
        });
      });

      const imageUrls = await Promise.all(uploadPromises);
      req.imageUrls = imageUrls; // بنخزنهم في req.imageUrls
      next();
    } catch (uploadErr) {
      console.error('Cloudinary multi-upload error:', uploadErr);
      res.status(500).json({ error: 'Multiple image upload failed' });
    }
  });
};


module.exports = { uploadSingle, uploadMultiple };
