import React from "react";
import Link from "next/link";
import { getBrawlerById } from "@/lib/api/brawlers";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { SwordIcon, ShieldIcon, StarIcon, TrophyIcon, SparklesIcon } from "@/components/ui/icons";

interface BrawlerDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const dynamic = "force-dynamic";

export default async function BrawlerDetailPage({ params }: BrawlerDetailPageProps) {
  // Resolve params for Next.js async params compatibility
  const resolvedParams = await params;
  const brawlerId = parseInt(resolvedParams.id, 10);

  if (isNaN(brawlerId)) {
    return renderNotFound();
  }

  const brawler = await getBrawlerById(brawlerId);

  if (!brawler) {
    return renderNotFound();
  }

  // Rarity Mapping
  const getRarityVariant = (rarityName: string): BadgeVariant => {
    const name = rarityName.toLowerCase();
    if (name.includes("legendary")) return "legendary";
    if (name.includes("mythic")) return "mythic";
    if (name.includes("epic")) return "epic";
    if (name.includes("super rare")) return "super-rare";
    if (name.includes("rare")) return "rare";
    return "common";
  };

  const rarityName = brawler.rarity?.name || "Common";
  const rarityColor = brawler.rarity?.color || "#ffffff";
  const className = brawler.class?.name || "Damage Dealer";
  const rarityVariant = getRarityVariant(rarityName);

  // Gamified Mock Stats based on standard calculations
  const mockStats = {
    offense: rarityName === "Legendary" ? 5 : rarityName === "Mythic" ? 4 : 3,
    defense: className === "Tank" ? 5 : className === "Support" ? 2 : 3,
    utility: className === "Support" ? 5 : className === "Assassin" ? 4 : 3,
    difficulty: rarityName === "Legendary" ? 4 : 2,
  };

  return (
    <div className="flex flex-1 w-full bg-radial from-dark-surface/50 to-dark-bg">
      <PageContainer className="py-12 space-y-12">
        {/* Navigation */}
        <div>
          <Link href="/brawlers">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-brawl-yellow border border-white/5">
              ← Back to Roster
            </Button>
          </Link>
        </div>

        {/* Profile Card / Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Big Borderless Image with Glow Background */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl border border-white/5 bg-gradient-to-tr from-black/60 to-dark-surface/30 relative overflow-hidden min-h-[400px]">
            {/* Glowing Aura mapping Brawler's custom rarity color */}
            <div 
              className="absolute h-80 w-80 rounded-full blur-[100px] opacity-25 animate-pulse-glow"
              style={{ backgroundColor: rarityColor }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brawler.imageUrl}
              alt={brawler.name}
              className="max-h-[350px] object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-float"
            />
            
            {/* Custom gaming-themed corner decorations */}
            <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-white/20 rounded-tl" />
            <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-white/20 rounded-tr" />
            <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/20 rounded-bl" />
            <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/20 rounded-br" />
          </div>

          {/* Right Column: Hero description & Stats details */}
          <div className="lg:col-span-7 flex flex-col justify-between p-8 rounded-3xl border border-white/5 bg-black/30 backdrop-blur-sm space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5 items-center">
                <Badge variant={rarityVariant}>{rarityName}</Badge>
                <Badge variant="outline" className="border-brawl-blue/30 text-brawl-blue bg-brawl-blue/5">
                  <span className="flex items-center gap-1.5 uppercase font-bold text-xs">
                    <SwordIcon size={12} />
                    {className}
                  </span>
                </Badge>
              </div>

              <h1 
                className="text-4xl sm:text-6xl font-heading font-black text-white uppercase tracking-tight"
                style={{ textShadow: `0 0 30px ${rarityColor}20` }}
              >
                {brawler.name}
              </h1>

              <p className="text-gray-300 text-base leading-relaxed font-medium">
                {brawler.description || "A signature arena combatant equipped with dynamic battle tactics and supreme mechanics."}
              </p>
            </div>

            {/* Tactical stats panel */}
            <div className="border-t border-b border-white/5 py-6 space-y-4">
              <h3 className="text-sm font-heading font-black text-white tracking-widest uppercase">
                Combat Ratings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Offense */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-400">
                    <span>Offense Power</span>
                    <span className="text-brawl-yellow font-bold">{mockStats.offense}/5</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-brawl-yellow rounded-full" 
                      style={{ width: `${(mockStats.offense / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Defense */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-400">
                    <span>Defensive Resilience</span>
                    <span className="text-brawl-green font-bold">{mockStats.defense}/5</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-brawl-green rounded-full" 
                      style={{ width: `${(mockStats.defense / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Utility */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-400">
                    <span>Strategic Utility</span>
                    <span className="text-brawl-blue font-bold">{mockStats.utility}/5</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-brawl-blue rounded-full" 
                      style={{ width: `${(mockStats.utility / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-400">
                    <span>Skill Difficulty</span>
                    <span className="text-brawl-purple font-bold">{mockStats.difficulty}/5</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-brawl-purple rounded-full" 
                      style={{ width: `${(mockStats.difficulty / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick spec cards */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><StarIcon size={14} className="text-brawl-yellow" /> Star Powers: {brawler.starPowers?.length || 0}</span>
              <span className="flex items-center gap-1.5"><SparklesIcon size={14} className="text-brawl-purple" /> Gadgets: {brawler.gadgets?.length || 0}</span>
              {brawler.unlock !== null && (
                <span className="flex items-center gap-1.5"><TrophyIcon size={14} className="text-brawl-blue" /> Unlocks At: {brawler.unlock}</span>
              )}
            </div>
          </div>
        </section>

        {/* Special Abilities: Star Powers & Gadgets */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Star Powers Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-black text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brawl-yellow shadow-[0_0_10px_#F7D33A]" />
              Signature Star Powers
            </h2>

            {brawler.starPowers && brawler.starPowers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {brawler.starPowers.map((sp) => (
                  <Tooltip key={sp.id} content={sp.description} position="top">
                    <Card 
                      variant="premium" 
                      className="border border-brawl-yellow/10 bg-gradient-to-b from-brawl-yellow/5 to-transparent hover:border-brawl-yellow/30 hover:scale-[1.02] cursor-pointer transition-all duration-300 h-full flex flex-col justify-between"
                    >
                      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b border-white/5">
                        <div className="h-12 w-12 bg-black/40 rounded-xl overflow-hidden border border-brawl-yellow/20 p-1 relative flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sp.imageUrl}
                            alt={sp.name}
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-heading font-extrabold text-white leading-tight uppercase text-sm">
                            {sp.name}
                          </h4>
                          <span className="text-[10px] text-brawl-yellow font-extrabold tracking-widest uppercase">
                            Star Power
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-semibold">
                          {sp.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Tooltip>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center rounded-2xl border border-dashed border-white/5 text-gray-500 font-semibold text-sm">
                No Star Powers registered for this brawler.
              </div>
            )}
          </div>

          {/* Gadgets Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-black text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brawl-green shadow-[0_0_10px_#2ECC71]" />
              Strategic Gadgets
            </h2>

            {brawler.gadgets && brawler.gadgets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {brawler.gadgets.map((gadget) => (
                  <Tooltip key={gadget.id} content={gadget.description} position="top">
                    <Card 
                      variant="premium" 
                      className="border border-brawl-green/10 bg-gradient-to-b from-brawl-green/5 to-transparent hover:border-brawl-green/30 hover:scale-[1.02] cursor-pointer transition-all duration-300 h-full flex flex-col justify-between"
                    >
                      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b border-white/5">
                        <div className="h-12 w-12 bg-black/40 rounded-xl overflow-hidden border border-brawl-green/20 p-1 relative flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gadget.imageUrl}
                            alt={gadget.name}
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-heading font-extrabold text-white leading-tight uppercase text-sm">
                            {gadget.name}
                          </h4>
                          <span className="text-[10px] text-brawl-green font-extrabold tracking-widest uppercase">
                            Gadget
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-semibold">
                          {gadget.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Tooltip>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center rounded-2xl border border-dashed border-white/5 text-gray-500 font-semibold text-sm">
                No Gadgets registered for this brawler.
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}

function renderNotFound() {
  return (
    <div className="flex flex-1 w-full items-center justify-center py-24">
      <PageContainer className="text-center space-y-6">
        <TrophyIcon className="text-gray-600 mx-auto" size={64} />
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-white">
          BRAWLER NOT FOUND
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          The brawler data could not be retrieved. They might be in a different arena or currently undergoing maintenance.
        </p>
        <div>
          <Link href="/brawlers">
            <Button variant="primary">
              Return to Brawlers
            </Button>
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
