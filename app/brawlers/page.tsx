import React from "react";
import { getAllBrawlers } from "@/lib/api/brawlers";
import BrawlersListClient from "./BrawlersListClient";
import type { Brawler } from "@/types/brawler";

// Revalidate occasionally or force dynamic
export const dynamic = "force-dynamic";

export default async function BrawlersPage() {
  let brawlers: Brawler[] = [];

  try {
    brawlers = await getAllBrawlers({ cache: "no-store" });
  } catch (error) {
    console.error("Failed to fetch brawlers on server:", error);
  }

  return <BrawlersListClient brawlers={brawlers} />;
}
