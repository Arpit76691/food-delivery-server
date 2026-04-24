import { body, param } from 'express-validator';

export const createOrderValidator = [
  body('items')
    .notEmpty().withMessage('Order items are required')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),

  body('items.*.menuItem')
    .notEmpty().withMessage('Menu item ID is required')
    .isMongoId().withMessage('Invalid menu item ID'),

  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 50 }).withMessage('Quantity must be between 1 and 50'),

  body('items.*.price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('items.*.name')
    .trim()
    .notEmpty().withMessage('Item name is required'),

  body('deliveryAddress')
    .notEmpty().withMessage('Delivery address is required')
    .custom((value) => {
      if (!value.street || !value.city) {
        throw new Error('Street and city are required in delivery address');
      }
      return true;
    }),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi']).withMessage('Payment method must be cash, card, or upi'),

  body('specialInstructions')
    .optional()
    .isLength({ max: 500 }).withMessage('Special instructions must be less than 500 characters'),

  body('estimatedDeliveryTime')
    .optional()
    .isISO8601().withMessage('Estimated delivery time must be a valid date')
];

export const updateOrderStatusValidator = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

export const assignDeliveryAgentValidator = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('agentId')
    .notEmpty().withMessage('Delivery agent ID is required')
    .isMongoId().withMessage('Invalid delivery agent ID')
];

export const getOrderValidator = [
  param('id')
    .isMongoId().withMessage('Invalid order ID')
];
