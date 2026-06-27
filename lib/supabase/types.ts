export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      cases: {
        Row: {
          id:             string;
          user_id:        string;
          name:           string;
          description:    string | null;
          operation_date: string | null;  // date (YYYY-MM-DD)
          created_at:     string;
        };
        Insert: {
          name:            string;
          description?:    string | null;
          operation_date?: string | null;
          user_id?:        string | undefined;
          id?:             string | undefined;
          created_at?:     string | undefined;
        };
        Update: {
          name?:           string;
          description?:    string | null;
          operation_date?: string | null;
          user_id?:        string | undefined;
        };
        Relationships: [];
      };
      angle_presets: {
        Row: {
          id:         string;
          user_id:    string;
          yaw:        number;
          label:      string;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          yaw:         number;
          label:       string;
          is_default:  boolean;
          sort_order:  number;
          user_id?:    string | undefined;
          id?:         string | undefined;
          created_at?: string | undefined;
        };
        Update: {
          yaw?:        number;
          label?:      string;
          is_default?: boolean;
          sort_order?: number;
          user_id?:    string | undefined;
        };
        Relationships: [];
      };
      capture_sessions: {
        Row: {
          id:          string;
          user_id:     string;
          case_id:     string | null;
          label:       string;
          notes:       string | null;
          captured_at: string;
          created_at:  string;
        };
        Insert: {
          label:        string;
          captured_at:  string;
          case_id?:     string | null | undefined;
          notes?:       string | null | undefined;
          user_id?:     string | undefined;
          id?:          string | undefined;
          created_at?:  string | undefined;
        };
        Update: {
          label?:       string;
          captured_at?: string;
          case_id?:     string | null | undefined;
          notes?:       string | null | undefined;
          user_id?:     string | undefined;
        };
        Relationships: [];
      };
      shots: {
        Row: {
          id:          string;
          session_id:  string;
          user_id:     string;
          yaw:         number;
          pitch:       number;
          roll:        number;
          angle_label: string;
          image_path:  string;
          created_at:  string;
        };
        Insert: {
          session_id:   string;
          yaw:          number;
          pitch:        number;
          roll:         number;
          angle_label:  string;
          image_path:   string;
          user_id?:     string | undefined;
          id?:          string | undefined;
          created_at?:  string | undefined;
        };
        Update: {
          session_id?:  string;
          yaw?:         number;
          pitch?:       number;
          roll?:        number;
          angle_label?: string;
          image_path?:  string;
          user_id?:     string | undefined;
        };
        Relationships: [];
      };
      checker_results: {
        Row: {
          id:               string;
          user_id:          string;
          before_path:      string;
          after_path:       string;
          yaw_diff:         number;
          pitch_diff:       number;
          roll_diff:        number;
          brightness_diff:  number;
          partial_detection: boolean;
          overall_level:    string;
          label:            string | null;
          created_at:       string;
        };
        Insert: {
          before_path:      string;
          after_path:       string;
          yaw_diff:         number;
          pitch_diff:       number;
          roll_diff:        number;
          brightness_diff:  number;
          partial_detection?: boolean;
          overall_level:    string;
          label?:           string | null;
          user_id?:         string | undefined;
          id?:              string | undefined;
          created_at?:      string | undefined;
        };
        Update: {
          before_path?:     string;
          after_path?:      string;
          overall_level?:   string;
          label?:           string | null;
          user_id?:         string | undefined;
        };
        Relationships: [];
      };
    };
    Views:          { [_ in never]: never };
    Functions:      { [_ in never]: never };
    Enums:          { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Case           = Database["public"]["Tables"]["cases"]["Row"];
export type AnglePreset    = Database["public"]["Tables"]["angle_presets"]["Row"];
export type CaptureSession = Database["public"]["Tables"]["capture_sessions"]["Row"];
export type Shot           = Database["public"]["Tables"]["shots"]["Row"];
export type CheckerResult  = Database["public"]["Tables"]["checker_results"]["Row"];
