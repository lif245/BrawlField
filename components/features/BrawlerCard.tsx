"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type { Brawler } from "@/types/brawler";
import { SwordIcon, ShieldIcon, StarIcon, TrophyIcon } from "@/components/ui/icons";

interface BrawlerCardProps {
  brawler: Brawler;
}

export const BrawlerCard = ({ brawler }: BrawlerCardProps) => {
  // Helper to map rarity string to badge variant
  const getRarityVariant = (rarityName: string): BadgeVariant => {
    const name = rarityName.toLowerCase();
    if (name.includes("legendary")) return "legendary";
    if (name.includes("mythic")) return "mythic";
    if (name.includes("epic")) return "epic";
    if (name.includes("super rare")) return "super-rare";
    if (name.includes("rare")) return "rare";
    return "common";
  };

  // Helper to map rarity to glow color
  const getRarityGlow = (rarityName: string): "yellow" | "purple" | "blue" | "none" => {
    const name = rarityName.toLowerCase();
    if (name.includes("legendary")) return "yellow";
    if (name.includes("mythic") || name.includes("epic")) return "purple";
    if (name.includes("super rare")) return "blue";
    return "none";
  };

  // Class / Role Icon helper
  const getRoleIcon = (className: string) => {
    const name = className.toLowerCase();
    if (name.includes("damage dealer") || name.includes("assassin") || name.includes("marksman")) {
      return <SwordIcon size={12} />;
    }
    if (name.includes("tank") || name.includes("bull") || name.includes("heavyweight")) {
      return <ShieldIcon size={12} />;
    }
    if (name.includes("support") || name.includes("healer")) {
      return <StarIcon size={12} />;
    }
    return <TrophyIcon size={12} />;
  };

  const rarityName = brawler.rarity?.name || "Common";
  const className = brawler.class?.name || "Damage Dealer";
  const rarityVariant = getRarityVariant(rarityName);
  const glowColor = getRarityGlow(rarityName);

  return (
    <Link href={`/brawlers/${brawler.id}`} className="block group">
      <Card
        variant="interactive"
        glowColor={glowColor}
        className="h-full border border-white/5 bg-dark-card overflow-hidden flex flex-col justify-between"
      >
        <CardContent className="p-0 flex-1 flex flex-col justify-between">
          {/* Card Top: Image Area with colored glowing background based on rarity */}
          <div className="relative aspect-square w-full bg-gradient-to-t from-dark-surface/90 to-black/10 overflow-hidden flex items-center justify-center p-6 border-b border-white/5">
            {/* Background glowing circle mapping rarity color */}
            <div 
              className="absolute h-36 w-36 rounded-full blur-3xl opacity-20 group-hover:scale-125 transition-transform duration-500" 
              style={{ backgroundColor: brawler.rarity?.color || "#ffffff" }}
            />
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brawler.imageUrl}
              alt={brawler.name}
              className="h-full w-full object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300"
              loading="lazy"
            />
            
            {/* Rarity Tag */}
            <div className="absolute top-3 left-3 z-20">
              <Badge variant={rarityVariant}>{rarityName}</Badge>
            </div>

            {/* Role Tag */}
            <div className="absolute bottom-3 right-3 z-20">
              <Badge variant="outline" className="text-[10px] bg-black/60 backdrop-blur-sm border-white/10 text-gray-300 py-0.5">
                <span className="flex items-center gap-1">
                  {getRoleIcon(className)}
                  {className}
                </span>
              </Badge>
            </div>
          </div>

          {/* Card Bottom: Meta info */}
          <div className="p-5 bg-black/35 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-heading font-black tracking-wide text-white group-hover:text-brawl-yellow transition-colors duration-200 uppercase truncate">
                {brawler.name}
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                {brawler.description || "A powerful brawler ready to conquer the arena."}
              </p>
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <span>Super Skill</span>
              <span className="text-brawl-yellow">View Specs →</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
export default BrawlerCard;
