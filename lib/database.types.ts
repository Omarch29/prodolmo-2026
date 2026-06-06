export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bracket_slots: {
        Row: {
          feeds_side: string | null
          feeds_slot: string | null
          slot: string
          sort_order: number
          stage_id: string
        }
        Insert: {
          feeds_side?: string | null
          feeds_slot?: string | null
          slot: string
          sort_order: number
          stage_id: string
        }
        Update: {
          feeds_side?: string | null
          feeds_slot?: string | null
          slot?: string
          sort_order?: number
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bracket_slots_feeds_slot_fkey"
            columns: ["feeds_slot"]
            isOneToOne: false
            referencedRelation: "bracket_slots"
            referencedColumns: ["slot"]
          },
          {
            foreignKeyName: "bracket_slots_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          message_date: string
          metadata: Json | null
          priority: number
          type: Database["public"]["Enums"]["daily_message_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          message_date: string
          metadata?: Json | null
          priority?: number
          type: Database["public"]["Enums"]["daily_message_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          message_date?: string
          metadata?: Json | null
          priority?: number
          type?: Database["public"]["Enums"]["daily_message_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          decided_winner_team_id: string | null
          group_id: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          kickoff_at: string
          matchday: number | null
          stage_id: string
          status: Database["public"]["Enums"]["match_status"]
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          decided_winner_team_id?: string | null
          group_id?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          kickoff_at: string
          matchday?: number | null
          stage_id: string
          status?: Database["public"]["Enums"]["match_status"]
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          decided_winner_team_id?: string | null
          group_id?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          kickoff_at?: string
          matchday?: number | null
          stage_id?: string
          status?: Database["public"]["Enums"]["match_status"]
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_decided_winner_team_id_fkey"
            columns: ["decided_winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          created_at: string
          id: string
          match_id: string
          points_earned: number | null
          pred_away_score: number
          pred_home_score: number
          pred_winner_team_id: string | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          points_earned?: number | null
          pred_away_score: number
          pred_home_score: number
          pred_winner_team_id?: string | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          points_earned?: number | null
          pred_away_score?: number
          pred_home_score?: number
          pred_winner_team_id?: string | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_pred_winner_team_id_fkey"
            columns: ["pred_winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          es_bot: boolean
          id: string
          timezone: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          es_bot?: boolean
          id: string
          timezone?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          es_bot?: boolean
          id?: string
          timezone?: string
          username?: string | null
        }
        Relationships: []
      }
      simulation_picks: {
        Row: {
          away_score: number | null
          bracket_slot: string | null
          home_score: number | null
          id: string
          match_id: string | null
          simulation_id: string
          winner_team_id: string
        }
        Insert: {
          away_score?: number | null
          bracket_slot?: string | null
          home_score?: number | null
          id?: string
          match_id?: string | null
          simulation_id: string
          winner_team_id: string
        }
        Update: {
          away_score?: number | null
          bracket_slot?: string | null
          home_score?: number | null
          id?: string
          match_id?: string | null
          simulation_id?: string
          winner_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_picks_bracket_slot_fkey"
            columns: ["bracket_slot"]
            isOneToOne: false
            referencedRelation: "bracket_slots"
            referencedColumns: ["slot"]
          },
          {
            foreignKeyName: "simulation_picks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_picks_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_picks_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          id: string
          name: string
          points_exact: number
          points_outcome: number
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          points_exact: number
          points_outcome: number
          sort_order: number
        }
        Update: {
          id?: string
          name?: string
          points_exact?: number
          points_outcome?: number
          sort_order?: number
        }
        Relationships: []
      }
      standings_snapshots: {
        Row: {
          date: string
          posicion: number
          puntos: number
          user_id: string
        }
        Insert: {
          date: string
          posicion: number
          puntos?: number
          user_id: string
        }
        Update: {
          date?: string
          posicion?: number
          puntos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "standings_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          code: string
          flag_url: string | null
          group_id: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["team_status"]
        }
        Insert: {
          code: string
          flag_url?: string | null
          group_id?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["team_status"]
        }
        Update: {
          code?: string
          flag_url?: string | null
          group_id?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["team_status"]
        }
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      prediction_lock_interval: { Args: never; Returns: string }
    }
    Enums: {
      daily_message_type:
        | "pending_today"
        | "overtaken"
        | "gap_to_leader"
        | "last_place"
        | "surprise_result"
        | "lone_hit"
        | "streak"
      match_status: "scheduled" | "in_progress" | "finished"
      team_status: "active" | "eliminated"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      daily_message_type: [
        "pending_today",
        "overtaken",
        "gap_to_leader",
        "last_place",
        "surprise_result",
        "lone_hit",
        "streak",
      ],
      match_status: ["scheduled", "in_progress", "finished"],
      team_status: ["active", "eliminated"],
    },
  },
} as const

