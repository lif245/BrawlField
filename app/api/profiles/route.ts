import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mockDb";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, avatar_url } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      // Save in Supabase
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id, email, name, avatar_url, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) {
        console.error("Supabase Profile save error, falling back to mock:", error);
      } else {
        return NextResponse.json(data);
      }
    }

    // Fallback to local mock db
    const saved = mockDb.saveProfile({
      id,
      email,
      name,
      avatar_url: avatar_url || "https://cdn.brawlapi.com/brawlers/borders/16000000.png",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error("API Profile error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
