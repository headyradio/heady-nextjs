import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Music, 
  Home,
  LogOut,
  Users,
  Newspaper,
  Image
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import headyLogo from "@/assets/heady-logo.svg";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/hero-cards", label: "Hero Cards", icon: Image },
    { href: "/admin/headyzine", label: "Blog Posts", icon: FileText },
    { href: "/admin/shows", label: "Shows", icon: Calendar },
    { href: "/admin/mixtapes", label: "Mixtapes", icon: Music },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Header matching main site */}
      <header className="border-b-4 border-secondary shadow-lg" style={{ backgroundColor: '#4a148c' }}>
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link to="/">
              <img 
                src={headyLogo} 
                alt="HEADY Radio" 
                className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm hidden sm:inline">CMS Dashboard</span>
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r-4 border-primary bg-card hidden lg:block">
          <ScrollArea className="h-full">
            <nav className="space-y-1 p-4">
              <div className="mb-6">
                <h2 className="text-xl font-black text-primary px-3">Content</h2>
              </div>
              
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start font-bold",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              <div className="pt-6 border-t-2 border-border mt-6">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </ScrollArea>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t-4 border-primary p-2 z-50">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex-col h-auto py-2",
                      isActive && "bg-primary"
                    )}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 pb-20 lg:pb-0">
          <div className="container mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
