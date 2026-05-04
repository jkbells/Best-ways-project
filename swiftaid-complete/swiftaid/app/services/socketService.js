/**
 * Socket.io Client Service
 * Manages real-time connection to backend for live tracking
 */

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

let userSocket = null;

/**
 * Connect to the user namespace
 * Call this after authentication
 */
export const connectUserSocket = () => {
  if (userSocket?.connected) return userSocket;

  userSocket = io(`${SOCKET_URL}/user`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  userSocket.on('connect', () => console.log('🔌 Socket connected:', userSocket.id));
  userSocket.on('disconnect', (reason) => console.log('🔌 Socket disconnected:', reason));
  userSocket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return userSocket;
};

/**
 * Join a booking room to receive real-time updates for that trip
 */
export const joinBookingRoom = (bookingId) => {
  if (!userSocket?.connected) connectUserSocket();
  userSocket.emit('join_booking', bookingId);
  console.log(`📡 Joined booking room: ${bookingId}`);
};

/**
 * Leave booking room when trip ends or user leaves tracking screen
 */
export const leaveBookingRoom = (bookingId) => {
  userSocket?.emit('leave_booking', bookingId);
};

/**
 * Listen for driver location updates
 * @param {Function} callback - receives { latitude, longitude, timestamp }
 */
export const onDriverLocation = (callback) => {
  userSocket?.on('driver_location', callback);
};

/**
 * Listen for booking status changes
 */
export const onBookingStatusUpdate = (callback) => {
  userSocket?.on('booking_status_update', callback);
};

/**
 * Remove specific event listeners (cleanup on unmount)
 */
export const offDriverLocation = () => {
  userSocket?.off('driver_location');
};

export const offBookingStatusUpdate = () => {
  userSocket?.off('booking_status_update');
};

/**
 * Disconnect socket (on logout)
 */
export const disconnectSocket = () => {
  userSocket?.disconnect();
  userSocket = null;
};

export const getSocket = () => userSocket;
