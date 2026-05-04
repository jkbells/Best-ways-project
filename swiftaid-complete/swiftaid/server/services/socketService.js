/**
 * Socket.io Service
 * Handles all real-time communication:
 * - Driver location updates
 * - Booking status broadcasts
 * - Trip tracking
 */

const Ambulance = require('../models/Ambulance');

module.exports = (io) => {
  // Namespace for drivers
  const driverNS = io.of('/driver');
  // Namespace for users/passengers
  const userNS = io.of('/user');

  // ─── User Namespace ─────────────────────────────────────────────────────────
  userNS.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // User joins their personal room (bookingId) to receive updates
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking:${bookingId}`);
      console.log(`  → Joined booking room: booking:${bookingId}`);
    });

    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking:${bookingId}`);
    });

    socket.on('disconnect', () => {
      console.log(`👤 User disconnected: ${socket.id}`);
    });
  });

  // ─── Driver Namespace ────────────────────────────────────────────────────────
  driverNS.on('connection', (socket) => {
    console.log(`🚑 Driver connected: ${socket.id}`);

    // Driver registers with their ambulance ID
    socket.on('driver_register', async ({ ambulanceId }) => {
      try {
        await Ambulance.findByIdAndUpdate(ambulanceId, { socketId: socket.id });
        socket.data.ambulanceId = ambulanceId;
        socket.join(`ambulance:${ambulanceId}`);
        console.log(`  → Ambulance ${ambulanceId} registered`);
      } catch (err) {
        console.error('Driver register error:', err.message);
      }
    });

    /**
     * Driver sends location update → broadcast to all users tracking this booking
     * Payload: { ambulanceId, latitude, longitude, bookingId }
     */
    socket.on('location_update', async ({ ambulanceId, latitude, longitude, bookingId }) => {
      try {
        // Persist latest location to DB (debounced in production)
        await Ambulance.findByIdAndUpdate(ambulanceId, {
          currentLocation: { type: 'Point', coordinates: [longitude, latitude] },
        });

        // Broadcast to the user tracking this booking
        userNS.to(`booking:${bookingId}`).emit('driver_location', {
          latitude,
          longitude,
          ambulanceId,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    });

    /**
     * Driver updates booking status (arrived, started, completed)
     */
    socket.on('status_update', ({ bookingId, status }) => {
      userNS.to(`booking:${bookingId}`).emit('booking_status_update', {
        bookingId,
        status,
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', async () => {
      console.log(`🚑 Driver disconnected: ${socket.id}`);
      if (socket.data.ambulanceId) {
        await Ambulance.findByIdAndUpdate(socket.data.ambulanceId, {
          socketId: null,
        }).catch(() => {});
      }
    });
  });

  // Utility: emit booking update to user room (called from controllers)
  io.emitBookingUpdate = (bookingId, event, data) => {
    userNS.to(`booking:${bookingId}`).emit(event, data);
  };

  return io;
};
