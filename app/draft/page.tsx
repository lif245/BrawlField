import React from "react";
import { getAllBrawlers } from "@/lib/api/brawlers";
import { getAllMaps } from "@/lib/api/maps";
import DraftClient from "./DraftClient";

import type { Brawler } from "@/types/brawler";
import type { BrawlMap } from "@/types/map";

export const dynamic = "force-dynamic";

export default async function DraftPage() {
  let brawlers: Brawler[] = [];
  let maps: BrawlMap[] = [];

  try {
    const [bList, mList] = await Promise.all([
      getAllBrawlers({ revalidate: 3600 }),
      getAllMaps({ revalidate: 3600 }),
    ]);
    
    // Fallback if null/undefined
    brawlers = bList || [];
    maps = mList || [];
  } catch (error) {
    console.error("Failed to fetch data for draft simulator:", error);
  }

  return (
    <DraftClient initialBrawlers={brawlers} initialMaps={maps} />
  );
}
