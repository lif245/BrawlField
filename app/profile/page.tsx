"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { TrophyIcon, ShieldIcon, SparklesIcon, TrashIcon } from "@/components/ui/icons";
import Link from "next/link";

interface StrategyItem {
  id: string;
  title: string;
  description: string;
  map_name: string;
  map_image_url: string;
  created_at: string;
}

interface TierListItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  tiers_data: any;
}

export default function ProfileDashboardPage() {
  const { user, loginWithGoogle, mockLogin, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"strategies" | "tierlists">("strategies");
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [tierLists, setTierLists] = useState<TierListItem[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Custom mock login state
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("16000010"); // Leon default

  const avatarsList = [
    { id: "16000000", name: "Shelly" },
    { id: "16000004", name: "El Primo" },
    { id: "16000008", name: "Brock" },
    { id: "16000010", name: "Leon" },
    { id: "16000014", name: "Spike" },
    { id: "16000024", name: "Mortis" },
    { id: "16000030", name: "Crow" },
  ];

  // Fetch plans saved by user
  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    
    async function loadUserData() {
      setIsFetchingData(true);
      try {
        // Fetch strategies
        const stratRes = await fetch(`/api/strategies?user_id=${userId}`);
        const stratData = await stratRes.json();
        
        // Fetch tier lists
        const tierRes = await fetch(`/api/tier-lists?user_id=${userId}`);
        const tierData = await tierRes.json();
        
        // Merge with local storage strategies if any are found
        const localStrats = JSON.parse(localStorage.getItem("bf_mock_strategies") || "[]");
        const userLocalStrats = localStrats.filter((s: any) => s.user_id === userId || s.user_id === "mock-user-guest");
        
        const localLists = JSON.parse(localStorage.getItem("bf_mock_tierlists") || "[]");
        const userLocalLists = localLists.filter((l: any) => l.user_id === userId || l.user_id === "mock-user-guest");

        // De-duplicate strategies by id
        const mergedStrats = [...(Array.isArray(stratData) ? stratData : [])];
        userLocalStrats.forEach((ls: any) => {
          if (!mergedStrats.some((s) => s.id === ls.id)) {
            mergedStrats.push(ls);
          }
        });

        // De-duplicate tier lists by id
        const mergedLists = [...(Array.isArray(tierData) ? tierData : [])];
        userLocalLists.forEach((ll: any) => {
          if (!mergedLists.some((l) => l.id === ll.id)) {
            mergedLists.push(ll);
          }
        });

        setStrategies(mergedStrats);
        setTierLists(mergedLists);
      } catch (err) {
        console.error("Failed to load profile assets:", err);
        // Fallback exclusively to local storage
        const localStrats = JSON.parse(localStorage.getItem("bf_mock_strategies") || "[]");
        const localLists = JSON.parse(localStorage.getItem("bf_mock_tierlists") || "[]");
        setStrategies(localStrats);
        setTierLists(localLists);
      } finally {
        setIsFetchingData(false);
      }
    }

    loadUserData();
  }, [user]);

  // Handle plan deletion
  const handleDeleteStrategy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this battle strategy?")) return;

    try {
      await fetch(`/api/strategies?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("API delete not supported on this asset, clearing from local cache.");
    }

    // Clean from local storage as well
    const localStrats = JSON.parse(localStorage.getItem("bf_mock_strategies") || "[]");
    const updatedLocal = localStrats.filter((s: any) => s.id !== id);
    localStorage.setItem("bf_mock_strategies", JSON.stringify(updatedLocal));

    // Update state
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteTierList = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Tier List setup?")) return;

    try {
      await fetch(`/api/tier-lists?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("API delete not supported on this asset, clearing from local cache.");
    }

    // Clean from local storage
    const localLists = JSON.parse(localStorage.getItem("bf_mock_tierlists") || "[]");
    const updatedLocal = localLists.filter((l: any) => l.id !== id);
    localStorage.setItem("bf_mock_tierlists", JSON.stringify(updatedLocal));

    // Update state
    setTierLists((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    
    const avatarUrl = `https://cdn.brawlapi.com/brawlers/borders/${selectedAvatar}.png`;
    mockLogin(customName, customEmail || `${customName.toLowerCase()}@brawlfield.com`, avatarUrl);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 w-full items-center justify-center py-20">
        <span className="h-10 w-10 border-4 border-brawl-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // NOT LOGGED IN STATE
  if (!user) {
    return (
      <div className="flex flex-1 w-full">
        <PageContainer className="py-12 flex flex-col items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brawl-yellow transform -skew-x-12 mx-auto shadow-[0_0_30px_rgba(247,211,58,0.3)] animate-float">
                <TrophyIcon className="text-black transform skew-x-12" size={32} />
              </div>
              <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tight">
                Enter Strategy <span className="text-brawl-yellow">Vault</span>
              </h1>
              <p className="text-gray-400 text-sm">
                Unlock your personalized Dashboard, save drawing blueprints, publish meta tiers, and sync setups with your team players.
              </p>
            </div>

            {/* Simulated Auth Board */}
            <Card variant="premium" className="p-6 space-y-6">
              <div className="space-y-4">
                <Button
                  variant="primary"
                  className="w-full text-black hover:bg-yellow-400 py-3 uppercase tracking-wider font-extrabold flex items-center justify-center gap-2"
                  isSkewed={true}
                  onClick={loginWithGoogle}
                >
                  <SparklesIcon size={18} /> Sign In with Google
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Or Setup Mock Profile</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <form onSubmit={handleCustomLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      Custom Nickname *
                    </label>
                    <Input
                      placeholder="e.g. MortisGod, SpikeBlogger"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="bg-black/30 border-white/10"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      Email Address (Optional)
                    </label>
                    <Input
                      placeholder="e.g. user@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="bg-black/30 border-white/10"
                      type="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      Choose Profile Avatar
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {avatarsList.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar.id)}
                          className={`relative p-0.5 rounded-lg border overflow-hidden transition-all bg-black/40 ${
                            selectedAvatar === avatar.id
                              ? "border-brawl-yellow scale-110 shadow-[0_0_8px_rgba(247,211,58,0.4)]"
                              : "border-white/5 hover:border-white/20"
                          }`}
                          title={avatar.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://cdn.brawlapi.com/brawlers/borders/${avatar.id}.png`}
                            alt={avatar.name}
                            className="h-8 w-8 object-contain rounded-md"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full text-xs font-bold uppercase tracking-wider"
                  >
                    Launch Mock Sandbox Dashboard
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </PageContainer>
      </div>
    );
  }

  // LOGGED IN STATE
  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="py-10 space-y-8">
        
        {/* User Card Profile Header */}
        <Card variant="premium" className="overflow-hidden relative border-brawl-purple/10">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brawl-purple/10 blur-[50px] -z-10" />
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="relative h-20 w-20 rounded-full border-2 border-brawl-yellow p-0.5 bg-black/40 overflow-hidden shadow-2xl flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-contain"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <h2 className="text-3xl font-heading font-black text-white uppercase">{user.name}</h2>
                  <span className="bg-brawl-purple/20 border border-brawl-purple/40 text-brawl-purple text-[8px] font-heading font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Tier Elite Member
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1 font-medium">{user.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <span>Saved Strategies: <strong className="text-brawl-yellow">{strategies.length}</strong></span>
                  <span className="border-l border-white/5 pl-4">Tier lists: <strong className="text-brawl-blue">{tierLists.length}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/team-builder">
                <Button variant="primary" size="sm" isSkewed={true} className="glow-btn-yellow">
                  New Plan board
                </Button>
              </Link>
              <Link href="/tier-list">
                <Button variant="secondary" size="sm" isSkewed={true}>
                  Create Tier List
                </Button>
              </Link>
              <Button variant="ghost" size="sm" isSkewed={true} className="text-rose-500 hover:bg-rose-500/10 border-rose-500/20" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Tabs & Content */}
        <div className="space-y-6">
          <div className="flex border-b border-white/5 pb-px">
            <button
              onClick={() => setActiveTab("strategies")}
              className={`pb-4 px-6 font-heading font-extrabold text-base uppercase tracking-wider border-b-2 transition-all relative ${
                activeTab === "strategies"
                  ? "border-brawl-yellow text-brawl-yellow"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              My Saved Battle Plans ({strategies.length})
            </button>
            <button
              onClick={() => setActiveTab("tierlists")}
              className={`pb-4 px-6 font-heading font-extrabold text-base uppercase tracking-wider border-b-2 transition-all relative ${
                activeTab === "tierlists"
                  ? "border-brawl-yellow text-brawl-yellow"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              My Custom Tier Lists ({tierLists.length})
            </button>
          </div>

          {isFetchingData ? (
            <div className="py-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              Syncing content records...
            </div>
          ) : (
            <div>
              {/* Tab: Strategies */}
              {activeTab === "strategies" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {strategies.map((s) => (
                    <Card
                      key={s.id}
                      className="group border border-white/5 hover:border-brawl-yellow/30 bg-black/25 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                    >
                      <div className="relative aspect-[16/10] bg-black/40 overflow-hidden border-b border-white/5 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.map_image_url}
                          alt={s.map_name}
                          className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-black/80 border border-white/10 px-2.5 py-0.5 rounded-lg text-[9px] font-heading font-black text-white uppercase tracking-wider">
                          {s.map_name}
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-heading font-black text-white text-lg leading-snug group-hover:text-brawl-yellow transition-colors truncate max-w-full">
                            {s.title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                            {s.description || "No strategy instructions detailed for this board blueprint."}
                          </p>
                        </div>

                        <div className="flex gap-2 items-center justify-between pt-3 border-t border-white/5">
                          <span className="text-[9px] font-bold text-gray-500">
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <Link href={`/plan/${s.id}`} target="_blank">
                              <Button size="sm" variant="secondary">
                                View shared
                              </Button>
                            </Link>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 p-1"
                              onClick={() => handleDeleteStrategy(s.id)}
                            >
                              <TrashIcon size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {strategies.length === 0 && (
                    <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-black/10">
                      <div className="text-gray-500 text-sm mb-4">You have not created any battle strategies yet.</div>
                      <Link href="/team-builder">
                        <Button variant="primary" isSkewed={true}>
                          Launch Strategy Board
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Tier Lists */}
              {activeTab === "tierlists" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tierLists.map((l) => (
                    <Card
                      key={l.id}
                      className="group border border-white/5 hover:border-brawl-blue/30 bg-black/25 flex flex-col justify-between p-4 transition-all duration-300 hover:scale-[1.01]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-brawl-blue">
                          <TrophyIcon size={14} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Custom Ranking List</span>
                        </div>
                        
                        <h4 className="font-heading font-black text-white text-lg leading-snug group-hover:text-brawl-blue transition-colors truncate max-w-full">
                          {l.title}
                        </h4>
                        
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                          {l.description || "No analytical insights provided for this tier assignment."}
                        </p>
                      </div>

                      <div className="flex gap-2 items-center justify-between pt-4 mt-4 border-t border-white/5">
                        <span className="text-[9px] font-bold text-gray-500">
                          {new Date(l.created_at).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              alert("This tier list configuration:\n" + JSON.stringify(l.tiers_data, null, 2));
                            }}
                          >
                            Inspection
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 p-1"
                            onClick={() => handleDeleteTierList(l.id)}
                          >
                            <TrashIcon size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {tierLists.length === 0 && (
                    <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-black/10">
                      <div className="text-gray-500 text-sm mb-4">You have not ranked Brawlers in a Tier List yet.</div>
                      <Link href="/tier-list">
                        <Button variant="primary" isSkewed={true}>
                          Launch Tier List setup
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
