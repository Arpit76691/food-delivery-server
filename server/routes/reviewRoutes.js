import express from 'express';
import {
  getRestaurantReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getPendingReviews,
  approveReview,
  getReviewStats
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/restaurant/:restaurantId/stats', getReviewStats);

// Protected routes (Customers)
router.get('/my-reviews', protect, getMyReviews);
router.post('/', protect, authorize('customer'), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

// Admin routes
router.get('/admin/pending', protect, authorize('admin'), getPendingReviews);
router.put('/:id/approve', protect, authorize('admin'), approveReview);

export default router;
