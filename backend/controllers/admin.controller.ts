import Admin, { IAdmin } from '../models/admin.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { env } from '../config/env';

// Register a new admin
export async function registerAdmin(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Admin already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = new Admin({ email, password: hashedPassword, name });
    await admin.save();
    res.status(201).json({ message: 'Admin account created', admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
}

// Login admin
export async function loginAdmin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }
    // Issue JWT
    const token = jwt.sign({ id: admin._id, role: admin.role }, env.jwtSecret, { expiresIn: '2h' });
    res.json({ message: 'Login successful', token, admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
}

// Get admin profile
export async function getAdminProfile(req: Request, res: Response) {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }
    res.json(admin);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
}

// Update admin profile
export async function updateAdminProfile(req: Request, res: Response) {
  try {
    const adminId = req.params.id;
    const { name, email, password } = req.body;
    const update: Partial<IAdmin> = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (password) update.password = await bcrypt.hash(password, 12);
    const admin = await Admin.findByIdAndUpdate(adminId, update, { new: true }).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }
    res.json(admin);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
}

// Delete admin account
export async function deleteAdmin(req: Request, res: Response) {
  try {
    const adminId = req.params.id;
    const deleted = await Admin.findByIdAndDelete(adminId);
    if (!deleted) {
      return res.status(404).json({ error: 'Admin not found.' });
    }
    res.json({ message: 'Admin deleted.' });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
}
