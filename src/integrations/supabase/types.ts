export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_categories: {
        Row: {
          created_at: string
          description: string | null
          emoji: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          message_type: string
          parent_message_id: string | null
          room_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          message_type?: string
          parent_message_id?: string | null
          room_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          message_type?: string
          parent_message_id?: string | null
          room_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          category_id: string
          created_at: string
          created_by: string | null
          description: string | null
          emoji: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "chat_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_deleted: boolean
          is_read: boolean
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      genius_artist_data: {
        Row: {
          artist_name: string
          cached_at: string
          created_at: string
          full_data: Json
          genius_id: number | null
          id: string
        }
        Insert: {
          artist_name: string
          cached_at?: string
          created_at?: string
          full_data?: Json
          genius_id?: number | null
          id?: string
        }
        Update: {
          artist_name?: string
          cached_at?: string
          created_at?: string
          full_data?: Json
          genius_id?: number | null
          id?: string
        }
        Relationships: []
      }
      genius_song_data: {
        Row: {
          artist: string
          cached_at: string
          created_at: string
          full_data: Json
          genius_id: number | null
          id: string
          title: string
        }
        Insert: {
          artist: string
          cached_at?: string
          created_at?: string
          full_data?: Json
          genius_id?: number | null
          id?: string
          title: string
        }
        Update: {
          artist?: string
          cached_at?: string
          created_at?: string
          full_data?: Json
          genius_id?: number | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      guest_profiles: {
        Row: {
          avatar_seed: string | null
          created_at: string | null
          expires_at: string | null
          guest_name: string
          id: string
          is_active: boolean | null
          session_id: string
        }
        Insert: {
          avatar_seed?: string | null
          created_at?: string | null
          expires_at?: string | null
          guest_name: string
          id?: string
          is_active?: boolean | null
          session_id: string
        }
        Update: {
          avatar_seed?: string | null
          created_at?: string | null
          expires_at?: string | null
          guest_name?: string
          id?: string
          is_active?: boolean | null
          session_id?: string
        }
        Relationships: []
      }
      headyzine_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "headyzine_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lastfm_artist_data: {
        Row: {
          artist_name: string
          cached_at: string
          created_at: string
          full_data: Json
          id: string
          lastfm_mbid: string | null
        }
        Insert: {
          artist_name: string
          cached_at?: string
          created_at?: string
          full_data?: Json
          id?: string
          lastfm_mbid?: string | null
        }
        Update: {
          artist_name?: string
          cached_at?: string
          created_at?: string
          full_data?: Json
          id?: string
          lastfm_mbid?: string | null
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string | null
          guest_id: string | null
          id: string
          is_deleted: boolean | null
          is_guest: boolean | null
          sender_avatar_url: string | null
          sender_name: string
          user_id: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string | null
          guest_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_guest?: boolean | null
          sender_avatar_url?: string | null
          sender_name: string
          user_id?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string | null
          guest_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_guest?: boolean | null
          sender_avatar_url?: string | null
          sender_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guest_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetup_attendees: {
        Row: {
          created_at: string
          id: string
          meetup_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meetup_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meetup_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_attendees_meetup_id_fkey"
            columns: ["meetup_id"]
            isOneToOne: false
            referencedRelation: "meetups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetup_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetup_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          meetup_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          meetup_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          meetup_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetup_comments_meetup_id_fkey"
            columns: ["meetup_id"]
            isOneToOne: false
            referencedRelation: "meetups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetup_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetups: {
        Row: {
          created_at: string
          created_by: string
          description: string
          event_date: string
          external_link: string | null
          id: string
          image_url: string | null
          location: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          event_date: string
          external_link?: string | null
          id?: string
          image_url?: string | null
          location: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          event_date?: string
          external_link?: string | null
          id?: string
          image_url?: string | null
          location?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_mentions: {
        Row: {
          created_at: string
          id: string
          mentioned_user_id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentioned_user_id: string
          message_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentioned_user_id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_mentions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mixtape_tags: {
        Row: {
          mixtape_id: string
          tag_id: string
        }
        Insert: {
          mixtape_id: string
          tag_id: string
        }
        Update: {
          mixtape_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mixtape_tags_mixtape_id_fkey"
            columns: ["mixtape_id"]
            isOneToOne: false
            referencedRelation: "mixtapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mixtape_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      mixtapes: {
        Row: {
          cover_art_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          download_link: string | null
          duration_minutes: number | null
          id: string
          release_date: string | null
          slug: string
          status: string
          streaming_links: Json | null
          title: string
          tracklist: Json | null
          updated_at: string
        }
        Insert: {
          cover_art_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_link?: string | null
          duration_minutes?: number | null
          id?: string
          release_date?: string | null
          slug: string
          status?: string
          streaming_links?: Json | null
          title: string
          tracklist?: Json | null
          updated_at?: string
        }
        Update: {
          cover_art_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_link?: string | null
          duration_minutes?: number | null
          id?: string
          release_date?: string | null
          slug?: string
          status?: string
          streaming_links?: Json | null
          title?: string
          tracklist?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          related_message_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          related_message_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          related_message_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "headyzine_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      saved_songs: {
        Row: {
          album: string | null
          album_art_url: string | null
          artist: string
          artwork_id: string | null
          id: string
          saved_at: string
          song_key: string
          title: string
          user_id: string
        }
        Insert: {
          album?: string | null
          album_art_url?: string | null
          artist: string
          artwork_id?: string | null
          id?: string
          saved_at?: string
          song_key: string
          title: string
          user_id: string
        }
        Update: {
          album?: string | null
          album_art_url?: string | null
          artist?: string
          artwork_id?: string | null
          id?: string
          saved_at?: string
          song_key?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_songs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      show_tags: {
        Row: {
          show_id: string
          tag_id: string
        }
        Insert: {
          show_id: string
          tag_id: string
        }
        Update: {
          show_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_tags_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          artists: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          doors_time: string | null
          event_date: string
          featured_image_url: string | null
          id: string
          location: string
          show_time: string | null
          slug: string
          status: string
          ticket_link: string | null
          ticket_price: string | null
          title: string
          updated_at: string
          venue: string
        }
        Insert: {
          artists?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          doors_time?: string | null
          event_date: string
          featured_image_url?: string | null
          id?: string
          location: string
          show_time?: string | null
          slug: string
          status?: string
          ticket_link?: string | null
          ticket_price?: string | null
          title: string
          updated_at?: string
          venue: string
        }
        Update: {
          artists?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          doors_time?: string | null
          event_date?: string
          featured_image_url?: string | null
          id?: string
          location?: string
          show_time?: string | null
          slug?: string
          status?: string
          ticket_link?: string | null
          ticket_price?: string | null
          title?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      song_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          song_key: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          song_key: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          song_key?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transmission_metadata: {
        Row: {
          ai_analysis: Json | null
          artist_gender: string | null
          created_at: string | null
          decade: string | null
          energy_level: number | null
          estimated_bpm: number | null
          genre_tags: string[] | null
          id: string
          last_analyzed_at: string | null
          mood_tags: string[] | null
          musicbrainz_id: string | null
          transmission_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          artist_gender?: string | null
          created_at?: string | null
          decade?: string | null
          energy_level?: number | null
          estimated_bpm?: number | null
          genre_tags?: string[] | null
          id?: string
          last_analyzed_at?: string | null
          mood_tags?: string[] | null
          musicbrainz_id?: string | null
          transmission_id: string
        }
        Update: {
          ai_analysis?: Json | null
          artist_gender?: string | null
          created_at?: string | null
          decade?: string | null
          energy_level?: number | null
          estimated_bpm?: number | null
          genre_tags?: string[] | null
          id?: string
          last_analyzed_at?: string | null
          mood_tags?: string[] | null
          musicbrainz_id?: string | null
          transmission_id?: string
        }
        Relationships: []
      }
      transmissions: {
        Row: {
          album: string | null
          album_art_url: string | null
          artist: string
          artwork_id: string | null
          created_at: string | null
          dj_name: string | null
          duration: string | null
          genre: string | null
          id: string
          listeners_count: number | null
          play_started_at: string
          show_name: string | null
          title: string
          year: string | null
        }
        Insert: {
          album?: string | null
          album_art_url?: string | null
          artist: string
          artwork_id?: string | null
          created_at?: string | null
          dj_name?: string | null
          duration?: string | null
          genre?: string | null
          id?: string
          listeners_count?: number | null
          play_started_at: string
          show_name?: string | null
          title: string
          year?: string | null
        }
        Update: {
          album?: string | null
          album_art_url?: string | null
          artist?: string
          artwork_id?: string | null
          created_at?: string | null
          dj_name?: string | null
          duration?: string | null
          genre?: string | null
          id?: string
          listeners_count?: number | null
          play_started_at?: string
          show_name?: string | null
          title?: string
          year?: string | null
        }
        Relationships: []
      }
      user_chat_preferences: {
        Row: {
          blocked_users: string[] | null
          created_at: string
          email_notifications: boolean
          id: string
          notification_sound: boolean
          show_typing_indicator: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_users?: string[] | null
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_sound?: boolean
          show_typing_indicator?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_users?: string[] | null
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_sound?: boolean
          show_typing_indicator?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
