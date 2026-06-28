import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import {
  getAllUsers,
  getAllTransactions,
  toggleSuspendUser,
  getFraudAlerts,
  getAdminStats,
} from '../controllers/adminController.js';

const router = express.Router();

// Double-protect all admin routes
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.patch('/users/:id/suspend', toggleSuspendUser);
router.get('/fraud-alerts', getFraudAlerts);
router.get('/stats', getAdminStats);

export default router;
