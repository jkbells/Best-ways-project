/**
 * App-wide constants
 */

// Replace with your machine's IP when running on physical device
export const API_BASE_URL = 'http://localhost:5000/api';
export const SOCKET_URL = 'http://localhost:5000';

// Map config — replace with your actual Google Maps API key
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Ambulance type display config (mirrors backend AMBULANCE_CONFIG)
export const AMBULANCE_TYPES = {
  basic: {
    label: 'Basic Ambulance',
    description: 'Trained EMT, First Aid',
    color: '#1565C0',
    bgColor: '#E3F2FD',
    icon: '🚑',
    baseFare: 500,
    perKm: 50,
    features: ['Oxygen', 'Stretcher', 'EMT', 'First Aid Kit'],
  },
  als: {
    label: 'Advanced Life Support',
    description: 'Paramedic on board',
    color: '#E65100',
    bgColor: '#FFF3E0',
    icon: '🚑',
    baseFare: 1000,
    perKm: 100,
    features: ['Defibrillator', 'Cardiac Monitor', 'IV Fluids', 'Paramedic'],
  },
  icu: {
    label: 'ICU Ambulance',
    description: 'Full intensive care',
    color: '#AD1457',
    bgColor: '#FCE4EC',
    icon: '🚑',
    baseFare: 2000,
    perKm: 150,
    features: ['Ventilator', 'ICU Setup', 'Doctor', 'Full Monitoring'],
  },
  neonatal: {
    label: 'Neonatal Ambulance',
    description: 'For newborns & infants',
    color: '#7B1FA2',
    bgColor: '#F3E5F5',
    icon: '🚑',
    baseFare: 1500,
    perKm: 120,
    features: ['Incubator', 'Neonatologist', 'Pulse Oximeter'],
  },
};

export const BOOKING_STATUS_LABELS = {
  searching: 'Searching for ambulance...',
  accepted: 'Ambulance assigned',
  arriving: 'Driver on the way',
  arrived: 'Ambulance arrived',
  in_progress: 'Trip in progress',
  completed: 'Trip completed',
  cancelled: 'Booking cancelled',
  no_drivers: 'No drivers available',
};

export const COLORS = {
  primary: '#E53935',       // Emergency red
  primaryDark: '#C62828',
  secondary: '#0D47A1',     // Trust blue
  secondaryDark: '#1565C0',
  background: '#FFFFFF',
  surface: '#F9F9F9',
  border: '#F0F0F0',
  text: '#0D0D0D',
  textSecondary: '#666666',
  textMuted: '#999999',
  success: '#2E7D32',
  successBg: '#E8F5E9',
  warning: '#E65100',
  warningBg: '#FFF3E0',
  error: '#C62828',
  errorBg: '#FFEBEE',
};

export const FONTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
