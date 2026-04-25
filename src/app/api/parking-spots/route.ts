import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { NewParkingSpot } from "@/lib/types";

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// GET /api/parking-spots?lat=...&lng=...&radius=0.05
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "0.05");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng query parameters are required." },
      { status: 400 },
    );
  }

  const supabase = serverSupabase();
  const { data, error } = await supabase
    .from("parking_spots")
    .select("*")
    .gte("latitude", lat - radius)
    .lte("latitude", lat + radius)
    .gte("longitude", lng - radius)
    .lte("longitude", lng + radius)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/parking-spots
export async function POST(request: NextRequest) {
  let body: NewParkingSpot;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { latitude, longitude, is_free } = body;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "latitude and longitude are required numbers." },
      { status: 400 },
    );
  }
  if (typeof is_free !== "boolean") {
    return NextResponse.json(
      { error: "is_free is a required boolean." },
      { status: 400 },
    );
  }

  const supabase = serverSupabase();
  const { data, error } = await supabase
    .from("parking_spots")
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
