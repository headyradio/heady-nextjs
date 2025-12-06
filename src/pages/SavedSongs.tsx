import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSavedSongs } from '@/hooks/useSavedSongs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Music, Heart } from 'lucide-react';
import { AlbumArtImage } from '@/components/AlbumArtImage';
import Navigation from '@/components/Navigation';

const SavedSongs = () => {
  const { user, loading: authLoading } = useAuth();
  const { savedSongs, isLoading, unsaveSong } = useSavedSongs(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const filteredSongs = savedSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saved Songs</h1>
            <p className="text-muted-foreground mt-1">
              {savedSongs.length} {savedSongs.length === 1 ? 'song' : 'songs'} saved
            </p>
          </div>
          <Heart className="h-8 w-8 text-primary fill-primary" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredSongs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No songs found' : 'No saved songs yet'}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Start exploring and save your favorite songs'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSongs.map((song) => (
              <Card
                key={song.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <div
                      className="flex-shrink-0"
                      onClick={() => navigate(`/song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`)}
                    >
                    <AlbumArtImage
                      artworkId={song.artwork_id}
                      url={song.album_art_url}
                      artist={song.artist}
                      title={song.title}
                      className="w-20 h-20 rounded-lg"
                    />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold truncate hover:underline cursor-pointer"
                        onClick={() => navigate(`/song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`)}
                      >
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist}
                      </p>
                      {song.album && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {song.album}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Saved {new Date(song.saved_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => unsaveSong.mutate({ artist: song.artist, title: song.title })}
                      disabled={unsaveSong.isPending}
                    >
                      <Heart className="h-5 w-5 fill-primary text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSongs;
