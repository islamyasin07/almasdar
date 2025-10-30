import express from 'express';
import { registerAdmin, loginAdmin, getAdminProfile, updateAdminProfile, deleteAdmin } from '../controllers/admin.controller';
import { adminAuth } from '../middleware/adminAuth.middleware';

const router = express.Router();

// Register admin
router.post('/register', registerAdmin);
// Login admin
router.post('/login', loginAdmin);
// Get admin profile
router.get('/profile/:id', adminAuth, getAdminProfile);
// Update admin profile
router.put('/profile/:id', adminAuth, updateAdminProfile);
// Delete admin
router.delete('/profile/:id', adminAuth, deleteAdmin);

export default router;
