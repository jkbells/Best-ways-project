const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.post('/send-otp',
  [body('phone').notEmpty().withMessage('Phone number required')],
  validate,
  authController.sendOTP
);

router.post('/verify-otp',
  [
    body('phone').notEmpty().withMessage('Phone required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  authController.verifyOTP
);

router.put('/setup-profile', protect, authController.setupProfile);
router.get('/me', protect, authController.getMe);

module.exports = router;
