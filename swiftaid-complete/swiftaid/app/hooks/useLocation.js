/**
 * useLocation — custom hook for managing device location
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);

      // Reverse geocode
      const [geo] = await Location.reverseGeocodeAsync(coords);
      if (geo) {
        setAddress(`${geo.street || geo.name || ''}, ${geo.city || geo.region || ''}`.replace(/^,\s*/, ''));
      }
      return coords;
    } catch (err) {
      setError('Failed to get location. Please enable GPS.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { requestLocation(); }, []);

  return { location, address, error, loading, requestLocation };
};

export default useLocation;
