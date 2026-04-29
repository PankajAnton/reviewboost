import { createClient } from "@supabase/supabase-js";

// TODO: Replace with your real Supabase project values in .env (see .env.example)
// VITE_SUPABASE_URL — Project Settings → API → Project URL
// VITE_SUPABASE_ANON_KEY — Project Settings → API → anon public key
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://YOUR_PROJECT_ID.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
