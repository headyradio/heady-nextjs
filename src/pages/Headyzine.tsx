import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Headyzine = () => {
  const { posts, isLoading } = useBlogPosts();
  const publishedPosts = posts?.filter(post => post.status === 'published') || [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="HEADYZINE - Music Journalism & Artist Features"
        description="Music journalism, artist features, and scene coverage from HEADY.FM. Discover in-depth articles about indie rock, alternative music, and emerging artists."
        url="https://heady.fm/headyzine"
        type="website"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold">HEADYZINE</h1>
            <p className="text-xl text-muted-foreground">
              Music journalism, artist features, and scene coverage
            </p>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : publishedPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No published posts yet. Check back soon!
                </CardContent>
              </Card>
            ) : (
              publishedPosts.map((post) => (
                <Link key={post.id} to={`/headyzine/${post.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-2xl">{post.title}</CardTitle>
                          {post.published_at && (
                            <CardDescription>
                              {format(new Date(post.published_at), 'MMMM d, yyyy')}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {post.excerpt && (
                      <CardContent>
                        <p className="text-muted-foreground">{post.excerpt}</p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Headyzine;
