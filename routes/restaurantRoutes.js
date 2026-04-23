import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createRestaurantValidator,
  updateRestaurantValidator,
  getRestaurantValidator
} from '../validators/restaurantValidator.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantValidator, validate, getRestaurantById);
router.get('/:id/menu', getRestaurantValidator, validate, getRestaurantMenu);
router.post('/', protect, authorize('restaurant', 'admin'), createRestaurantValidator, validate, createRestaurant);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateRestaurantValidator, validate, updateRestaurant);
router.delete('/:id', getRestaurantValidator, validate, protect, authorize('restaurant', 'admin'), deleteRestaurant);

export default router;
