/**
 * Utility functions used across the app
 */

/**
 * Format currency in PKR
 */
export const formatCurrency = (amount) =>
  `Rs. ${Number(amount).toLocaleString('en-PK')}`;

/**
 * Format distance in human-readable form
 */
export const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

/**
 * Format minutes to readable duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/**
 * Format a Date object to readable string
 */
export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/**
 * Truncate long strings with ellipsis
 */
export const truncate = (str, maxLen = 30) =>
  str?.length > maxLen ? `${str.slice(0, maxLen)}...` : str;

/**
 * Get status color based on booking status
 */
export const getStatusColor = (status) => {
  const map = {
    searching: '#E65100',
    accepted: '#1565C0',
    arriving: '#1565C0',
    arrived: '#2E7D32',
    in_progress: '#1565C0',
    completed: '#2E7D32',
    cancelled: '#C62828',
    no_drivers: '#C62828',
  };
  return map[status] || '#666';
};

export const getStatusBg = (status) => {
  const map = {
    searching: '#FFF3E0',
    accepted: '#E3F2FD',
    arriving: '#E3F2FD',
    arrived: '#E8F5E9',
    in_progress: '#E3F2FD',
    completed: '#E8F5E9',
    cancelled: '#FFEBEE',
    no_drivers: '#FFEBEE',
  };
  return map[status] || '#F5F5F5';
};

/**
 * Haversine distance (client-side estimate before API call)
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
