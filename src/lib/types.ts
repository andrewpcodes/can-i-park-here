export interface ParkingSpot {
  id: string;
  created_at: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_free: boolean;
  cost_per_hour: number | null;
  time_limit_minutes: number | null;
  restrictions: string | null;
  notes: string | null;
  upvotes: number;
  downvotes: number;
}

export type NewParkingSpot = Omit<
  ParkingSpot,
  "id" | "created_at" | "upvotes" | "downvotes"
>;
