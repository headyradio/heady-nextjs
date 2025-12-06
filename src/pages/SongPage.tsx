import { useParams } from "react-router-dom";
import { useSongDetails, useSongContent } from "@/hooks/useSongDetails";
import { useGeniusSongData } from "@/hooks/useGeniusSongData";
import { useGeniusArtistData } from "@/hooks/useGeniusArtistData";
import { useRelatedArtists } from "@/hooks/useRelatedArtists";
import { useArtistTopSongs } from "@/hooks/useArtistTopSongs";
import { useArtistDetails } from "@/hooks/useArtistDetails";
import Navigation from "@/components/Navigation";
import { SongHeroSection } from "@/components/SongHeroSection";
import { AboutTheTrack } from "@/components/AboutTheTrack";
import { AboutTheArtist } from "@/components/AboutTheArtist";
import { RelatedArtists } from "@/components/RelatedArtists";
import { MoreFromArtist } from "@/components/MoreFromArtist";
import { PlayHistoryTimeline } from "@/components/PlayHistoryTimeline";
import { SongComments } from "@/components/SongComments";
import { SEO } from "@/components/SEO";
import { generateMusicKnowledgeGraph, generateBreadcrumbList, convertDurationToISO8601 } from "@/lib/schemaOrgMusicGraph";
import { getSpotifySearchUrl, getAppleMusicSearchUrl, getYouTubeSearchUrl, getGeniusUrl, getLastfmUrl } from "@/lib/musicServiceLinks";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const SongPage = () => {
  const { artist = "", title = "" } = useParams<{ artist: string; title: string }>();
  
  const songDetails = useSongDetails(artist, title);
  const songContent = useSongContent(artist, title);
  const geniusSongData = useGeniusSongData(artist, title);
  const geniusArtistData = useGeniusArtistData(artist);
  const artistDetails = useArtistDetails(artist);
  
  const relatedArtists = useRelatedArtists(
    artist,
    geniusSongData.data?.featured_artists,
    geniusSongData.data?.producer_artists,
    geniusSongData.data?.writer_artists
  );
  
  const artistTopSongs = useArtistTopSongs(artist, title, 10);

  if (songDetails.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
        </div>
      </div>
    );
  }

  if (!songDetails.data || songDetails.data.transmissions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Song Not Found</h1>
            <p className="text-muted-foreground">
              This song hasn't been played on HEADY.FM yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { transmissions, playCount, lastPlayed, uniqueDJs } = songDetails.data;
  const latestTransmission = transmissions[0];
  const songKey = `${artist}-${title}`.toLowerCase();

  const headyArtistStats = {
    totalPlays: artistDetails.data?.totalPlays || 0,
    uniqueSongs: artistDetails.data?.songs?.length || 0,
    firstPlayed: artistDetails.data?.songs[artistDetails.data.songs.length - 1]?.last_played || null,
    lastPlayed: artistDetails.data?.songs[0]?.last_played || null,
  };

  // SEO metadata
  const songUrl = `https://heady.fm/song/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const artistUrl = `https://heady.fm/artist/${encodeURIComponent(artist)}`;
  const songImage = latestTransmission.album_art_url || geniusSongData.data?.song_art_image_url || 'https://heady.fm/og-image.png';
  const artistImage = geniusArtistData.data?.image_url || undefined;
  const songDescription = 
    geniusSongData.data?.description?.plain || 
    songContent.data ||
    `${title} by ${artist} - Played ${playCount} time${playCount !== 1 ? 's' : ''} on HEADY.FM. Listen to commercial-free indie rock radio.`;

  // Generate comprehensive music knowledge graph
  const musicGraph = generateMusicKnowledgeGraph({
    trackTitle: title,
    trackUrl: songUrl,
    trackDescription: songDescription,
    trackImage: songImage,
    trackDuration: latestTransmission.duration ? convertDurationToISO8601(latestTransmission.duration) : undefined,
    trackGenre: latestTransmission.genre || undefined,
    trackYear: latestTransmission.year || undefined,
    trackReleaseDate: geniusSongData.data?.release_date || latestTransmission.created_at,
    artistName: artist,
    artistUrl: artistUrl,
    artistImage: artistImage,
    artistDescription: geniusArtistData.data?.description?.plain || undefined,
    albumName: latestTransmission.album || geniusSongData.data?.album?.name || undefined,
    albumImage: geniusSongData.data?.album?.cover_art_url || undefined,
    spotifyUrl: getSpotifySearchUrl(artist, title),
    appleMusicUrl: getAppleMusicSearchUrl(artist, title),
    youtubeUrl: getYouTubeSearchUrl(artist, title),
    geniusUrl: geniusSongData.data?.url || getGeniusUrl(artist, title),
    lastfmUrl: getLastfmUrl(artist, title),
    playCount: playCount,
    lastPlayed: lastPlayed || undefined,
    firstPlayed: songDetails.data?.firstPlayed || undefined,
  });

  // Generate breadcrumb list
  const breadcrumbList = generateBreadcrumbList([
    { name: 'Home', url: 'https://heady.fm' },
    { name: artist, url: artistUrl },
    { name: title, url: songUrl },
  ]);

  // Combine all structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      ...musicGraph['@graph'],
      breadcrumbList,
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${title} by ${artist}`}
        description={songDescription}
        image={songImage}
        url={songUrl}
        type="music.song"
        canonical={songUrl}
        structuredData={structuredData}
      />
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* SEO H1 */}
        <h1 className="sr-only">{title} by {artist} - HEADY.FM</h1>
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/artist/${encodeURIComponent(artist)}`}>
                {artist}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <SongHeroSection
          title={title}
          artist={artist}
          album={latestTransmission.album}
          artworkId={latestTransmission.artwork_id}
          albumArtUrl={latestTransmission.album_art_url}
          playCount={playCount}
          uniqueDJs={uniqueDJs}
          lastPlayed={lastPlayed}
          genres={latestTransmission.genre ? [latestTransmission.genre] : undefined}
          createdAt={latestTransmission.created_at}
        />

        {/* About the Track */}
        <AboutTheTrack
          geniusData={geniusSongData.data}
          aiContent={songContent.data}
          duration={latestTransmission.duration}
        />

        {/* About the Artist */}
        <AboutTheArtist
          artistName={artist}
          geniusData={geniusArtistData.data}
          aiContent={undefined}
          headyStats={headyArtistStats}
        />

        {/* Related Artists */}
        <RelatedArtists
          artists={relatedArtists.data || []}
          isLoading={relatedArtists.isLoading}
        />

        {/* More from Artist */}
        <MoreFromArtist
          artistName={artist}
          songs={artistTopSongs.data || []}
          isLoading={artistTopSongs.isLoading}
        />

        {/* Play History Timeline */}
        <PlayHistoryTimeline transmissions={transmissions} />

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Community</h2>
          <SongComments artist={artist} title={title} />
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HEADY Radio. All transmissions received and logged.</p>
        </footer>
      </div>
    </div>
  );
};

export default SongPage;
