import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TransmissionHistory {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  play_started_at: string;
  duration: string | null;
  album_art_url: string | null;
  genre: string | null;
  year: string | null;
  artwork_id: string | null;
  listeners_count: number;
  created_at: string;
  dj_name: string | null;
  show_name: string | null;
}

interface UseTransmissionHistoryOptions {
  limit?: number;
  searchQuery?: string;
  selectedDate?: string;
  selectedHour?: string;
}

export const useTransmissionHistory = ({
  limit = 25,
  searchQuery = '',
  selectedDate = 'all',
  selectedHour = 'all',
}: UseTransmissionHistoryOptions = {}) => {
  const query = useQuery({
    queryKey: ['transmission-history', limit, searchQuery, selectedDate, selectedHour],
    queryFn: async () => {
      let query = supabase
        .from('transmissions')
        .select('*')
        .order('play_started_at', { ascending: false });

      // Always limit to last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      query = query.gte('play_started_at', sevenDaysAgo.toISOString());

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`);
      }

      // Add date filter with proper timezone handling
      if (selectedDate && selectedDate !== 'all') {
        // Parse the date string and set to start/end of day in local timezone
        const [year, month, day] = selectedDate.split('-').map(Number);
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        query = query
          .gte('play_started_at', startDate.toISOString())
          .lte('play_started_at', endDate.toISOString());
      }

      // Fetch more than needed to account for deduplication
      // We'll apply the actual limit after deduplication
      const fetchLimit = Math.max(limit * 5, 200); // Fetch 5x the limit to ensure enough after dedup
      query = query.limit(fetchLimit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transmission history:', error);
        throw error;
      }

      let filteredData = data as TransmissionHistory[];

      // Aggressive deduplication: Remove tracks with same artist+title within 10 minutes of each other
      const deduplicatedData: TransmissionHistory[] = [];
      const seenTracks = new Map<string, Date>();
      
      for (const transmission of filteredData) {
        const trackKey = `${transmission.artist.toLowerCase()}-${transmission.title.toLowerCase()}`;
        const playTime = new Date(transmission.play_started_at);
        
        // Check if we've seen this track recently
        const lastPlayTime = seenTracks.get(trackKey);
        
        if (!lastPlayTime) {
          // First time seeing this track
          deduplicatedData.push(transmission);
          seenTracks.set(trackKey, playTime);
        } else {
          // Check if this play is more than 10 minutes apart
          const timeDiff = Math.abs(playTime.getTime() - lastPlayTime.getTime());
          const tenMinutes = 10 * 60 * 1000;
          
          if (timeDiff > tenMinutes) {
            // Played more than 10 minutes apart, keep it
            deduplicatedData.push(transmission);
            seenTracks.set(trackKey, playTime);
          }
          // Otherwise skip this duplicate
        }
      }
      
      filteredData = deduplicatedData;

      // Client-side hour filtering (works across all dates in the 7-day range)
      if (selectedHour && selectedHour !== 'all') {
        const targetHour = parseInt(selectedHour);
        filteredData = filteredData.filter(transmission => {
          const playDate = new Date(transmission.play_started_at);
          return playDate.getHours() === targetHour;
        });
      }

      // Apply the actual limit after deduplication and filtering
      // This ensures we always show the requested number of tracks
      return filteredData.slice(0, limit);
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return {
    ...query,
    refetch: query.refetch,
  };
};
