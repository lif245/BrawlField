"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { TrophyIcon, ShieldIcon, SwordIcon, ClockIcon, SparklesIcon } from "@/components/ui/icons";
import type { GameEvent } from "@/types/event";

interface HomeClientProps {
  initialActive: GameEvent[];
  initialUpcoming: GameEvent[];
}

export default function HomeClient({ initialActive, initialUpcoming }: HomeClientProps) {
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>(initialActive);
  const [upcomingEvents, setUpcomingEvents] = useState<GameEvent[]>(initialUpcoming);
  const [now, setNow] = useState<Date | null>(null);

  // Set the client-side time only after mounting to avoid SSR mismatch issues
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time helper
  const formatTimeLeft = (targetTimeString: string, type: "active" | "upcoming") => {
    if (!now) return "00:00:00";
    const target = new Date(targetTimeString);
    const difference = target.getTime() - now.getTime();
    
    if (difference <= 0) {
      return type === "active" ? "Event Ended" : "Starting Now";
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getModeIconUrl = (hash: string) => {
    return `https://cdn.brawlapi.com/modes/png/${hash}.png`;
  };

  const getMapIconUrl = (mapId: number) => {
    return `https://cdn.brawlapi.com/maps/ld/${mapId}.png`;
  };

  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="space-y-16 py-12">
        {/* Banner/Hero Section */}
        <section className="relative flex flex-col items-center text-center py-20 px-6 overflow-hidden rounded-3xl border border-brawl-purple/20 bg-gradient-to-b from-brawl-purple/10 to-transparent">
          {/* Decorative glowing background blobs */}
          <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-brawl-purple/20 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-brawl-blue/20 blur-[100px]" />
          
          <div className="relative animate-float inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brawl-yellow transform -skew-x-12 mb-6 shadow-[0_0_30px_rgba(247,211,58,0.4)]">
            <TrophyIcon className="text-black transform skew-x-12" size={28} />
          </div>

          <h1 className="text-4xl sm:text-7xl font-heading font-black tracking-tight text-white mb-6 leading-none">
            WELCOME TO BRAWL<span className="text-brawl-yellow text-glow-yellow">FIELD</span>
          </h1>
          
          <p className="max-w-2xl text-lg text-gray-300 mb-10 leading-relaxed font-medium">
            The ultimate strategy arena for Brawl Stars players. Track real-time events, analyze brawlers' tactical stats, map rotations, and gain a competitive edge.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/brawlers">
              <Button variant="primary" size="lg" isSkewed={true} className="glow-btn-yellow">
                <span className="flex items-center gap-2">
                  <SwordIcon size={20} /> Browse Brawlers
                </span>
              </Button>
            </Link>
            <Link href="/maps">
              <Button variant="secondary" size="lg" isSkewed={true}>
                <span className="flex items-center gap-2">
                  <ShieldIcon size={20} /> Map Rotations
                </span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Real-time Event Rotation */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-3xl font-heading font-black text-white tracking-wide">
                Real-Time <span className="text-brawl-yellow">Event Rotation</span>
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Active battlegrounds and upcoming challenges directly updated from the arena.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-semibold text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </div>
          </div>

          {/* Active Events */}
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brawl-yellow shadow-[0_0_10px_#F7D33A]" />
              Active Events (Happening Now)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event, idx) => {
                const modeColor = event.mode?.color || "#F7D33A";
                return (
                  <Card 
                    key={`active-${event.slot}-${idx}`}
                    variant="premium" 
                    className="relative group transition-all duration-300 hover:scale-[1.02] border"
                    style={{ 
                      borderColor: `${modeColor}30`,
                      boxShadow: `0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${modeColor}10`
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500"
                      style={{ 
                        backgroundImage: `radial-gradient(circle at 50% 50%, ${modeColor} 0%, transparent 70%)` 
                      }}
                    />
                    
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-5">
                      <div className="flex items-center gap-3">
                        {event.mode?.hash && (
                          <div className="h-10 w-10 relative shrink-0 p-1 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={getModeIconUrl(event.mode.hash)} 
                              alt={event.mode.name}
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-heading font-extrabold text-white leading-tight uppercase">
                            {event.mode?.name || "Unknown Mode"}
                          </h4>
                          <span className="text-xs text-gray-500 font-semibold tracking-wider">SLOT {event.slot}</span>
                        </div>
                      </div>
                      <Badge 
                        style={{
                          backgroundColor: `${modeColor}15`,
                          color: modeColor,
                          borderColor: `${modeColor}40`
                        }}
                      >
                        Active
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-5 space-y-6">
                      <div className="flex items-center gap-4">
                        {event.map?.id && (
                          <div className="h-16 w-16 bg-black/40 rounded-xl overflow-hidden border border-white/10 shrink-0 flex items-center justify-center relative p-1 group-hover:border-brawl-yellow/40 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={getMapIconUrl(event.map.id)} 
                              alt={event.map.name}
                              className="h-14 w-14 object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Battle Map</span>
                          {event.map ? (
                            <Link 
                              href={`/maps?search=${encodeURIComponent(event.map.name)}`}
                              className="text-lg font-heading font-black text-white hover:text-brawl-yellow transition-colors mt-0.5 inline-block"
                            >
                              {event.map.name}
                            </Link>
                          ) : (
                            <span className="text-lg font-heading font-black text-gray-500 mt-0.5 block">Mystery Map</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <ClockIcon size={16} />
                          <span className="text-xs font-semibold uppercase tracking-wider">Ends In</span>
                        </div>
                        <div 
                          className="font-heading font-black text-lg tracking-wider text-glow-yellow"
                          style={{ color: modeColor }}
                        >
                          {formatTimeLeft(event.endTime, "active")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brawl-blue shadow-[0_0_10px_#3498DB]" />
              Upcoming Events (Starting Soon)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 4).map((event, idx) => {
                const modeColor = event.mode?.color || "#3498DB";
                return (
                  <Card 
                    key={`upcoming-${event.slot}-${idx}`}
                    variant="default"
                    className="relative border"
                    style={{ 
                      borderColor: "rgba(255,255,255,0.05)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
                    }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-4 bg-black/10">
                      <div className="flex items-center gap-2">
                        {event.mode?.hash && (
                          <div className="h-8 w-8 relative shrink-0 p-1 bg-white/5 rounded-md border border-white/10 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={getModeIconUrl(event.mode.hash)} 
                              alt={event.mode.name}
                              className="h-6 w-6 object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-heading font-bold text-sm text-white leading-tight uppercase truncate max-w-[100px]">
                            {event.mode?.name || "Unknown Mode"}
                          </h4>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 border-white/10 text-gray-400">
                        Upcoming
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">Battle Map</span>
                        {event.map ? (
                          <Link 
                            href={`/maps?search=${encodeURIComponent(event.map.name)}`}
                            className="text-base font-heading font-black text-gray-200 hover:text-brawl-yellow transition-colors mt-0.5 inline-block truncate max-w-full"
                          >
                            {event.map.name}
                          </Link>
                        ) : (
                          <span className="text-base font-heading font-black text-gray-500 mt-0.5 block">Mystery Map</span>
                        )}
                      </div>

                      <div className="bg-black/20 rounded-lg p-2.5 flex items-center justify-between border border-white/5">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Starts In</span>
                        <div className="font-heading font-bold text-sm text-brawl-blue">
                          {formatTimeLeft(event.startTime, "upcoming")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Links / Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="premium" className="hover:border-brawl-purple/40 border transition-all duration-300">
            <CardHeader>
              <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                <span className="text-brawl-purple"><SwordIcon size={18} /></span>
                Tactical Brawlers
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Explore the complete Brawler roster. View key statistics, damage output profiles, class classifications, and elite build setups including Star Powers and Gadgets.
              </p>
              <Link href="/brawlers">
                <Button variant="ghost" size="sm" className="w-full text-brawl-purple border border-brawl-purple/20 hover:bg-brawl-purple/10">
                  Enter Armory
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card variant="premium" className="hover:border-brawl-yellow/40 border transition-all duration-300">
            <CardHeader>
              <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                <span className="text-brawl-yellow"><TrophyIcon size={18} /></span>
                Map Analyzer
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Dive deep into Brawl Stars map structures. Discover meta trends, high-winrate team strategies, and game mode requirements to secure continuous trophy gains.
              </p>
              <Link href="/maps">
                <Button variant="ghost" size="sm" className="w-full text-brawl-yellow border border-brawl-yellow/20 hover:bg-brawl-yellow/10">
                  Analyze Arenas
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card variant="premium" className="hover:border-brawl-blue/40 border transition-all duration-300">
            <CardHeader>
              <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                <span className="text-brawl-blue"><SparklesIcon size={18} /></span>
                Tier List Setup
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Access up-to-date competitive rankings. Analyze S-tier picks and counter-strategies updated in real-time by esports pros and algorithmic performance indicators.
              </p>
              <Link href="/tier-list">
                <Button variant="ghost" size="sm" className="w-full text-brawl-blue border border-brawl-blue/20 hover:bg-brawl-blue/10">
                  View Meta List
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </PageContainer>
    </div>
  );
}
