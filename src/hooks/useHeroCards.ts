import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroCard {
  id: string;
  title: string;
  description: string;
  image_url: string;
  genre_tags: string[];
  dj_name?: string;
  day?: string;
  time?: string;
  destination_url?: string;
  destination_type: 'internal' | 'external';
  display_order: number;
  is_active: boolean;
}

/**
 * Get initial hero cards from window object (injected by server)
 */
function getInitialHeroCardsFromWindow(): HeroCard[] | null {
  if (typeof window === 'undefined') return null;
  
  const data = (window as any).__INITIAL_HERO_CARDS__;
  if (data && Array.isArray(data) && data.length > 0) {
    return data as HeroCard[];
  }
  
  return null;
}

export const useHeroCards = () => {
  // Check for initial data from window (injected by script)
  const initialData = getInitialHeroCardsFromWindow();
  
  return useQuery({
    queryKey: ['hero-cards'],
    queryFn: async () => {
      // Try to use Supabase Edge Function first (faster, cached)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        try {
          const response = await fetch(
            `${supabaseUrl}/functions/v1/get-hero-cards`,
            {
              method: 'GET',
              headers: {
                'apikey': supabaseKey,
              },
              cache: 'default',
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data) && data.length > 0) {
              return data as HeroCard[];
            }
          }
        } catch (error) {
          console.debug('Edge function fetch failed, trying direct query:', error);
        }
      }
      
      // Fallback to direct Supabase query
      const { data, error } = await supabase
        .from('hero_cards')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(10);
      
      if (error) {
        // Don't throw - return empty array so fallback data is used
        console.debug('Failed to fetch hero cards, using fallback:', error);
        return [];
      }
      return data as HeroCard[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Only retry once
    // Use initial data from window if available (0ms delay!)
    initialData: initialData || undefined,
    // Don't show loading state - always render immediately with fallback
    placeholderData: [],
  });
};

