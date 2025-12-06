/**
 * Generate external music service links for songs
 */

export function getSpotifySearchUrl(artist: string, title: string): string {
  const query = encodeURIComponent(`${artist} ${title}`);
  return `https://open.spotify.com/search/${query}`;
}

export function getAppleMusicSearchUrl(artist: string, title: string): string {
  const query = encodeURIComponent(`${artist} ${title}`);
  return `https://music.apple.com/search?term=${query}`;
}

export function getYouTubeSearchUrl(artist: string, title: string): string {
  const query = encodeURIComponent(`${artist} ${title}`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

export function getGeniusUrl(artist: string, title: string): string {
  // Genius URLs are typically: https://genius.com/Artist-title-lyrics
  const slug = `${artist}-${title}`.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://genius.com/${slug}-lyrics`;
}

export function getLastfmUrl(artist: string, title: string): string {
  const artistSlug = encodeURIComponent(artist);
  const titleSlug = encodeURIComponent(title);
  return `https://www.last.fm/music/${artistSlug}/_/${titleSlug}`;
}
