import { Request, Response } from 'express';
import { Sale } from '../models/sale.model.js';
import { Customer } from '../models/customer.model.js';
import { Product } from '../models/product.model.js';
import ExcelJS from 'exceljs';

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

// Export a customer's sales to Excel
export const exportCustomerSalesExcel = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.query as { customerId?: string };
    if (!customerId) {
      return res.status(400).json({ message: 'customerId is required' });
    }

    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const sales = await Sale.find({ customerId })
      .sort({ saleDate: -1 })
      .lean();

    // Aggregate totals
    const totals = sales.reduce(
      (acc: any, s: any) => {
        acc.totalSales += s.totalAmount || 0;
        acc.totalPaid += s.paidAmount || 0;
        acc.totalRemaining += s.remainingAmount || 0;
        return acc;
      },
      { totalSales: 0, totalPaid: 0, totalRemaining: 0 }
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AlMasdar';
    const summary = workbook.addWorksheet('Summary');
    const wsSales = workbook.addWorksheet('Sales');
    const wsPayments = workbook.addWorksheet('Payments');

    // Summary sheet
    summary.addRow(['Customer Name', customer.name || '']);
    summary.addRow(['Phone', customer.phone || '']);
    summary.addRow(['Email', (customer as any).email || '']);
    summary.addRow([]);
    summary.addRow(['Total Sales', totals.totalSales]);
    summary.addRow(['Total Paid', totals.totalPaid]);
    summary.addRow(['Total Remaining', totals.totalRemaining]);
    summary.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Value', key: 'value', width: 40 }
    ];
    summary.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });

    // Sales sheet
    wsSales.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Serial', key: 'serial', width: 22 },
      { header: 'Product', key: 'product', width: 38 },
      { header: 'Qty', key: 'qty', width: 8 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Total', key: 'total', width: 14 },
      { header: 'Returned', key: 'returned', width: 12 },
      { header: 'Return Reason', key: 'reason', width: 40 }
    ];

    sales.forEach((s: any) => {
      const date = new Date(s.saleDate || s.createdAt).toISOString().slice(0, 19).replace('T', ' ');
      (s.items || []).forEach((it: any) => {
        wsSales.addRow({
          date,
          serial: it.serialNumber,
          product: it.productName,
          qty: it.quantity,
          price: it.price,
          total: (it.price || 0) * (it.quantity || 1),
          returned: it.isReturned ? 'Yes' : 'No',
          reason: it.returnReason || ''
        });
      });
    });

    // Payments sheet
    wsPayments.columns = [
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Method', key: 'method', width: 18 },
      { header: 'Amount', key: 'amount', width: 14 }
    ];
    sales.forEach((s: any) => {
      (s.payments || []).forEach((p: any) => {
        const d = new Date(p.date).toISOString().slice(0, 19).replace('T', ' ');
        wsPayments.addRow({ date: d, method: p.method, amount: p.amount });
      });
    });

    // Prepare response
    const fileName = `${(customer.name || 'customer').replace(/[^a-zA-Z0-9-_ ]/g, '')}_sales.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream workbook to response to avoid memory issues and ensure correct headers
    await workbook.xlsx.write(res as any);
    return res.end();
  } catch (error: any) {
    console.error('Export Excel error', error);
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
