import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeroCard {
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
  created_at: string;
  updated_at: string;
}

export default function AdminHeroCards() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<HeroCard | null>(null);
  const [genreTagInput, setGenreTagInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    genre_tags: [] as string[],
    dj_name: "",
    day: "",
    time: "",
    destination_url: "",
    destination_type: "internal" as "internal" | "external",
    display_order: 0,
    is_active: true,
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const { data: heroCards, isLoading } = useQuery({
    queryKey: ["admin-hero-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_cards")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as HeroCard[];
    },
    enabled: isAdmin,
  });

  const addGenreTag = () => {
    if (genreTagInput.trim() && !formData.genre_tags.includes(genreTagInput.trim())) {
      setFormData({
        ...formData,
        genre_tags: [...formData.genre_tags, genreTagInput.trim()],
      });
      setGenreTagInput("");
    }
  };

  const removeGenreTag = (tag: string) => {
    setFormData({
      ...formData,
      genre_tags: formData.genre_tags.filter((t) => t !== tag),
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      genre_tags: [],
      dj_name: "",
      day: "",
      time: "",
      destination_url: "",
      destination_type: "internal",
      display_order: heroCards?.length || 0,
      is_active: true,
    });
    setGenreTagInput("");
    setEditingCard(null);
    setShowForm(false);
  };

  const openEditDialog = (card: HeroCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      description: card.description,
      image_url: card.image_url,
      genre_tags: card.genre_tags || [],
      dj_name: card.dj_name || "",
      day: card.day || "",
      time: card.time || "",
      destination_url: card.destination_url || "",
      destination_type: card.destination_type || "internal",
      display_order: card.display_order,
      is_active: card.is_active,
    });
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: async (newCard: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("hero_cards")
        .insert({
          ...newCard,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-cards"] });
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] }); // Invalidate public query
      toast({ title: "Hero card created successfully" });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroCard> & { id: string }) => {
      const { data, error } = await supabase
        .from("hero_cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-cards"] });
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] }); // Invalidate public query
      toast({ title: "Hero card updated successfully" });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-cards"] });
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] }); // Invalidate public query
      toast({ title: "Hero card deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const moveCard = async (id: string, direction: "up" | "down") => {
    const card = heroCards?.find((c) => c.id === id);
    if (!card) return;

    const currentOrder = card.display_order;
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    const swapCard = heroCards?.find((c) => c.display_order === newOrder);

    if (swapCard) {
      // Swap orders
      await updateMutation.mutateAsync({ id, display_order: newOrder });
      await updateMutation.mutateAsync({ id: swapCard.id, display_order: currentOrder });
    } else {
      await updateMutation.mutateAsync({ id, display_order: newOrder });
    }
  };

  const handleSubmit = () => {
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Hero Cards</h1>
            <p className="text-muted-foreground mt-2">
              Edit the homepage hero carousel cards (max 10 cards)
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            disabled={heroCards && heroCards.length >= 10}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Card
          </Button>
        </div>

        {heroCards && heroCards.length >= 10 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Maximum of 10 hero cards reached. Delete a card to add a new one.
            </p>
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCard ? "Edit Hero Card" : "Create Hero Card"}</DialogTitle>
              <DialogDescription>
                Configure the hero carousel card that appears on the homepage
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Night Treats"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Late night electronic music journey..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Background Image URL *</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Genre Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={genreTagInput}
                    onChange={(e) => setGenreTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGenreTag();
                      }
                    }}
                    placeholder="Add genre tag (e.g., Electronic)"
                  />
                  <Button type="button" onClick={addGenreTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.genre_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeGenreTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dj_name">DJ Name</Label>
                  <Input
                    id="dj_name"
                    value={formData.dj_name}
                    onChange={(e) => setFormData({ ...formData, dj_name: e.target.value })}
                    placeholder="Rouxbais"
                  />
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    placeholder="Fridays"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="10:00 PM ET"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="destination_type">Destination Type</Label>
                <Select
                  value={formData.destination_type}
                  onValueChange={(value: "internal" | "external") =>
                    setFormData({ ...formData, destination_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal Link</SelectItem>
                    <SelectItem value="external">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="destination_url">Destination URL</Label>
                <Input
                  id="destination_url"
                  type="url"
                  value={formData.destination_url}
                  onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                  placeholder={formData.destination_type === "internal" ? "/shows" : "https://example.com"}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Active (visible on homepage)</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCard ? "Update Card" : "Create Card"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroCards?.map((card, index) => (
              <Card key={card.id} className={!card.is_active ? "opacity-50" : ""}>
                <div className="relative">
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ddd' width='400' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage not found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {!card.is_active && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Inactive
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {card.genre_tags && card.genre_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {card.genre_tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {card.genre_tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{card.genre_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(card)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this card?")) {
                              deleteMutation.mutate(card.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCard(card.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCard(card.id, "down")}
                          disabled={index === (heroCards?.length || 0) - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!heroCards || heroCards.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No hero cards yet. Click "New Card" to create one.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

