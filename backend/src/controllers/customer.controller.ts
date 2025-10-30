import { Request, Response } from 'express';
import { Customer } from '../models/customer.model.js';

// Search or create customer
export const searchOrCreateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    // Search for existing customer by name, phone, or email
    const query: any = { name: { $regex: new RegExp(name, 'i') } };
    
    if (phone) {
      query.$or = [
        { phone },
        { name: { $regex: new RegExp(name, 'i') } }
      ];
    }

    let customer = await Customer.findOne(query);

    // If not found, create new customer
    if (!customer) {
      customer = await Customer.create({
        name: name.trim(),
        phone: phone?.trim(),
        email: email?.trim()
      });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all customers
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer by ID
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
