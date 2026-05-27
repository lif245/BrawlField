"use client";

import React, { useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchIcon, CloseIcon, TrophyIcon } from "@/components/ui/icons";
import { BrawlerCard } from "@/components/features/BrawlerCard";
import type { Brawler } from "@/types/brawler";

interface BrawlersListClientProps {
  brawlers: Brawler[];
}

export default function BrawlersListClient({ brawlers }: BrawlersListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Dynamic filter lists based on API response content
  const rarities = useMemo(() => {
    const unique = new Set(brawlers.map((b) => b.rarity?.name).filter(Boolean));
    return Array.from(unique).sort();
  }, [brawlers]);

  const classes = useMemo(() => {
    const unique = new Set(brawlers.map((b) => b.class?.name).filter(Boolean));
    return Array.from(unique).sort();
  }, [brawlers]);

  // Filtering Logic
  const filteredBrawlers = useMemo(() => {
    return brawlers.filter((brawler) => {
      const matchesSearch = brawler.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity = selectedRarity ? brawler.rarity?.name === selectedRarity : true;
      const matchesClass = selectedClass ? brawler.class?.name === selectedClass : true;
      return matchesSearch && matchesRarity && matchesClass;
    });
  }, [brawlers, searchQuery, selectedRarity, selectedClass]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRarity(null);
    setSelectedClass(null);
  };

  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="space-y-10 py-12">
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-wide">
            TACTICAL <span className="text-brawl-yellow">BRAWLERS</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse the complete roster of heroes. Compare attack stats, unique classes, and find your next S-Tier main.
          </p>
        </div>

        {/* Controls Section: Search + Filters */}
        <div className="space-y-6 bg-black/20 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brawl-yellow transition-colors">
                <SearchIcon size={18} />
              </span>
              <Input
                placeholder="Search Brawler by name..."
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
            {(searchQuery || selectedRarity || selectedClass) && (
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

          {/* Rarity Filter Badges */}
          <div className="space-y-2.5">
            <span className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-wider block">
              Filter by Rarity
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRarity(null)}
                className={`cursor-pointer text-xs font-heading font-extrabold uppercase px-3 py-1.5 rounded transform -skew-x-12 border transition-all duration-200 ${
                  selectedRarity === null
                    ? "bg-brawl-yellow text-black border-brawl-yellow shadow-[0_0_12px_rgba(247,211,58,0.2)]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="transform skew-x-12 inline-block">All Rarities</span>
              </button>
              {rarities.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(selectedRarity === rarity ? null : rarity)}
                  className={`cursor-pointer text-xs font-heading font-extrabold uppercase px-3 py-1.5 rounded transform -skew-x-12 border transition-all duration-200 ${
                    selectedRarity === rarity
                      ? "bg-brawl-purple text-white border-brawl-purple shadow-[0_0_12px_rgba(155,89,182,0.3)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span className="transform skew-x-12 inline-block">{rarity}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Class Filter Badges */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <span className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-wider block">
              Filter by Role/Class
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedClass(null)}
                className={`cursor-pointer text-xs font-heading font-extrabold uppercase px-3 py-1.5 rounded transform -skew-x-12 border transition-all duration-200 ${
                  selectedClass === null
                    ? "bg-brawl-yellow text-black border-brawl-yellow shadow-[0_0_12px_rgba(247,211,58,0.2)]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="transform skew-x-12 inline-block">All Classes</span>
              </button>
              {classes.map((className) => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(selectedClass === className ? null : className)}
                  className={`cursor-pointer text-xs font-heading font-extrabold uppercase px-3 py-1.5 rounded transform -skew-x-12 border transition-all duration-200 ${
                    selectedClass === className
                      ? "bg-brawl-blue text-white border-brawl-blue shadow-[0_0_12px_rgba(52,152,219,0.3)]"
                      : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span className="transform skew-x-12 inline-block">{className}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-sm text-gray-400 font-semibold uppercase tracking-wider">
          <span>Found {filteredBrawlers.length} Brawlers</span>
          {filteredBrawlers.length === 0 && (
            <span className="text-brawl-red">No matches found</span>
          )}
        </div>

        {/* Brawlers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBrawlers.map((brawler) => (
            <BrawlerCard key={brawler.id} brawler={brawler} />
          ))}
        </div>

        {/* Empty State */}
        {filteredBrawlers.length === 0 && (
          <div className="text-center py-16 bg-black/20 border border-white/5 border-dashed rounded-2xl">
            <TrophyIcon className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-heading font-bold text-white mb-2">No Brawlers Match Your Criteria</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              Try adjusting your search query, rarity selection, or class role filter to explore other legendary arena heroes.
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
