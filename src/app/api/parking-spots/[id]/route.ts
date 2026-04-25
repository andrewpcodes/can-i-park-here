import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// PATCH /api/parking-spots/[id]  – cast a vote
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: { vote: "up" | "down" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.vote !== "up" && body.vote !== "down") {
    return NextResponse.json(
      { error: 'vote must be "up" or "down".' },
      { status: 400 },
    );
  }

  const supabase = serverSupabase();
  const column = body.vote === "up" ? "upvotes" : "downvotes";

  // Fetch current value first
  const { data: current, error: fetchError } = await supabase
    .from("parking_spots")
    .select(column)
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Spot not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("parking_spots")
    .update({ [column]: (current[column as keyof typeof current] as number) + 1 })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
