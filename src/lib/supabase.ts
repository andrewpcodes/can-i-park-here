import { createClient } from "@supabase/supabase-js";
import type { ParkingSpot } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<{ public: { Tables: { parking_spots: { Row: ParkingSpot } } } }>(
  supabaseUrl,
  supabaseAnonKey,
);
