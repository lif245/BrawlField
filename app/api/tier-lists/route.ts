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
          .from("tier_lists")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Supabase get tier list error, falling back to mock:", error);
        } else if (data) {
          return NextResponse.json(data);
        }
      }

      // Fallback
      const tierList = mockDb.getTierList(id);
      if (!tierList) {
        return NextResponse.json({ error: "Tier list not found" }, { status: 404 });
      }
      return NextResponse.json(tierList);
    }

    if (userId) {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("tier_lists")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Supabase get user tier lists error, falling back to mock:", error);
        } else if (data) {
          return NextResponse.json(data);
        }
      }

      // Fallback
      const tierLists = mockDb.getTierLists(userId);
      return NextResponse.json(tierLists);
    }

    // Return all
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("tier_lists")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Supabase get all tier lists error, falling back to mock:", error);
      } else if (data) {
        return NextResponse.json(data);
      }
    }

    // Fallback
    const tierLists = mockDb.getTierLists();
    return NextResponse.json(tierLists);
  } catch (error: any) {
    console.error("API GET tier lists error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      user_id,
      title,
      description,
      tiers_data,
    } = body;

    if (!title || !tiers_data) {
      return NextResponse.json({ error: "Missing required fields: title and tiers_data" }, { status: 400 });
    }

    // Generate unique ID if not provided
    const tierListId = id || "tier-" + Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();

    const tierListData = {
      id: tierListId,
      user_id: user_id || null,
      title,
      description: description || "",
      tiers_data,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("tier_lists")
        .upsert({ ...tierListData, updated_at: now })
        .select()
        .single();

      if (error) {
        console.error("Supabase tier list save error, falling back to mock:", error);
      } else {
        return NextResponse.json(data);
      }
    }

    // Fallback to mock DB
    const saved = mockDb.saveTierList(tierListData);
    return NextResponse.json(saved);
  } catch (error: any) {
    console.error("API POST tier lists error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing tier list ID" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("tier_lists").delete().eq("id", id);
      if (error) {
        console.error("Supabase tier list delete error, falling back to mock:", error);
      } else {
        return NextResponse.json({ success: true, message: "Tier list deleted successfully" });
      }
    }

    // Fallback to mock DB
    const success = mockDb.deleteTierList(id);
    if (!success) {
      return NextResponse.json({ error: "Tier list not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Tier list deleted successfully" });
  } catch (error: any) {
    console.error("API DELETE tier lists error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
