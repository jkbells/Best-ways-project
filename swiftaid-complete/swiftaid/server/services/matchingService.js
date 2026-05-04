/**
 * Matching Service
 * Finds nearest available ambulance and simulates driver acceptance
 */
const Booking = require('../models/Booking');
const Ambulance = require('../models/Ambulance');

/**
 * Find nearest available ambulance and simulate assignment
 * @param {string} bookingId
 * @param {string} ambulanceType
 * @param {{ latitude, longitude }} pickupCoords
 * @param {SocketIO.Server} io
 */
const findAndAssignDriver = async (bookingId, ambulanceType, pickupCoords, io) => {
  try {
    // Simulate search delay (1-3 seconds)
    await sleep(1500);

    // Find nearest available ambulance of requested type
    const ambulance = await Ambulance.findOne({
      type:     ambulanceType,
      status:   'available',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type:        'Point',
            coordinates: [pickupCoords.longitude, pickupCoords.latitude],
          },
          $maxDistance: 20000, // 20 km
        },
      },
    });

    const booking = await Booking.findById(bookingId).populate('userId', '_id');
    if (!booking || booking.status !== 'pending') return;

    const userId = booking.userId._id.toString();

    if (!ambulance) {
      // No ambulance found
      booking.status = 'cancelled';
      booking.cancelReason = 'No ambulances available';
      booking.cancelledBy  = 'system';
      booking.statusTimeline.push({ status: 'cancelled', timestamp: new Date() });
      await booking.save();

      io.to(`user_${userId}`).emit('booking:noDriver', {
        bookingId,
        message: 'No ambulances available in your area. Please try again.',
      });
      return;
    }

    // Simulate driver accepting (2 second delay)
    await sleep(2000);

    // Assign ambulance to booking
    booking.ambulanceId = ambulance._id;
    booking.status = 'accepted';
    booking.statusTimeline.push({ status: 'accepted', timestamp: new Date() });
    await booking.save();

    // Mark ambulance as busy
    await Ambulance.findByIdAndUpdate(ambulance._id, {
      status:           'en_route',
      currentBookingId: bookingId,
    });

    // Emit driver assigned event to user
    io.to(`user_${userId}`).emit('booking:driverAssigned', {
      bookingId,
      ambulance: {
        _id:          ambulance._id,
        driverName:   ambulance.driverName,
        driverPhone:  ambulance.driverPhone,
        driverRating: ambulance.driverRating,
        vehicleNumber:ambulance.vehicleNumber,
        type:         ambulance.type,
        features:     ambulance.features,
        location:     ambulance.location,
      },
      etaMins: 4,
    });

    // Start simulating ambulance moving toward pickup
    simulateAmbulanceMovement(ambulance, pickupCoords, booking, io, userId);

  } catch (err) {
    console.error('Matching error:', err.message);
  }
};

/**
 * Simulate ambulance moving toward pickup location
 * Emits location updates every 3 seconds
 */
const simulateAmbulanceMovement = async (ambulance, pickupCoords, booking, io, userId) => {
  const [startLng, startLat] = ambulance.location.coordinates;
  const { latitude: destLat, longitude: destLng } = pickupCoords;

  const steps = 8; // 8 steps * 3s = 24 seconds travel simulation
  for (let i = 1; i <= steps; i++) {
    await sleep(3000);

    // Re-check booking still active
    const freshBooking = await Booking.findById(booking._id);
    if (!freshBooking || ['cancelled', 'completed'].includes(freshBooking.status)) return;

    // Linear interpolation toward pickup
    const progress = i / steps;
    const curLat = startLat + (destLat - startLat) * progress;
    const curLng = startLng + (destLng - startLng) * progress;

    // Emit location update
    io.to(`user_${userId}`).emit('ambulance:location', {
      ambulanceId: ambulance._id,
      latitude:    curLat,
      longitude:   curLng,
      timestamp:   new Date(),
      etaMins:     Math.max(0, Math.ceil((steps - i) * 3 / 60)),
    });

    // Update DB location (every other step to reduce writes)
    if (i % 2 === 0) {
      await Ambulance.findByIdAndUpdate(ambulance._id, {
        location: { type: 'Point', coordinates: [curLng, curLat] },
      });
    }
  }

  // Ambulance arrived at pickup
  const freshBooking = await Booking.findById(booking._id);
  if (freshBooking && freshBooking.status === 'accepted') {
    freshBooking.status = 'arrived';
    freshBooking.statusTimeline.push({ status: 'arrived', timestamp: new Date() });
    await freshBooking.save();

    io.to(`user_${userId}`).emit('booking:statusUpdate', {
      bookingId:  booking._id,
      status:     'arrived',
      message:    'Ambulance has arrived at your location!',
    });
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { findAndAssignDriver };
