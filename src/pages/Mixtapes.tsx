import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Download, Clock } from "lucide-react";
import { format } from "date-fns";

const Mixtapes = () => {
  const { data: mixtapes, isLoading } = useQuery({
    queryKey: ["mixtapes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mixtapes")
        .select("*")
        .eq("status", "published")
        .order("release_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour (aligned with ISR strategy)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Mixtapes - Curated Psychedelic Journeys"
        description="Curated psychedelic journeys and sonic explorations from HEADY.FM. Download and stream exclusive mixtapes featuring indie rock, alternative, and electronic music."
        url="https://heady.fm/mixtapes"
        type="website"
      />
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mixtapes</h1>
          <p className="text-muted-foreground">Curated psychedelic journeys and sonic explorations</p>
        </div>

        {isLoading ? (
          <p>Loading mixtapes...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mixtapes?.map((mixtape) => (
              <Card key={mixtape.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {mixtape.cover_art_url ? (
                  <img 
                    src={mixtape.cover_art_url} 
                    alt={mixtape.title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-muted flex items-center justify-center">
                    <Music className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{mixtape.title}</CardTitle>
                  <CardDescription>{mixtape.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mixtape.release_date && (
                    <p className="text-sm text-muted-foreground">
                      Released: {format(new Date(mixtape.release_date), "MMMM d, yyyy")}
                    </p>
                  )}
                  {mixtape.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{mixtape.duration_minutes} minutes</span>
                    </div>
                  )}
                  {mixtape.download_link && (
                    <Button className="w-full" variant="outline" asChild>
                      <a href={mixtape.download_link} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mixtapes;
