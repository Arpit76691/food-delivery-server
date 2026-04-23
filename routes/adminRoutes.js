import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllRestaurants,
  approveRestaurant,
  deleteRestaurant,
  getAllOrders,
  updateOrderStatus,
  assignDeliveryAgent,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAnalytics
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Restaurants management
router.get('/restaurants', getAllRestaurants);
router.put('/restaurants/:id/approve', approveRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

// Orders management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/assign', assignDeliveryAgent);

// Menu items management
router.get('/menu', getAllMenuItems);
router.post('/menu', createMenuItem);
router.put('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);

export default router;
