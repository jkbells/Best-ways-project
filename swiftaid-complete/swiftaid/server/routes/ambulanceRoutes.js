const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');
const { protect } = require('../middlewares/auth');

router.use(protect); // All ambulance routes require auth

router.get('/nearby', ambulanceController.getNearby);
router.get('/types', ambulanceController.getTypes);
router.get('/estimate', ambulanceController.getFareEstimate);

module.exports = router;
