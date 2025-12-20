import { useParams, Link } from "react-router-dom";
import { useArtistDetails, useArtistContent } from "@/hooks/useArtistDetails";
import { useCombinedArtistData } from "@/hooks/useCombinedArtistData";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { generateArtistStructuredData, generateBreadcrumbStructuredData } from "@/lib/structuredData";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Clock, Radio, Users, Disc, ExternalLink, TrendingUp, Calendar, Sparkles, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlbumArtImage } from "@/components/AlbumArtImage";
import SaveSongButton from "@/components/SaveSongButton";
import { getSpotifySearchUrl, getYouTubeSearchUrl } from "@/lib/musicServiceLinks";
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
  const artistData = useCombinedArtistData(artistName || "");

  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6 bg-white/10" />
          <Skeleton className="h-64 w-full mb-6 bg-white/10" />
          <Skeleton className="h-96 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (!artistDetails) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h2 className="text-2xl font-bold text-white mb-2">Artist Not Found</h2>
            <p className="text-white/60 mb-4">
              No information found for this artist.
            </p>
            <Link to="/" className="text-primary hover:text-primary/80 font-medium">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SEO metadata - prioritize MusicBrainz data
  const artistUrl = `https://heady.fm/artist/${encodeURIComponent(artistDetails.artist)}`;
  const artistImage = artistData.image || 'https://heady.fm/og-image.png';
  const artistDescription = 
    artistContent || 
    artistData.bio?.replace(/<[^>]*>/g, '').substring(0, 160) ||
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
    <div className="min-h-screen bg-black">
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
      
      {/* Breadcrumb Navigation - with purple gradient background */}
      <div className="bg-gradient-to-b from-[#4a148c] to-purple-900/60">
        <div className="container mx-auto px-4 pt-6 pb-4">
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-white/60 hover:text-white transition-colors">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{artistDetails.artist}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Artist Hero Section */}
      <div className="relative">
        {/* Background Gradient - Blends with purple nav */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a148c] via-purple-900/80 to-black overflow-hidden">
          {/* Blurred artist image background */}
          {artistData.image && (
            <div 
              className="absolute inset-0 opacity-30 blur-3xl scale-150"
              style={{
                backgroundImage: `url(${artistData.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative px-4 md:px-8 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-end">
              {/* Artist Image */}
              <div className="relative flex-shrink-0 group">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl shadow-black/50 ring-4 ring-white/10 transition-transform duration-500 group-hover:scale-[1.02]">
                  {artistData.isLoadingMusicBrainz ? (
                    <Skeleton className="w-full h-full bg-white/10" />
                  ) : artistData.image ? (
                    <img 
                      src={artistData.image} 
                      alt={`${artistDetails.artist} artist photo`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width="256"
                      height="256"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                      <Music className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                </div>
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
                {/* Artist indicator */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Artist</span>
                  {artistData.type && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="font-medium">{artistData.type}</span>
                    </>
                  )}
                  {artistData.country && (
                    <>
                      <span className="text-white/40">•</span>
                      <Globe className="w-3 h-3" />
                      <span className="font-medium">{artistData.country}</span>
                    </>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  {artistDetails.artist}
                </h1>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <a 
                    href={getSpotifySearchUrl(artistDetails.artist, '')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold transition-all hover:scale-105"
                    aria-label={`Listen to ${artistDetails.artist} on Spotify`}
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                      alt=""
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                    Spotify
                  </a>

                  <a 
                    href={getYouTubeSearchUrl(artistDetails.artist, '')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold transition-all hover:scale-105"
                    aria-label={`Watch ${artistDetails.artist} on YouTube`}
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                      alt=""
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                    YouTube
                  </a>

                  {/* Official Website */}
                  {artistData.officialWebsite && (
                    <a 
                      href={artistData.officialWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold transition-all hover:scale-105"
                      aria-label={`Visit ${artistDetails.artist} official website`}
                    >
                      <Globe className="w-5 h-5" />
                      Website
                    </a>
                  )}

                  {/* Instagram */}
                  {artistData.socialLinks?.instagram && (
                    <a 
                      href={`https://instagram.com/${artistData.socialLinks.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm border border-white/20 text-white font-bold transition-all hover:scale-105"
                      aria-label={`Follow ${artistDetails.artist} on Instagram`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                      Instagram
                    </a>
                  )}

                  {/* Twitter */}
                  {artistData.socialLinks?.twitter && (
                    <a 
                      href={`https://twitter.com/${artistData.socialLinks.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold transition-all hover:scale-105"
                      aria-label={`Follow ${artistDetails.artist} on Twitter`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Twitter
                    </a>
                  )}

                  {/* Facebook */}
                  {artistData.socialLinks?.facebook && (
                    <a 
                      href={`https://facebook.com/${artistData.socialLinks.facebook}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm border border-white/20 text-white font-bold transition-all hover:scale-105"
                      aria-label={`Follow ${artistDetails.artist} on Facebook`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all group">
            <Disc className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-3xl md:text-4xl font-black text-white mb-1">{artistDetails.totalUniqueSongs}</div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Songs</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all group">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" />
            <div className="text-3xl md:text-4xl font-black text-white mb-1">{artistDetails.totalPlays}</div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Plays</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all group">
            <Radio className="w-8 h-8 mx-auto mb-3 text-green-400 group-hover:scale-110 transition-transform" />
            <div className="text-3xl md:text-4xl font-black text-white mb-1">{artistDetails.uniqueDJs.length}</div>
            <div className="text-sm text-white/50 uppercase tracking-wider">DJs</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all group">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-lg md:text-xl font-bold text-white mb-1">
              {artistDetails.firstPlayed 
                ? formatDistanceToNow(new Date(artistDetails.firstPlayed), { addSuffix: false })
                : 'N/A'}
            </div>
            <div className="text-sm text-white/50 uppercase tracking-wider">First Played</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all group">
            <Clock className="w-8 h-8 mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="text-lg md:text-xl font-bold text-white mb-1">
              {artistDetails.lastPlayed 
                ? formatDistanceToNow(new Date(artistDetails.lastPlayed), { addSuffix: false })
                : 'N/A'}
            </div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Last Played</div>
          </div>
        </div>
      </div>

      {/* About the Artist Section */}
      {(artistData.bio || artistData.genres.length > 0) && (
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-black text-white">About the Artist</h2>
            </div>
            
            {artistData.bio && (
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-white/80 text-base md:text-lg leading-relaxed">
                  {(() => {
                    // Strip HTML tags and clean up the bio text
                    const cleanBio = artistData.bio
                      .replace(/<a[^>]*>.*?<\/a>/gi, '') // Remove all <a> tags and their content
                      .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
                      .replace(/\s+/g, ' ') // Normalize whitespace
                      .trim();
                    return cleanBio.length > 600 ? `${cleanBio.substring(0, 600)}...` : cleanBio;
                  })()}
                </p>
              </div>
            )}

            {artistData.genres.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Genres & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {artistData.genres.slice(0, 10).map((genre, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-sm font-semibold text-white hover:bg-primary/30 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional MusicBrainz Info */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {artistData.beginDate && (
                <div>
                  <span className="text-white/50">Formed:</span>
                  <span className="ml-2 text-white font-semibold">{new Date(artistData.beginDate).getFullYear()}</span>
                </div>
              )}
              {artistData.stats.musicbrainzRating && (
                <div>
                  <span className="text-white/50">MusicBrainz Rating:</span>
                  <span className="ml-2 text-white font-semibold">{artistData.stats.musicbrainzRating}/5 ⭐</span>
                </div>
              )}
              {artistData.stats.listenbrainzListeners > 0 && (
                <div>
                  <span className="text-white/50">ListenBrainz Listeners:</span>
                  <span className="ml-2 text-white font-semibold">{artistData.stats.listenbrainzListeners.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* About Section */}
        {(isLoadingContent || artistContent) && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">About</h2>
            </div>
            
            {isLoadingContent ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                <Skeleton className="h-4 w-3/4 bg-white/10" />
              </div>
            ) : artistContent ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <p className="text-white/80 leading-relaxed whitespace-pre-line">{artistContent}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Featured Shows */}
        {artistDetails.uniqueShows.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Featured Shows</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {artistDetails.uniqueShows.slice(0, 10).map((show, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-white font-medium border border-white/10 hover:border-white/20 transition-colors"
                >
                  {show}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Songs List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">ALL SONGS PLAYED ON EXTRATERRESTRIAL RADIO</h2>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/10">
              {artistDetails.songs.map((song, index) => (
                <div 
                  key={song.id} 
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                >
                  {/* Album Art */}
                  <Link 
                    to={`/song/${encodeURIComponent(artistDetails.artist)}/${encodeURIComponent(song.title)}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                      <AlbumArtImage
                        url={song.album_art_url}
                        artworkId={song.artwork_id}
                        artist={artistDetails.artist}
                        title={song.title}
                        alt={`${song.title} album art`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        fallbackClassName="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center rounded-lg"
                      />
                    </div>
                  </Link>
                  
                  {/* Song Info */}
                  <div className="flex-grow min-w-0">
                    <Link 
                      to={`/song/${encodeURIComponent(artistDetails.artist)}/${encodeURIComponent(song.title)}`}
                      className="block group/link"
                    >
                      <h3 className="font-bold text-white group-hover/link:text-primary transition-colors truncate">
                        {song.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      {song.album && <span className="truncate">{song.album}</span>}
                      {song.year && (
                        <>
                          <span>•</span>
                          <span>{song.year}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Play Count */}
                  <div className="hidden md:flex items-center gap-2 text-white/50">
                    <Radio className="w-4 h-4" />
                    <span className="font-bold">{song.play_count}</span>
                    <span className="text-sm">plays</span>
                  </div>

                  {/* Save Button */}
                  <SaveSongButton
                    artist={artistDetails.artist}
                    title={song.title}
                    album={song.album}
                    albumArtUrl={song.album_art_url}
                    artworkId={song.artwork_id}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-white/10 text-center text-sm text-white/50">
        <p>© {new Date().getFullYear()} HEADY Radio. All transmissions received and logged.</p>
      </footer>
    </div>
  );
};

export default ArtistPage;
