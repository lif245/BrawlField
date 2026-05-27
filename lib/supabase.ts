import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Supabase client instance.
 * Automatically handles mock state internally if environment credentials are not present.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

/**
 * Mock Auth user type
 */
export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at?: string;
}

/**
 * Mock Strategy type
 */
export interface Strategy {
  id: string;
  user_id: string | null;
  map_id: number;
  map_name: string;
  map_image_url: string;
  title: string;
  description: string;
  canvas_data: any; // Coordinates, lines, paths drawn on board
  brawlers_data: any; // Placed brawlers positions
  created_at: string;
  updated_at: string;
}

/**
 * Mock Tier List type
 */
export interface TierList {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  tiers_data: any; // S, A, B, C, D, F arrays of Brawler IDs or full brawler structures
  created_at: string;
  updated_at: string;
}
