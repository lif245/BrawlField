import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BrawlersLoading() {
  // Create 8 placeholder skeleton cards
  const skeletonCards = Array.from({ length: 8 });

  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="space-y-10 py-12">
        {/* Header Skeleton */}
        <div className="space-y-4 border-b border-white/5 pb-6">
          <Skeleton variant="text" className="w-1/4 h-10" />
          <Skeleton variant="text" className="w-1/3 h-5" />
        </div>

        {/* Filters and Search Search Bar Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Skeleton variant="rectangular" className="w-full md:w-80 h-11" />
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Skeleton variant="rectangular" className="w-20 h-8" />
            <Skeleton variant="rectangular" className="w-20 h-8" />
            <Skeleton variant="rectangular" className="w-20 h-8" />
            <Skeleton variant="rectangular" className="w-20 h-8" />
          </div>
        </div>

        {/* Brawlers Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skeletonCards.map((_, idx) => (
            <div 
              key={`skeleton-${idx}`}
              className="rounded-xl overflow-hidden border border-white/5 bg-dark-card/40 h-[380px] flex flex-col justify-between"
            >
              {/* Image Skeleton */}
              <div className="aspect-square w-full flex items-center justify-center p-6 border-b border-white/5 bg-black/10 relative">
                <Skeleton variant="circular" className="h-32 w-32" />
                <Skeleton variant="rectangular" className="absolute top-3 left-3 w-16 h-5" />
                <Skeleton variant="rectangular" className="absolute bottom-3 right-3 w-20 h-5" />
              </div>
              
              {/* Meta Skeleton */}
              <div className="p-5 bg-black/20 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-3/4 h-6" />
                  <Skeleton variant="text" className="w-full h-4" />
                  <Skeleton variant="text" className="w-5/6 h-4" />
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <Skeleton variant="text" className="w-1/4 h-4" />
                  <Skeleton variant="text" className="w-1/3 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
