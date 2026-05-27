"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { SearchIcon, CloseIcon, ShieldIcon, TrophyIcon } from "@/components/ui/icons";
import type { BrawlMap } from "@/types/map";

interface MapsListClientProps {
  initialMaps: BrawlMap[];
}

export default function MapsListClient({ initialMaps }: MapsListClientProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedModeHash, setSelectedModeHash] = useState<string | null>(null);

  // Keep search query in sync with URL params if they change (e.g. clicking map link on Home)
  useEffect(() => {
    const paramSearch = searchParams.get("search");
    if (paramSearch) {
      setSearchQuery(paramSearch);
    }
  }, [searchParams]);

  // Extract unique game modes from maps
  const gameModes = useMemo(() => {
    const seen = new Map<number, { id: number; name: string; hash: string; color: string; imageUrl: string }>();
    initialMaps.forEach((map) => {
      const mode = map.gameMode;
      if (mode && !seen.has(mode.id)) {
        seen.set(mode.id, {
          id: mode.id,
          name: mode.name,
          hash: mode.hash,
          color: mode.color,
          imageUrl: mode.imageUrl,
        });
      }
    });
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [initialMaps]);

  // Filtering Logic
  const filteredMaps = useMemo(() => {
    return initialMaps.filter((map) => {
      const matchesSearch = map.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = selectedModeHash ? map.gameMode.hash === selectedModeHash : true;
      return matchesSearch && matchesMode;
    });
  }, [initialMaps, searchQuery, selectedModeHash]);

  // Group maps by Game Mode
  const groupedMaps = useMemo(() => {
    const groups: Record<number, { mode: typeof initialMaps[0]["gameMode"]; maps: BrawlMap[] }> = {};
    
    filteredMaps.forEach((map) => {
      const modeId = map.gameMode.id;
      if (!groups[modeId]) {
        groups[modeId] = {
          mode: map.gameMode,
          maps: [],
        };
      }
      groups[modeId].maps.push(map);
    });

    return Object.values(groups).sort((a, b) => a.mode.name.localeCompare(b.mode.name));
  }, [filteredMaps]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedModeHash(null);
  };

  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="space-y-10 py-12">
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-wide">
            MAPS & <span className="text-brawl-yellow">GAME MODES</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Explore active battlegrounds, layouts, environmental themes, and prepare your optimal team composition.
          </p>
        </div>

        {/* Controls Section: Search + Mode Filter Badges */}
        <div className="space-y-6 bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brawl-yellow transition-colors">
                <SearchIcon size={18} />
              </span>
              <Input
                placeholder="Search map by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedModeHash) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="text-brawl-red border border-brawl-red/20 hover:bg-brawl-red/10 flex items-center justify-center gap-1 w-full lg:w-auto"
              >
                <CloseIcon size={14} /> Clear All Filters
              </Button>
            )}
          </div>

          {/* Game Modes Filter */}
          <div className="space-y-2.5">
            <span className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-wider block">
              Filter by Game Mode
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedModeHash(null)}
                className={`cursor-pointer text-xs font-heading font-extrabold uppercase px-3 py-1.5 rounded transform -skew-x-12 border transition-all duration-200 ${
                  selectedModeHash === null
                    ? "bg-brawl-yellow text-black border-brawl-yellow shadow-[0_0_12px_rgba(247,211,58,0.2)]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="transform skew-x-12 inline-block">All Modes</span>
              </button>
              {gameModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedModeHash(selectedModeHash === mode.hash ? null : mode.hash)}
                  className={`cursor-pointer text-xs font-heading font-extrabold uppercase px-3.5 py-1.5 rounded transform -skew-x-12 border transition-all duration-200 flex items-center gap-2 ${
                    selectedModeHash === mode.hash
                      ? "text-white shadow-[0_0_12px_rgba(155,89,182,0.3)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                  }`}
                  style={{
                    backgroundColor: selectedModeHash === mode.hash ? `${mode.color}40` : undefined,
                    borderColor: selectedModeHash === mode.hash ? mode.color : undefined,
                  }}
                >
                  <span className="transform skew-x-12 flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mode.imageUrl} alt="" className="h-4 w-4 object-contain" />
                    {mode.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Map Groups */}
        <div className="space-y-12">
          {groupedMaps.map((group) => {
            const modeColor = group.mode.color || "#ffffff";
            return (
              <div 
                key={group.mode.id} 
                className="space-y-6 p-6 rounded-3xl border border-white/5 bg-gradient-to-b from-dark-surface/30 to-black/20 relative overflow-hidden"
              >
                {/* Visual Background Glow */}
                <div 
                  className="absolute top-0 right-0 h-48 w-48 rounded-full blur-[100px] opacity-10 pointer-events-none"
                  style={{ backgroundColor: modeColor }}
                />

                {/* Mode Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    {group.mode.imageUrl && (
                      <div className="h-10 w-10 relative shrink-0 p-1.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={group.mode.imageUrl} 
                          alt={group.mode.name}
                          className="h-7 w-7 object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h2 
                        className="text-xl sm:text-2xl font-heading font-black text-white leading-tight uppercase"
                        style={{ color: modeColor }}
                      >
                        {group.mode.name}
                      </h2>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        {group.maps.length} Maps found
                      </span>
                    </div>
                  </div>
                </div>

                {/* Maps Grid within this Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {group.maps.map((map) => (
                    <Card 
                      key={map.id} 
                      variant="interactive" 
                      className="border border-white/5 bg-dark-card flex flex-col justify-between"
                    >
                      <CardContent className="p-0 flex-1 flex flex-col justify-between">
                        {/* Map Image container */}
                        <div className="relative aspect-[4/3] w-full bg-black/40 overflow-hidden flex items-center justify-center p-3 border-b border-white/5 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={map.imageUrl} 
                            alt={map.name} 
                            className="h-full w-full object-contain relative z-10 transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />

                          {/* Map status indicators */}
                          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
                            {map.new && (
                              <Badge variant="legendary" className="text-[9px] py-0.5 px-1.5">
                                New
                              </Badge>
                            )}
                            {map.disabled && (
                              <Badge variant="common" className="text-[9px] py-0.5 px-1.5 bg-red-950/40 text-red-400 border-red-500/20">
                                Vaulted
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Map Details */}
                        <div className="p-4 space-y-3 bg-black/20 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-heading font-extrabold text-sm text-white uppercase truncate">
                              {map.name}
                            </h3>
                            <span className="text-[10px] text-gray-400 font-semibold tracking-wider block mt-1">
                              THEME: {map.environment?.name || "Standard theme"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            <span>Credits</span>
                            <span className="text-gray-400 truncate max-w-[100px]">{map.credit || "Supercell"}</span>
                          </div>

                          <Link href={`/maps/${map.id}/plan/`} className="block w-full pt-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              isSkewed={true} 
                              className="w-full text-[11px] py-1 border-brawl-yellow/10 hover:bg-brawl-yellow/10 hover:border-brawl-yellow/30 hover:text-brawl-yellow animate-pulse-glow"
                            >
                              Plan Strategy
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {groupedMaps.length === 0 && (
          <div className="text-center py-16 bg-black/20 border border-white/5 border-dashed rounded-2xl">
            <ShieldIcon className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-heading font-bold text-white mb-2">No Maps Match Your Filters</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              Try adjusting your map name query or selecting another game mode filter to explore active arenas.
            </p>
            <Button variant="secondary" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
