import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { categories } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: votes, error } = await supabase.from("votes").select("*");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch results." },
      { status: 500 }
    );
  }

  const results: Record<string, string> = {};

  for (const cat of categories) {
    const counts: Record<string, number> = {};
    for (const vote of votes) {
      const pick = vote[cat.key];
      if (pick) {
        counts[pick] = (counts[pick] || 0) + 1;
      }
    }

    let winner = "";
    let max = 0;
    for (const [name, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        winner = name;
      }
    }
    results[cat.key] = winner;
  }

  return NextResponse.json({ results, totalVoters: votes.length });
}
