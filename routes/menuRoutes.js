import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createMenuItemValidator,
  updateMenuItemValidator,
  getMenuItemValidator
} from '../validators/menuValidator.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemValidator, validate, getMenuItemById);
router.post('/', protect, authorize('restaurant', 'admin'), createMenuItemValidator, validate, createMenuItem);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateMenuItemValidator, validate, updateMenuItem);
router.delete('/:id', getMenuItemValidator, validate, protect, authorize('restaurant', 'admin'), deleteMenuItem);

export default router;
