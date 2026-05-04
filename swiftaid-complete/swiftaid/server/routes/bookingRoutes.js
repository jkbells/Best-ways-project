const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.use(protect);

router.post('/create',
  [
    body('pickup.latitude').isNumeric(),
    body('pickup.longitude').isNumeric(),
    body('destination.latitude').isNumeric(),
    body('destination.longitude').isNumeric(),
    body('ambulanceType').isIn(['basic', 'als', 'icu', 'neonatal']),
    body('patient.name').notEmpty(),
  ],
  validate,
  bookingController.create
);

router.post('/emergency',
  [body('latitude').isNumeric(), body('longitude').isNumeric()],
  validate,
  bookingController.emergencyBooking
);

router.get('/history', bookingController.getHistory);
router.get('/:id', bookingController.getOne);
router.post('/update-status', bookingController.updateStatus);
router.post('/:id/rate', bookingController.rateBooking);

module.exports = router;
