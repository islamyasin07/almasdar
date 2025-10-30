import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  searchOrCreateCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customer.controller.js';

const router = Router();

// All routes require authentication and admin/staff role
router.use(authenticate, authorize(['admin', 'staff']));

router.post('/search-or-create', searchOrCreateCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
