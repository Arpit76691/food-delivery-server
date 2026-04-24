import express from 'express';
import {
  getAllOrders,
  createOrder,
  getCustomerOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryAgent,
  getDeliveryAgentOrders
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderValidator,
  updateOrderStatusValidator,
  assignDeliveryAgentValidator,
  getOrderValidator
} from '../validators/orderValidator.js';

const router = express.Router();


router.post('/', protect, createOrderValidator, validate, createOrder);
router.get('/customer/myorders', protect, getCustomerOrders);
router.get('/restaurant/:restaurantId', protect, getRestaurantOrders);
router.get('/delivery/myorders', protect, getDeliveryAgentOrders);
router.get('/:id', protect, getOrderValidator, validate, getOrderById);
router.put('/:id/status', protect, updateOrderStatusValidator, validate, updateOrderStatus);
router.put('/:id/assign', protect, assignDeliveryAgentValidator, validate, assignDeliveryAgent);

export default router;
