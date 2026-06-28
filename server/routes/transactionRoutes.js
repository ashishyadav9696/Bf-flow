import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTransactions, getTransactionById } from '../controllers/transactionHistoryController.js';

const router = express.Router();

// All transaction routes require authentication
router.use(protect);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);

export default router;
