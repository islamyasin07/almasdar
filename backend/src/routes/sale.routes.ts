import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  createSale,
  getSales,
  getSale,
  addPayment,
  returnItem,
  updateSale,
  deleteSale,
  searchProductBySerial
} from '../controllers/sale.controller.js';

const router = Router();

// All routes require authentication and admin/staff role
router.use(authenticate, authorize(['admin', 'staff']));

router.get('/search-product', searchProductBySerial);
router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSale);
router.post('/:id/payment', addPayment);
router.post('/return-item', returnItem);
router.put('/:id', updateSale);
router.delete('/:id', deleteSale);

export default router;
