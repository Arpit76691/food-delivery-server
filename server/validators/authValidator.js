import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),

  body('role')
    .optional()
    .isIn(['customer', 'restaurant', 'delivery', 'admin']).withMessage('Invalid role')
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),

  body('address')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        if (value.street && value.street.length > 100) {
          throw new Error('Street address must be less than 100 characters');
        }
        if (value.city && value.city.length > 50) {
          throw new Error('City must be less than 50 characters');
        }
      }
      return true;
    })
];
