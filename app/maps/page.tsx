import React, { Suspense } from "react";
import { getAllMaps } from "@/lib/api/maps";
import MapsListClient from "./MapsListClient";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export const dynamic = "force-dynamic";

function MapsLoading() {
  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="space-y-10 py-12">
        <div className="space-y-4 border-b border-white/5 pb-6">
          <Skeleton variant="text" className="w-1/4 h-10" />
          <Skeleton variant="text" className="w-1/3 h-5" />
        </div>
        <div className="flex gap-4">
          <Skeleton variant="rectangular" className="w-full md:w-80 h-11" />
        </div>
        <div className="space-y-12">
          <div className="space-y-6 p-6 rounded-3xl border border-white/5 bg-black/10">
            <Skeleton variant="text" className="w-48 h-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-56 border border-white/5 rounded-xl p-4 bg-black/20 flex flex-col justify-between">
                  <Skeleton variant="rectangular" className="w-full h-32" />
                  <Skeleton variant="text" className="w-3/4 h-4" />
                  <Skeleton variant="text" className="w-1/2 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

import type { BrawlMap } from "@/types/map";

export default async function MapsPage() {
  let maps: BrawlMap[] = [];

  try {
    maps = await getAllMaps({ cache: "no-store" });
  } catch (error) {
    console.error("Failed to fetch maps on server:", error);
  }

  return (
    <Suspense fallback={<MapsLoading />}>
      <MapsListClient initialMaps={maps} />
    </Suspense>
  );
}
