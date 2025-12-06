import { useState, useEffect } from 'react';
import { MapPin, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';

interface Concert {
  venue: string;
  date: string;
  distance?: string;
  ticketLink?: string;
}

interface ConcertInfoProps {
  artist: string;
}

export const ConcertInfo = ({ artist }: ConcertInfoProps) => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { location, requestLocation } = useLocation();
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  useEffect(() => {
    if (location.latitude && location.longitude && artist && !hasRequestedLocation) {
      fetchConcerts();
    }
  }, [location.latitude, location.longitude, artist]);

  const fetchConcerts = async () => {
    if (!location.latitude || !location.longitude) return;
    
    setLoading(true);
    setError(null);
    setHasRequestedLocation(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('find-concerts', {
        body: {
          artist,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
        },
      });

      if (functionError) throw functionError;

      if (data?.concerts && data.concerts.length > 0) {
        setConcerts(data.concerts);
      }
    } catch (err) {
      console.error('Error fetching concerts:', err);
      setError('Unable to fetch concert information');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLocation = () => {
    requestLocation();
  };

  if (location.permissionDenied) {
    return null;
  }

  if (!location.latitude && !location.loading) {
    return (
      <div className="card-premium p-6 mt-6">
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-heading font-bold text-lg mb-2">See {artist} Live Near You</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your location to find upcoming concerts in your area
            </p>
            <Button onClick={handleRequestLocation} variant="default" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              Find Concerts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-premium p-6 mt-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm">Finding concerts near {location.city || 'you'}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (concerts.length === 0 && hasRequestedLocation && !loading) {
    return (
      <div className="card-premium p-6 mt-6">
        <div className="flex items-start gap-4">
          <Calendar className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-heading font-bold text-lg mb-2">No Upcoming Concerts Found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't find any upcoming concerts for {artist} near {location.city || 'your location'} at this time.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Check back later or search on Ticketmaster, Songkick, or Bandsintown for the latest tour dates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (concerts.length === 0) {
    return null;
  }

  return (
    <div className="card-premium p-6 mt-6">
      <div className="flex items-start gap-4 mb-4">
        <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
        <div>
          <h3 className="font-heading font-bold text-lg">Upcoming Concerts</h3>
          <p className="text-sm text-muted-foreground">
            {artist} near {location.city || 'you'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {concerts.map((concert, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg bg-background/50 border-2 border-border hover:border-primary transition-colors"
          >
            <div className="flex-1">
              <p className="font-bold">{concert.venue}</p>
              <p className="text-sm text-muted-foreground">{concert.date}</p>
              {concert.distance && (
                <p className="text-xs text-muted-foreground mt-1">{concert.distance}</p>
              )}
            </div>
            {concert.ticketLink && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={concert.ticketLink} target="_blank" rel="noopener noreferrer">
                  Tickets
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
