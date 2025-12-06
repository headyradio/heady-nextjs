import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    city: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation not supported', loading: false }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get city name from reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
          
          setLocation({
            latitude,
            longitude,
            city,
            error: null,
            loading: false,
            permissionDenied: false,
          });
        } catch (err) {
          // Still set location even if city lookup fails
          setLocation({
            latitude,
            longitude,
            city: null,
            error: null,
            loading: false,
            permissionDenied: false,
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocation({
          latitude: null,
          longitude: null,
          city: null,
          error: error.message,
          loading: false,
          permissionDenied: error.code === error.PERMISSION_DENIED,
        });
      }
    );
  };

  return { location, requestLocation };
};
