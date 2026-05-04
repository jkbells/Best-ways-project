/**
 * Booking Controller
 * Full booking lifecycle: create, track, update, rate
 */

const { createBooking, updateBookingStatus } = require('../services/bookingService');
const Booking = require('../models/Booking');

/**
 * POST /api/bookings/create
 */
exports.create = async (req, res, next) => {
  try {
    const booking = await createBooking({
      userId: req.user._id,
      ...req.body,
    });

    // Emit real-time event to notify (if io available)
    if (req.io && booking.status === 'accepted') {
      req.io.emitBookingUpdate?.(booking._id.toString(), 'booking_accepted', {
        bookingId: booking._id,
        ambulance: booking.ambulance,
      });
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/:id
 */
exports.getOne = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('user', 'name phone')
      .populate('ambulance');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/history
 * Returns paginated booking history for the authenticated user
 */
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ user: req.user._id })
        .populate('ambulance', 'vehicleNumber type driver')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/update-status
 * Body: { bookingId, status }
 * Valid transitions: arriving → arrived → in_progress → completed | cancelled
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await updateBookingStatus(bookingId, status, req.user._id);

    // Broadcast status change via Socket.io
    if (req.io) {
      req.io.emitBookingUpdate?.(bookingId, 'booking_status_update', {
        bookingId,
        status,
        timestamp: Date.now(),
      });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/bookings/:id/rate
 * Body: { score, tags, comment }
 */
exports.rateBooking = async (req, res, next) => {
  try {
    const { score, tags, comment } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'completed' },
      { rating: { score, tags, comment, ratedAt: new Date() } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Completed booking not found' });
    }

    // Update driver's average rating (simplified)
    if (booking.ambulance) {
      const { Ambulance } = require('../models/Ambulance');
      // In production: calculate rolling average
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/emergency
 * One-tap SOS — minimal data required, auto-selects nearest basic ambulance
 */
exports.emergencyBooking = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const user = req.user;

    const booking = await createBooking({
      userId: user._id,
      pickup: {
        latitude,
        longitude,
        address: 'Current Location (Emergency)',
      },
      destination: {
        latitude: latitude + 0.01, // nearest hospital (mock)
        longitude: longitude + 0.01,
        address: 'Nearest Hospital',
      },
      ambulanceType: 'basic',
      patient: {
        name: user.name || 'Emergency Patient',
        condition: 'critical',
        notes: 'SOS Emergency Booking — dispatched automatically',
        passengerCount: 1,
      },
      paymentMethod: 'cash',
      isEmergency: true,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
