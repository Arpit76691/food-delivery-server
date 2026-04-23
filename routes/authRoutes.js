import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidator, validate, updateProfile);

export default router;
