"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { TrophyIcon, SparklesIcon } from "@/components/ui/icons";

interface BrawlerOption {
  id: number;
  name: string;
  imageUrl: string;
}

type TierGrade = "S" | "A" | "B" | "C" | "D" | "F";

interface TierListsData {
  S: number[];
  A: number[];
  B: number[];
  C: number[];
  D: number[];
  F: number[];
}

export default function TierListBuilderPage() {
  const { user, loginWithGoogle } = useAuth();
  const [brawlers, setBrawlers] = useState<BrawlerOption[]>([]);
  const [searchBrawler, setSearchBrawler] = useState("");
  const [selectedBrawlerForTier, setSelectedBrawlerForTier] = useState<BrawlerOption | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tiers, setTiers] = useState<TierListsData>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ id: string } | null>(null);

  // Load brawlers on mount
  useEffect(() => {
    async function loadBrawlers() {
      try {
        const res = await fetch("https://api.brawlapi.com/v1/brawlers");
        const data = await res.json();
        if (data?.list) {
          setBrawlers(
            data.list.map((b: any) => ({
              id: b.id,
              name: b.name,
              imageUrl: b.imageUrl,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load brawlers, using fallback:", err);
        setBrawlers([
          { id: 16000000, name: "Shelly", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000000.png" },
          { id: 16000004, name: "El Primo", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000004.png" },
          { id: 16000008, name: "Brock", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000008.png" },
          { id: 16000010, name: "Leon", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000010.png" },
          { id: 16000012, name: "Barley", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000012.png" },
          { id: 16000014, name: "Spike", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000014.png" },
        ]);
      }
    }
    loadBrawlers();
  }, []);

  const assignTier = (brawlerId: number, grade: TierGrade | "unassigned") => {
    setTiers((prev) => {
      // Remove brawler from all existing tiers
      const updatedTiers = {
        S: prev.S.filter((id) => id !== brawlerId),
        A: prev.A.filter((id) => id !== brawlerId),
        B: prev.B.filter((id) => id !== brawlerId),
        C: prev.C.filter((id) => id !== brawlerId),
        D: prev.D.filter((id) => id !== brawlerId),
        F: prev.F.filter((id) => id !== brawlerId),
      };

      // Add to new tier if selected
      if (grade !== "unassigned") {
        updatedTiers[grade] = [...updatedTiers[grade], brawlerId];
      }

      return updatedTiers;
    });
    setSelectedBrawlerForTier(null);
  };

  const handleSaveTierList = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your Tier List.");
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch("/api/tier-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null, // Allow guest/mock saves
          title,
          description,
          tiers_data: tiers,
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      setSaveResult(data);
      alert("Tier List saved successfully!");
    } catch (err) {
      console.error("Failed to save tier list:", err);
      // Fallback
      const fallbackId = "tier-local-" + Math.random().toString(36).substring(2, 11);
      const mockSavedList = {
        id: fallbackId,
        user_id: user?.id || "mock-user-guest",
        title,
        description,
        tiers_data: tiers,
        created_at: new Date().toISOString(),
      };
      
      const localLists = JSON.parse(localStorage.getItem("bf_mock_tierlists") || "[]");
      localLists.push(mockSavedList);
      localStorage.setItem("bf_mock_tierlists", JSON.stringify(localLists));
      
      setSaveResult({ id: fallbackId });
      alert("Saved to local browser database!");
    } finally {
      setIsSaving(false);
    }
  };

  // Find if brawler is in any tier
  const getBrawlerTier = (brawlerId: number): TierGrade | "unassigned" => {
    if (tiers.S.includes(brawlerId)) return "S";
    if (tiers.A.includes(brawlerId)) return "A";
    if (tiers.B.includes(brawlerId)) return "B";
    if (tiers.C.includes(brawlerId)) return "C";
    if (tiers.D.includes(brawlerId)) return "D";
    if (tiers.F.includes(brawlerId)) return "F";
    return "unassigned";
  };

  const getTierColor = (grade: TierGrade) => {
    switch (grade) {
      case "S": return "bg-rose-600 border-rose-500 text-white";
      case "A": return "bg-orange-500 border-orange-400 text-black";
      case "B": return "bg-amber-400 border-amber-300 text-black";
      case "C": return "bg-yellow-300 border-yellow-200 text-black";
      case "D": return "bg-green-500 border-green-400 text-white";
      case "F": return "bg-blue-600 border-blue-500 text-white";
    }
  };

  const filteredBrawlers = brawlers.filter((b) =>
    b.name.toLowerCase().includes(searchBrawler.toLowerCase())
  );

  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-heading font-black text-white">
            Brawler <span className="text-brawl-yellow">Tier List Setup</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Build your ultimate ranking grid. Click any brawler to place them into your custom tier levels!
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL: Tier List Editor */}
          <div className="xl:col-span-8 space-y-6">
            <Card variant="premium" className="overflow-hidden">
              <CardContent className="p-0 divide-y divide-white/5">
                {/* S, A, B, C, D, F Tier Rows */}
                {(["S", "A", "B", "C", "D", "F"] as TierGrade[]).map((grade) => {
                  const brawlerIds = tiers[grade];
                  return (
                    <div key={grade} className="flex min-h-[90px] group/row">
                      {/* Tier Label */}
                      <div className={`w-24 md:w-32 shrink-0 flex items-center justify-center font-heading font-black text-3xl md:text-4xl border-r border-white/5 shadow-inner select-none ${getTierColor(grade)}`}>
                        {grade}
                      </div>

                      {/* Tier Items Grid */}
                      <div className="flex-1 p-3 flex flex-wrap gap-2.5 bg-black/20 group-hover/row:bg-white/[0.02] transition-colors items-center">
                        {brawlerIds.map((id) => {
                          const brawler = brawlers.find((b) => b.id === id);
                          if (!brawler) return null;
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedBrawlerForTier(brawler)}
                              className="relative flex flex-col items-center bg-black/40 border border-white/10 p-1.5 rounded-xl hover:border-brawl-yellow/50 transition-all hover:scale-105 active:scale-95 group"
                              title={`Click to reassign ${brawler.name}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={brawler.imageUrl} alt={brawler.name} className="h-10 w-10 object-contain rounded-md" />
                              <span className="absolute -top-1 -right-1 text-[8px] bg-red-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                ✕
                              </span>
                            </button>
                          );
                        })}
                        {brawlerIds.length === 0 && (
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider pl-2 select-none italic">
                            Empty Row
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            
            {/* Unassigned Roster Selection Panel */}
            <Card>
              <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
                <h3 className="font-heading font-extrabold text-white text-base">
                  Available Brawlers
                </h3>
                <Input
                  placeholder="Filter by name..."
                  value={searchBrawler}
                  onChange={(e) => setSearchBrawler(e.target.value)}
                  className="bg-black/30 border-white/10 max-w-[200px] h-8 text-xs"
                />
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {filteredBrawlers.map((b) => {
                    const activeTier = getBrawlerTier(b.id);
                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrawlerForTier(b)}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                          activeTier !== "unassigned"
                            ? "bg-brawl-purple/10 border-brawl-purple/40 opacity-50 hover:opacity-100"
                            : "bg-black/30 border-white/5 hover:border-brawl-yellow/30 hover:bg-white/5"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.imageUrl} alt={b.name} className="h-10 w-10 object-contain rounded-md" />
                        <span className="text-[9px] text-gray-300 font-extrabold tracking-wide text-center uppercase truncate max-w-full mt-1.5">
                          {b.name}
                        </span>
                        {activeTier !== "unassigned" && (
                          <span className="text-[8px] bg-brawl-yellow text-black font-extrabold rounded-md px-1 py-0.5 scale-90 mt-1 uppercase">
                            Tier {activeTier}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL: Meta Information & Form */}
          <div className="xl:col-span-4 space-y-6">
            <Card variant="premium" className="border-brawl-yellow/10">
              <CardHeader className="p-4 border-b border-white/5">
                <h3 className="font-heading font-extrabold text-white text-base flex items-center gap-2">
                  <TrophyIcon size={16} className="text-brawl-yellow animate-bounce" />
                  Meta Settings
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Tier List Title *
                  </label>
                  <Input
                    placeholder="e.g. Gem Grab Meta - Tier List"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/30 border-white/10"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Rankings Description
                  </label>
                  <textarea
                    placeholder="Provide insights for these selections (e.g. S-tiers are based on hypercharges and active gadgets)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brawl-yellow"
                    maxLength={500}
                  />
                </div>

                <Button
                  variant="primary"
                  className="w-full mt-4 glow-btn-yellow text-glow-yellow"
                  size="lg"
                  isSkewed={true}
                  onClick={handleSaveTierList}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Tier List Setup"}
                </Button>
              </CardContent>
            </Card>

            {saveResult && (
              <Card className="border-emerald-500/20 bg-emerald-500/5 animate-in fade-in zoom-in-95 duration-200">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <SparklesIcon size={16} className="text-emerald-400 animate-spin" />
                    <span className="text-sm font-heading font-extrabold uppercase tracking-wide">Saved & Published!</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This tier list setup has been successfully deployed. Navigating to your dashboard profile to view it anytime.
                  </p>
                  <a
                    href="/profile"
                    className="block text-center text-xs font-extrabold text-brawl-yellow hover:underline"
                  >
                    Go to My Dashboard ↗
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modal-like Overlay to select Tier Assigning for a specific Brawler */}
        {selectedBrawlerForTier && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-bg border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedBrawlerForTier.imageUrl} alt={selectedBrawlerForTier.name} className="h-14 w-14 object-contain rounded-xl border border-white/10 bg-black/40 p-1" />
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Reassign Grade</span>
                  <h3 className="text-xl font-heading font-black text-white">{selectedBrawlerForTier.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["S", "A", "B", "C", "D", "F"] as TierGrade[]).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => assignTier(selectedBrawlerForTier.id, grade)}
                    className={`py-3 rounded-xl font-heading font-black text-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${getTierColor(grade)}`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => assignTier(selectedBrawlerForTier.id, "unassigned")}
                  className="flex-1 py-2 text-xs font-bold text-center text-rose-500 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  Unassign (Remove)
                </button>
                <button
                  onClick={() => setSelectedBrawlerForTier(null)}
                  className="flex-1 py-2 text-xs font-bold text-center text-gray-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
