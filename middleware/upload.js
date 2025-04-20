// middleware/upload.js
const multer = require('multer');
const path = require('path');

// تحديد مكان حفظ الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // حفظ الملفات في مجلد "public/uploads"
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // إنشاء اسم فريد لكل صورة باستخدام الطابع الزمني واسم الملف الأصلي
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName); // تعيين اسم الملف
  },
});

// تعريف الرفع باستخدام Multer مع القيود على الحجم ونوع الملف
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // الحد الأقصى لحجم الصورة 5MB
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png/; // الأنواع المدعومة (JPEG, JPG, PNG)
    const extname = types.test(path.extname(file.originalname).toLowerCase());
    const mimetype = types.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true); // السماح بالملفات المدعومة
    }
    cb(new Error('Only images are allowed')); // خطأ في حالة الملف غير المدعوم
  },
});

// دالة لرفع صورة واحدة
const uploadSingle = upload.single('image'); // رفع صورة واحدة

// دالة لرفع مجموعة من الصور
const uploadMultiple = upload.array('images', 10); // رفع مجموعة من الصور (حد أقصى 10 صور)

// تعيين الهوست في الرابط (يتم جلب الهوست من متغير بيئي)
const host = process.env.HOST_URL || 'http://localhost:5000'; // جلب الهوست من متغير بيئي أو استخدام localhost
const getFileUrl = (fileName) => `${host}/uploads/${fileName}`; // رابط الوصول للصورة

module.exports = { uploadSingle, uploadMultiple, getFileUrl };
