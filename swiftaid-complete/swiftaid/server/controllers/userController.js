/**
 * User Controller — profile management
 */

const User = require('../models/User');

exports.getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'bloodGroup', 'allergies', 'medicalConditions', 'emergencyContacts', 'fcmToken'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateFCMToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken: token });
    res.status(200).json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    next(error);
  }
};
