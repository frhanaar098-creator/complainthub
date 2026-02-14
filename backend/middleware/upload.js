import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads/complaints');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, png, gif, webp) and documents (pdf, doc, docx) are allowed'), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('attachments', 5);

export const uploadComplaintFiles = multerUpload;

export const maybeUploadComplaintFiles = (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    multerUpload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || 'File upload failed' });
      next();
    });
  } else {
    next();
  }
};
