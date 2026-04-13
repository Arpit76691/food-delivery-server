import { body, param } from 'express-validator';

export const createMenuItemValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['appetizer', 'main', 'dessert', 'beverage', 'side']).withMessage('Invalid category'),

  body('restaurant')
    .optional()
    .isMongoId().withMessage('Invalid restaurant ID'),

  body('image')
    .optional()
    .isURL().withMessage('Image must be a valid URL'),

  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage('Preparation time must be between 1 and 120 minutes'),

  body('isVegetarian')
    .optional()
    .isBoolean().withMessage('isVegetarian must be a boolean'),

  body('isAvailable')
    .optional()
    .isBoolean().withMessage('isAvailable must be a boolean')
];

export const updateMenuItemValidator = [
  param('id')
    .isMongoId().withMessage('Invalid menu item ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .optional()
    .isIn(['appetizer', 'main', 'dessert', 'beverage', 'side']).withMessage('Invalid category'),

  body('image')
    .optional()
    .isURL().withMessage('Image must be a valid URL'),

  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage('Preparation time must be between 1 and 120 minutes'),

  body('isVegetarian')
    .optional()
    .isBoolean().withMessage('isVegetarian must be a boolean'),

  body('isAvailable')
    .optional()
    .isBoolean().withMessage('isAvailable must be a boolean')
];

export const getMenuItemValidator = [
  param('id')
    .isMongoId().withMessage('Invalid menu item ID')
];
