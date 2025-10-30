import { Request, Response } from 'express';
import { Sale } from '../models/sale.model.js';
import { Customer } from '../models/customer.model.js';
import { Product } from '../models/product.model.js';

// Create new sale
export const createSale = async (req: Request, res: Response) => {
  try {
    const { customerId, customerName, items, payments, notes, saleDate } = req.body;

    if (!customerId || !customerName || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer and items are required' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create sale
    const sale = await Sale.create({
      customerId,
      customerName,
      items,
      totalAmount,
      payments: payments || [],
      notes,
      saleDate: saleDate || new Date(),
      createdBy: (req as any).user._id
    });

    // Update customer stats
    await Customer.findByIdAndUpdate(customerId, {
      $inc: {
        totalPurchases: 1,
        totalSpent: totalAmount
      }
    });

    // Populate and return
    const populatedSale = await Sale.findById(sale._id)
      .populate('customerId', 'name phone email')
      .populate('items.productId', 'name serialNumber');

    res.status(201).json(populatedSale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sales
export const getSales = async (req: Request, res: Response) => {
  try {
    const { 
      q, 
      customerId, 
      status, 
      startDate, 
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;

    const query: any = {};

    // Search by customer name or serial number
    if (q) {
      query.$or = [
        { customerName: { $regex: q, $options: 'i' } },
        { 'items.serialNumber': { $regex: q, $options: 'i' } }
      ];
    }

    if (customerId) {
      query.customerId = customerId;
    }

    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) {
        query.saleDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.saleDate.$lte = new Date(endDate as string);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sales = await Sale.find(query)
      .populate('customerId', 'name phone email')
      .populate('createdBy', 'email profile')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Transform data to include customer object
    const transformedSales = sales.map((sale: any) => ({
      ...sale,
      customer: sale.customerId || {
        _id: sale.customerId,
        name: sale.customerName,
        phone: ''
      }
    }));

    const total = await Sale.countDocuments(query);

    res.json({
      sales: transformedSales,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get sale by ID
export const getSale = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customerId', 'name phone email address')
      .populate('createdBy', 'email profile');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Add payment to sale
export const addPayment = async (req: Request, res: Response) => {
  try {
    const { amount, method, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required' });
    }

    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Add payment
    sale.payments.push({
      amount,
      date: new Date(),
      method: method || 'cash',
      notes
    });

    await sale.save();

    const updatedSale = await Sale.findById(sale._id)
      .populate('customerId', 'name phone email');

    res.json(updatedSale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mark item as returned
export const returnItem = async (req: Request, res: Response) => {
  try {
    const { saleId, itemSerialNumber, returnReason } = req.body;

    if (!saleId || !itemSerialNumber) {
      return res.status(400).json({ message: 'Sale ID and item serial number are required' });
    }

    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Find and mark item as returned
    const item = sale.items.find(i => i.serialNumber === itemSerialNumber);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found in this sale' });
    }

    item.isReturned = true;
    item.returnDate = new Date();
    item.returnReason = returnReason;

    await sale.save();

    const updatedSale = await Sale.findById(sale._id)
      .populate('customerId', 'name phone email');

    res.json(updatedSale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update sale
export const updateSale = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('customerId', 'name phone email');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete sale
export const deleteSale = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Update customer stats
    await Customer.findByIdAndUpdate(sale.customerId, {
      $inc: {
        totalPurchases: -1,
        totalSpent: -sale.totalAmount
      }
    });

    await sale.deleteOne();

    res.json({ message: 'Sale deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Search products by serial number
export const searchProductBySerial = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.query;

    if (!serialNumber) {
      return res.status(400).json({ message: 'Serial number is required' });
    }

    const product = await Product.findOne({ 
      serialNumber: { $regex: new RegExp(serialNumber as string, 'i') } 
    });

    if (!product) {
      return res.json({ found: false, product: null });
    }

    res.json({ found: true, product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
