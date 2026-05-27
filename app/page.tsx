import React from "react";
import { getActiveEvents, getUpcomingEvents } from "@/lib/api/events";
import HomeClient from "./HomeClient";

import type { GameEvent } from "@/types/event";

// Force dynamic fetch to keep events updated in real-time
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch active and upcoming events concurrently on the server
  let activeEvents: GameEvent[] = [];
  let upcomingEvents: GameEvent[] = [];

  try {
    const [active, upcoming] = await Promise.all([
      getActiveEvents({ cache: "no-store" }),
      getUpcomingEvents({ cache: "no-store" }),
    ]);
    activeEvents = active || [];
    upcomingEvents = upcoming || [];
  } catch (error) {
    console.error("Failed to fetch events on the server:", error);
  }

  return (
    <HomeClient 
      initialActive={activeEvents} 
      initialUpcoming={upcomingEvents} 
    />
  );
}
