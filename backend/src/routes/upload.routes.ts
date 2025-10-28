import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { uploadImage, uploadImages, uploadDocument } from '../middleware/upload.middleware.js';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Upload single image
router.post('/image', uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to upload file' 
    });
  }
});

// Upload multiple images (max 5)
router.post('/images', uploadImages.array('images', 5), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({ files });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to upload files' 
    });
  }
});

// Upload document (admin/staff only)
router.post(
  '/document',
  authorize(['admin', 'staff']),
  uploadDocument.single('document'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      res.json({
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to upload file' 
      });
    }
  }
);

export default router;
