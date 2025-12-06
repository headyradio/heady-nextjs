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

export const useHeroCards = () => {
  return useQuery({
    queryKey: ['hero-cards'],
    queryFn: async () => {
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
    // Don't show loading state - always render immediately with fallback
    placeholderData: [],
  });
};

