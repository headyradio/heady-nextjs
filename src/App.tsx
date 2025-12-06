import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { FloatingChatWidget } from "./components/FloatingChatWidget";
import { SEO } from "./components/SEO";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Lazy load routes for code splitting (following ISR-like strategy)
const Index = lazy(() => import("./pages/Index"));
const SongPage = lazy(() => import("./pages/SongPage"));
const ArtistPage = lazy(() => import("./pages/ArtistPage"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const SavedSongs = lazy(() => import("./pages/SavedSongs"));
const Community = lazy(() => import("./pages/Community"));
const Meetups = lazy(() => import("./pages/Meetups"));
const Headyzine = lazy(() => import("./pages/Headyzine"));
const Shows = lazy(() => import("./pages/Shows"));
const Mixtapes = lazy(() => import("./pages/Mixtapes"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminHeadyzine = lazy(() => import("./pages/AdminHeadyzine"));
const AdminShows = lazy(() => import("./pages/AdminShows"));
const AdminMixtapes = lazy(() => import("./pages/AdminMixtapes"));
const AdminHeroCards = lazy(() => import("./pages/AdminHeroCards"));
const DonationSuccess = lazy(() => import("./pages/DonationSuccess"));
const DonationCancelled = lazy(() => import("./pages/DonationCancelled"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient configuration aligned with ISR-like caching strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Align with ISR revalidation times
      staleTime: 5 * 60 * 1000, // 5 minutes default (like ISR 60s-10m revalidation)
      gcTime: 30 * 60 * 1000, // 30 minutes cache time (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus (better UX)
      retry: 1, // Reduce retries for faster failure handling
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioPlayerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/song/:artist/:title" element={<SongPage />} />
                <Route path="/artist/:artistName" element={<ArtistPage />} />
                <Route path="/community" element={<Community />} />
                <Route path="/meetups" element={<Meetups />} />
                <Route path="/headyzine" element={<Headyzine />} />
                <Route path="/shows" element={<Shows />} />
                <Route path="/mixtapes" element={<Mixtapes />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/login" element={<AdminAuth />} />
                <Route path="/admin/headyzine" element={<AdminHeadyzine />} />
                <Route path="/admin/shows" element={<AdminShows />} />
                <Route path="/admin/mixtapes" element={<AdminMixtapes />} />
                <Route path="/admin/hero-cards" element={<AdminHeroCards />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/saved-songs" element={<SavedSongs />} />
                <Route path="/donation-success" element={<DonationSuccess />} />
                <Route path="/donation-cancelled" element={<DonationCancelled />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <FloatingChatWidget />
          </BrowserRouter>
          <Analytics />
          <SpeedInsights />
        </AudioPlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
