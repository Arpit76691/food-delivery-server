import { body, param } from 'express-validator';

const priceRangeValues = ['\u20B9', '\u20B9\u20B9', '\u20B9\u20B9\u20B9', '\u20B9\u20B9\u20B9\u20B9'];
const priceRangeMessage = 'Price range must be ₹, ₹₹, ₹₹₹, or ₹₹₹₹';

export const createRestaurantValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Restaurant name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

  body('cuisine')
    .optional()
    .isArray({ min: 1 }).withMessage('Cuisine must be an array with at least one item'),

  body('cuisine.*')
    .trim()
    .notEmpty().withMessage('Cuisine items cannot be empty'),

  body('priceRange')
    .optional()
    .isIn(priceRangeValues).withMessage(priceRangeMessage),

  body('deliveryTime')
    .optional()
    .trim(),

  body('address')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object' && value.city && value.city.length > 50) {
        throw new Error('City must be less than 50 characters');
      }
      return true;
    }),

  body('image')
    .optional()
    .isURL().withMessage('Image must be a valid URL')
];

export const updateRestaurantValidator = [
  param('id')
    .isMongoId().withMessage('Invalid restaurant ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

  body('priceRange')
    .optional()
    .isIn(priceRangeValues).withMessage(priceRangeMessage),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),

  body('image')
    .optional()
    .isURL().withMessage('Image must be a valid URL')
];

export const getRestaurantValidator = [
  param('id')
    .isMongoId().withMessage('Invalid restaurant ID')
];
