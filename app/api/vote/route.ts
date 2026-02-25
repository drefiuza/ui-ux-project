import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { categories } from "@/lib/projects";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();

  const { voter_name } = body;
  if (!voter_name || typeof voter_name !== "string" || !voter_name.trim()) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }

  for (const cat of categories) {
    if (!body[cat.key] || typeof body[cat.key] !== "string") {
      return NextResponse.json(
        { error: `Please select a project for ${cat.label}.` },
        { status: 400 }
      );
    }
  }

  const row: Record<string, string> = { voter_name: voter_name.trim() };
  for (const cat of categories) {
    row[cat.key] = body[cat.key];
  }

  const { error } = await getSupabase().from("votes").insert(row);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You've already voted! Each person can only vote once." },
        { status: 409 }
      );
    }
    console.error("Supabase error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
