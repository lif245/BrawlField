import React from "react";
import Link from "next/link";
import { getMapById } from "@/lib/api/maps";
import { getAllBrawlers } from "@/lib/api/brawlers";
import PlannerClient from "./PlannerClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { ShieldIcon } from "@/components/ui/icons";

import type { Brawler } from "@/types/brawler";
import type { BrawlMap } from "@/types/map";

interface PlannerPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const dynamic = "force-dynamic";

export default async function PlannerPage({ params }: PlannerPageProps) {
  const resolvedParams = await params;
  const mapId = parseInt(resolvedParams.id, 10);

  if (isNaN(mapId)) {
    return renderNotFound();
  }

  // Fetch map detail and all brawlers in parallel
  let mapData: BrawlMap | undefined;
  let brawlersData: Brawler[] = [];

  try {
    const [map, brawlers] = await Promise.all([
      getMapById(mapId),
      getAllBrawlers({ cache: "no-store" }),
    ]);
    mapData = map;
    brawlersData = brawlers;
  } catch (error) {
    console.error("Failed to load planner data on server:", error);
  }

  if (!mapData) {
    return renderNotFound();
  }

  return <PlannerClient map={mapData} brawlers={brawlersData} />;
}

function renderNotFound() {
  return (
    <div className="flex flex-1 w-full items-center justify-center py-24">
      <PageContainer className="text-center space-y-6">
        <ShieldIcon className="text-gray-600 mx-auto animate-bounce" size={64} />
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-white">
          PLANNING MAP NOT FOUND
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          The requested battleground could not be retrieved. Please check the map ID and try again.
        </p>
        <div>
          <Link href="/maps">
            <Button variant="primary">
              Return to Arenas
            </Button>
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
