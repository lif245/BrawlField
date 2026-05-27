"use client";

import React, { useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { Sidebar } from "../components/layout/Sidebar";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { Tooltip } from "../components/ui/Tooltip";
import { TrophyIcon, ShieldIcon, SwordIcon, SparklesIcon } from "../components/ui/icons";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-1 w-full">
      {/* Sidebar for showcase */}
      <Sidebar />

      {/* Main Page Area */}
      <PageContainer className="space-y-16 py-12">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center text-center py-16 px-4 overflow-hidden rounded-3xl border border-brawl-purple/20 bg-gradient-to-b from-brawl-purple/10 to-transparent">
          {/* Decorative glowing background blobs */}
          <div className="absolute top-1/4 left-1/4 -z-10 h-48 w-48 rounded-full bg-brawl-purple/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 -z-10 h-48 w-48 rounded-full bg-brawl-blue/20 blur-3xl" />
          
          <div className="relative animate-float inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brawl-yellow transform -skew-x-12 mb-6 shadow-[0_0_20px_rgba(247,211,58,0.4)]">
            <TrophyIcon className="text-black transform skew-x-12" size={24} />
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight text-white mb-6 leading-tight">
            BECOME A BRAWL <span className="text-brawl-yellow text-glow-yellow">LEGEND</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-300 mb-8 leading-relaxed">
            Welcome to the ultimate Esports arena. BrawlField delivers premium, interactive tier lists, team build setups, map analytical guides, and tactical details to outsmart your opponents.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
              Launch Showcase Modal
            </Button>
            <Button variant="secondary" size="lg" onClick={simulateLoading}>
              {isLoading ? "Loading meta..." : "Simulate Loading Data"}
            </Button>
          </div>
        </section>

        {/* Design System UI Showcase */}
        <section className="space-y-10">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-2xl font-heading font-black text-white tracking-wide">
              BrawlField <span className="text-brawl-purple">Design System Showcase</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">AAA-grade gaming styled components engineered for performance and immersive esports aesthetic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Buttons Showcase */}
            <Card variant="premium" glowColor="purple" className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-brawl-purple"><SwordIcon size={18} /></span>
                  <h3 className="text-lg font-heading font-bold text-white">Skewed Esports Buttons</h3>
                </div>
                <Badge variant="primary">Interactive</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400">
                  Custom-slanted control elements featuring native game border lines, realistic bottom-weighting shadows, micro-scaling on click, and electric neon glows.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="primary">Primary Yellow</Button>
                  <Button variant="secondary">Secondary Purple</Button>
                  <Button variant="success">Success Green</Button>
                  <Button variant="danger">Danger Red</Button>
                </div>
                <div className="flex justify-center pt-2">
                  <Button variant="ghost" className="w-full">Ghost / Transparent</Button>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-gray-500">Includes auto skewing toggles</span>
              </CardFooter>
            </Card>

            {/* Badges & Rarities Showcase */}
            <Card variant="premium" glowColor="yellow" className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-brawl-yellow"><SparklesIcon size={18} /></span>
                  <h3 className="text-lg font-heading font-bold text-white">Brawler Rarities & Badges</h3>
                </div>
                <Badge variant="secondary">Rarities</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-400">
                  Gaming chips for maps, battle modes, game styles, roles, and signature Brawl Stars rarity themes. Includes active pulsating glow variables.
                </p>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2.5">
                    <Badge variant="legendary">Legendary</Badge>
                    <Badge variant="mythic">Mythic</Badge>
                    <Badge variant="epic">Epic</Badge>
                    <Badge variant="super-rare">Super Rare</Badge>
                    <Badge variant="rare">Rare</Badge>
                    <Badge variant="common">Common</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-2 border-t border-white/5">
                    <Badge variant="primary">
                      <SwordIcon size={12} /> Damage Dealer
                    </Badge>
                    <Badge variant="secondary">
                      <ShieldIcon size={12} /> Tank
                    </Badge>
                    <Badge variant="outline">
                      <TrophyIcon size={12} /> Showdown
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-gray-500">Accurate color palettes</span>
              </CardFooter>
            </Card>

            {/* Inputs & Tooltips */}
            <Card variant="premium" glowColor="blue" className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-brawl-blue"><ShieldIcon size={18} /></span>
                  <h3 className="text-lg font-heading font-bold text-white">Inputs & Interactive Tooltips</h3>
                </div>
                <Badge variant="outline">Utilities</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-wider">Search Database</label>
                  <Input
                    placeholder="Search Brawlers, Maps, Guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <p className="text-xs text-brawl-yellow">Searching for: &quot;{searchQuery}&quot;</p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-wider">Tactical Tooltips (Hover to Reveal)</label>
                  <div className="flex gap-4">
                    <Tooltip content="Deals 3200 splash damage!" position="top">
                      <span className="cursor-pointer inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:text-brawl-yellow transition-all">
                        🚀 Super Attack Info
                      </span>
                    </Tooltip>
                    <Tooltip content="Brawl Stars Champions Cup 2026" position="right">
                      <span className="cursor-pointer inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:text-brawl-blue transition-all">
                        🏆 Tournament Meta
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-gray-500">Fluid tooltips with dynamic triggers</span>
              </CardFooter>
            </Card>

            {/* Skeletons Loading States */}
            <Card variant="premium" className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400"><TrophyIcon size={18} /></span>
                  <h3 className="text-lg font-heading font-bold text-white">Dynamic Loading Placeholders</h3>
                </div>
                <Badge variant="outline">Skeleton</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-400">
                  Elegant placeholders with glowing shimmer animation paths to prevent content-jump during heavy data loads.
                </p>

                {isLoading ? (
                  <div className="space-y-4 p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circular" className="h-12 w-12" />
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" className="w-1/3 h-5" />
                        <Skeleton variant="text" className="w-1/4 h-3.5" />
                      </div>
                    </div>
                    <Skeleton variant="rectangular" className="h-20 w-full" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-black/20 border border-white/5 border-dashed">
                    <p className="text-sm text-gray-400 mb-2">Simulated card output will display here</p>
                    <Button variant="ghost" size="sm" onClick={simulateLoading}>
                      Try Shimmer Loading
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <span className="text-xs text-gray-500">2.5s Shimmer wave loop</span>
              </CardFooter>
            </Card>

          </div>
        </section>

        {/* Modal Controller Showcase */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Brawl Stars Premium Strategy Platform"
        >
          <div className="space-y-5 text-left">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-brawl-purple/10 border border-brawl-purple/30">
              <div className="h-12 w-12 rounded-lg bg-brawl-purple flex items-center justify-center text-white shrink-0">
                <SparklesIcon size={24} />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-white text-base">PREMIUM ACCESS UNLOCKED</h4>
                <p className="text-xs text-gray-400">You are reviewing the BrawlField design sandbox interface.</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-300">
              This interactive dashboard and structural system are optimized for Next.js 16 and Tailwind CSS v4. Standard assets, brawler configurations, statistical integrations, maps analytics, and layouts flow dynamically with full dark-theme stability.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <Badge variant="legendary">AAA-Grade UI</Badge>
              <Badge variant="epic">Fast Loading</Badge>
              <Badge variant="super-rare">Tailwind V4</Badge>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Dismiss
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                alert("Sandbox Success! Welcome to BrawlField!");
                setIsModalOpen(false);
              }}>
                Accept Strategy Plan
              </Button>
            </div>
          </div>
        </Modal>

      </PageContainer>
    </div>
  );
}
