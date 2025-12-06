import { useParams, Link } from "react-router-dom";
import { useArtistDetails, useArtistContent } from "@/hooks/useArtistDetails";
import { useLastfmArtistData } from "@/hooks/useLastfmArtistData";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { generateArtistStructuredData, generateBreadcrumbStructuredData } from "@/lib/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Clock, Radio, Users, Disc } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlbumArtImage } from "@/components/AlbumArtImage";
import SaveSongButton from "@/components/SaveSongButton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ArtistPage = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const { data: artistDetails, isLoading: isLoadingDetails } = useArtistDetails(artistName || "");
  const { data: artistContent, isLoading: isLoadingContent } = useArtistContent(artistName || "");
  const { data: lastfmData, isLoading: isLoadingLastfm } = useLastfmArtistData(artistName || "");

  console.log('Last.fm data:', lastfmData);

  if (isLoadingDetails) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  if (!artistDetails) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h2 className="text-2xl font-bold mb-2">Artist Not Found</h2>
              <p className="text-muted-foreground mb-4">
                No information found for this artist.
              </p>
              <Link to="/" className="text-primary hover:underline">
                Return to Home
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // SEO metadata
  const artistUrl = `https://heady.fm/artist/${encodeURIComponent(artistDetails.artist)}`;
  const artistImage = lastfmData?.image_url || 'https://heady.fm/og-image.png';
  const artistDescription = 
    artistContent || 
    lastfmData?.bio?.summary?.replace(/<[^>]*>/g, '').substring(0, 160) ||
    `${artistDetails.artist} - ${artistDetails.totalPlays} plays, ${artistDetails.totalUniqueSongs} unique songs on HEADY.FM. Listen to commercial-free indie rock radio.`;

  // Structured data
  const artistStructuredData = generateArtistStructuredData({
    name: artistDetails.artist,
    image: artistImage,
    url: artistUrl,
    description: artistDescription,
    totalPlays: artistDetails.totalPlays,
    uniqueSongs: artistDetails.totalUniqueSongs,
  });

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://heady.fm' },
    { name: artistDetails.artist, url: artistUrl },
  ]);

  // Combine structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [artistStructuredData, breadcrumbStructuredData],
  };

  return (
    <>
      <SEO
        title={artistDetails.artist}
        description={artistDescription}
        image={artistImage}
        url={artistUrl}
        type="profile"
        canonical={artistUrl}
        structuredData={structuredData}
      />
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{artistDetails.artist}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Artist Header with Image */}
        <div className="mb-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-64 h-64 flex-shrink-0">
            {isLoadingLastfm ? (
              <Skeleton className="w-full h-full rounded-lg" />
            ) : lastfmData?.image_url ? (
              <img 
                src={lastfmData.image_url} 
                alt={artistDetails.artist}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
                onError={(e) => {
                  console.error('Image failed to load:', lastfmData.image_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-lg">
                <Music className="w-24 h-24 opacity-30" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-black mb-4">{artistDetails.artist}</h1>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Disc className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artistDetails.totalUniqueSongs}</div>
                <div className="text-xs text-muted-foreground">Unique Songs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Radio className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artistDetails.totalPlays}</div>
                <div className="text-xs text-muted-foreground">Total Plays</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artistDetails.uniqueDJs.length}</div>
                <div className="text-xs text-muted-foreground">DJs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-bold">
                  {artistDetails.firstPlayed 
                    ? formatDistanceToNow(new Date(artistDetails.firstPlayed), { addSuffix: true })
                    : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">First Played</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-bold">
                  {artistDetails.lastPlayed 
                    ? formatDistanceToNow(new Date(artistDetails.lastPlayed), { addSuffix: true })
                    : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Last Played</div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>

        {/* AI Generated Content */}
        {isLoadingContent ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ) : artistContent ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">About {artistDetails.artist}</h2>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line">{artistContent}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Most Played Shows */}
        {artistDetails.uniqueShows.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Featured Shows</h2>
              <div className="flex flex-wrap gap-2">
                {artistDetails.uniqueShows.slice(0, 10).map((show, index) => (
                  <span key={index} className="tag-pill bg-primary text-primary-foreground">
                    {show}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Songs List */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">All Songs</h2>
            <div className="space-y-4">
              {artistDetails.songs.map((song) => (
                <div key={song.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 w-16 h-16">
                    <AlbumArtImage
                      url={song.album_art_url}
                      artworkId={song.artwork_id}
                      artist={artistDetails.artist}
                      title={song.title}
                      alt={`${song.title} album art`}
                      className="w-full h-full object-cover rounded-md"
                      fallbackClassName="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-md"
                    />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <Link 
                      to={`/song/${encodeURIComponent(artistDetails.artist)}/${encodeURIComponent(song.title)}`}
                      className="block"
                    >
                      <h3 className="font-bold text-lg hover:text-primary transition-colors truncate">
                        {song.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {song.album && <span>{song.album}</span>}
                      {song.year && (
                        <>
                          <span>•</span>
                          <span>{song.year}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-bold text-lg">{song.play_count}</div>
                      <div className="text-xs text-muted-foreground">plays</div>
                    </div>
                    <SaveSongButton
                      artist={artistDetails.artist}
                      title={song.title}
                      album={song.album}
                      albumArtUrl={song.album_art_url}
                      artworkId={song.artwork_id}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t text-center text-sm text-muted-foreground">
          <p>WRIR 97.3 FM • Richmond Independent Radio</p>
        </footer>
      </div>
    </>
  );
};

export default ArtistPage;
