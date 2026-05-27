import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mockDb";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const userId = url.searchParams.get("user_id");

    if (id) {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("strategies")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Supabase get strategy error, falling back to mock:", error);
        } else if (data) {
          return NextResponse.json(data);
        }
      }

      // Fallback
      const strategy = mockDb.getStrategy(id);
      if (!strategy) {
        return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
      }
      return NextResponse.json(strategy);
    }

    if (userId) {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("strategies")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Supabase get user strategies error, falling back to mock:", error);
        } else if (data) {
          return NextResponse.json(data);
        }
      }

      // Fallback
      const strategies = mockDb.getStrategies(userId);
      return NextResponse.json(strategies);
    }

    // Return all
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Supabase get all strategies error, falling back to mock:", error);
      } else if (data) {
        return NextResponse.json(data);
      }
    }

    // Fallback
    const strategies = mockDb.getStrategies();
    return NextResponse.json(strategies);
  } catch (error: any) {
    console.error("API GET strategies error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      user_id,
      map_id,
      map_name,
      map_image_url,
      title,
      description,
      canvas_data,
      brawlers_data,
    } = body;

    if (!map_id || !title) {
      return NextResponse.json({ error: "Missing required fields: map_id and title" }, { status: 400 });
    }

    // Generate unique ID if not provided
    const strategyId = id || "strat-" + Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    const strategyData = {
      id: strategyId,
      user_id: user_id || null,
      map_id: Number(map_id),
      map_name: map_name || "Brawl Stars Map",
      map_image_url: map_image_url || "https://cdn.brawlapi.com/maps/ld/15000014.png",
      title,
      description: description || "",
      canvas_data: canvas_data || { lines: [] },
      brawlers_data: brawlers_data || { placements: [] },
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("strategies")
        .upsert({ ...strategyData, updated_at: now })
        .select()
        .single();

      if (error) {
        console.error("Supabase strategy save error, falling back to mock:", error);
      } else {
        return NextResponse.json(data);
      }
    }

    // Fallback to mock DB
    const saved = mockDb.saveStrategy(strategyData);
    return NextResponse.json(saved);
  } catch (error: any) {
    console.error("API POST strategies error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing strategy ID" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("strategies").delete().eq("id", id);
      if (error) {
        console.error("Supabase strategy delete error, falling back to mock:", error);
      } else {
        return NextResponse.json({ success: true, message: "Strategy deleted successfully" });
      }
    }

    // Fallback to mock DB
    const success = mockDb.deleteStrategy(id);
    if (!success) {
      return NextResponse.json({ error: "Strategy not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Strategy deleted successfully" });
  } catch (error: any) {
    console.error("API DELETE strategies error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
