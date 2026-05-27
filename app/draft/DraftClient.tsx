"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { 
  TrophyIcon, 
  ClockIcon, 
  ShieldIcon, 
  SwordIcon, 
  StarIcon, 
  SearchIcon, 
  SparklesIcon, 
  CloseIcon 
} from "@/components/ui/icons";
import type { Brawler } from "@/types/brawler";
import type { BrawlMap } from "@/types/map";

// 3v3 Competitive Turn Flow Sequence
const TURN_SEQUENCE = [
  { id: "BLUE_BAN_1", team: "BLUE", phase: "BAN", label: "Blue Team Ban 1" },
  { id: "RED_BAN_1", team: "RED", phase: "BAN", label: "Red Team Ban 1" },
  { id: "BLUE_BAN_2", team: "BLUE", phase: "BAN", label: "Blue Team Ban 2" },
  { id: "RED_BAN_2", team: "RED", phase: "BAN", label: "Red Team Ban 2" },
  { id: "BLUE_PICK_1", team: "BLUE", phase: "PICK", label: "Blue Team Pick 1" },
  { id: "RED_PICK_1", team: "RED", phase: "PICK", label: "Red Team Pick 1" },
  { id: "RED_PICK_2", team: "RED", phase: "PICK", label: "Red Team Pick 2" },
  { id: "BLUE_PICK_2", team: "BLUE", phase: "PICK", label: "Blue Team Pick 2" },
  { id: "BLUE_PICK_3", team: "BLUE", phase: "PICK", label: "Blue Team Pick 3" },
  { id: "RED_PICK_3", team: "RED", phase: "PICK", label: "Red Team Pick 3" },
] as const;

interface DraftClientProps {
  initialBrawlers: Brawler[];
  initialMaps: BrawlMap[];
}

export default function DraftClient({ initialBrawlers, initialMaps }: DraftClientProps) {
  // Screen and Flow States
  const [phase, setPhase] = useState<"MAP_SELECTION" | "DRAFTING" | "COMPLETE">("MAP_SELECTION");
  const [selectedMap, setSelectedMap] = useState<BrawlMap | null>(null);

  // Draft Collections
  const [blueBans, setBlueBans] = useState<Brawler[]>([]);
  const [redBans, setRedBans] = useState<Brawler[]>([]);
  const [bluePicks, setBluePicks] = useState<Brawler[]>([]);
  const [redPicks, setRedPicks] = useState<Brawler[]>([]);

  // Selection Index (Pointer to TURN_SEQUENCE)
  const [currentTurnIdx, setCurrentTurnIdx] = useState<number>(0);
  const currentTurn = TURN_SEQUENCE[currentTurnIdx];

  // Currently hovered/pre-selected brawler before locking
  const [preSelectedBrawler, setPreSelectedBrawler] = useState<Brawler | null>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");

  // Visual Event Log
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [shackTimer, setShakeTimer] = useState<boolean>(false);

  // Rarity options extracted from brawlers data
  const rarities = useMemo(() => {
    const list = new Set<string>();
    initialBrawlers.forEach(b => {
      if (b.rarity?.name) list.add(b.rarity.name);
    });
    return ["ALL", ...Array.from(list)];
  }, [initialBrawlers]);

  // Class / Role options extracted from brawlers data
  const classes = useMemo(() => {
    const list = new Set<string>();
    initialBrawlers.forEach(b => {
      if (b.class?.name) list.add(b.class.name);
    });
    return ["ALL", ...Array.from(list)];
  }, [initialBrawlers]);

  // Filtered Brawlers List
  const filteredBrawlers = useMemo(() => {
    return initialBrawlers.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity = selectedRarity === "ALL" || b.rarity?.name === selectedRarity;
      const matchesClass = selectedClass === "ALL" || b.class?.name === selectedClass;
      return matchesSearch && matchesRarity && matchesClass;
    });
  }, [initialBrawlers, searchQuery, selectedRarity, selectedClass]);

  // Set of already banned/picked brawlers to disable them in Grid
  const unavailableBrawlersIds = useMemo(() => {
    const ids = new Set<number>();
    blueBans.forEach(b => ids.add(b.id));
    redBans.forEach(b => ids.add(b.id));
    bluePicks.forEach(b => ids.add(b.id));
    redPicks.forEach(b => ids.add(b.id));
    return ids;
  }, [blueBans, redBans, bluePicks, redPicks]);

  // Start Draft Simulator after Map Selection
  const handleSelectMap = (map: BrawlMap) => {
    setSelectedMap(map);
    setPhase("DRAFTING");
    setCurrentTurnIdx(0);
    setBlueBans([]);
    setRedBans([]);
    setBluePicks([]);
    setRedPicks([]);
    setPreSelectedBrawler(null);
    setTimeLeft(30);
    setEventLog([`🏟️ Battle Ground Set: ${map.name} (${map.gameMode.name})`]);
  };

  // Timer logic
  useEffect(() => {
    if (phase !== "DRAFTING" || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer Expired: Execute Auto Selection
          handleAutoSelect();
          return 30;
        }
        if (prev <= 6) {
          setShakeTimer(true);
          setTimeout(() => setShakeTimer(false), 200);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentTurnIdx, isPaused]);

  // Lock In Brawler Choice
  const handleLockIn = (brawler: Brawler) => {
    if (unavailableBrawlersIds.has(brawler.id)) return;

    const currentTurnInfo = TURN_SEQUENCE[currentTurnIdx];
    const logMsg = currentTurnInfo.phase === "BAN" 
      ? `🚫 ${currentTurnInfo.team === "BLUE" ? "Blue" : "Red"} BANNED ${brawler.name}`
      : `🔥 ${currentTurnInfo.team === "BLUE" ? "Blue" : "Red"} LOCKED ${brawler.name}`;
    
    setEventLog(prev => [logMsg, ...prev]);

    if (currentTurnInfo.phase === "BAN") {
      if (currentTurnInfo.team === "BLUE") {
        setBlueBans(prev => [...prev, brawler]);
      } else {
        setRedBans(prev => [...prev, brawler]);
      }
    } else {
      if (currentTurnInfo.team === "BLUE") {
        setBluePicks(prev => [...prev, brawler]);
      } else {
        setRedPicks(prev => [...prev, brawler]);
      }
    }

    // Move to next turn or complete
    if (currentTurnIdx < TURN_SEQUENCE.length - 1) {
      setCurrentTurnIdx(prev => prev + 1);
      setPreSelectedBrawler(null);
      setTimeLeft(30);
    } else {
      setPhase("COMPLETE");
      setEventLog(prev => ["🏆 Draft Phase Complete! Let the Battle Begin!", ...prev]);
    }
  };

  // AI/Auto Select when Time expires or Auto-pick button clicked
  const handleAutoSelect = () => {
    // Determine the recommended Brawlers
    const recommendations = aiRecommendations;
    const bestChoice = recommendations.length > 0 
      ? recommendations[0] 
      : filteredBrawlers.find(b => !unavailableBrawlersIds.has(b.id));

    if (bestChoice) {
      handleLockIn(bestChoice);
    }
  };

  // Reset Simulator
  const handleReset = () => {
    setPhase("MAP_SELECTION");
    setSelectedMap(null);
    setBlueBans([]);
    setRedBans([]);
    setBluePicks([]);
    setRedPicks([]);
    setCurrentTurnIdx(0);
    setPreSelectedBrawler(null);
    setTimeLeft(30);
    setIsPaused(false);
    setEventLog([]);
  };

  // Helper mapping Game Modes to Brawler synergies
  const getGameModeWeight = (modeName: string, brawler: Brawler): number => {
    const lowerMode = modeName.toLowerCase();
    const bClass = brawler.class?.name?.toLowerCase() || "";
    
    if (lowerMode.includes("ball")) {
      // Brawl Ball favors Tanks, speed boosts (Support), & wall breakers
      if (bClass.includes("tank")) return 15;
      if (bClass.includes("support")) return 10;
      if (bClass.includes("damage dealer")) return 8;
    } else if (lowerMode.includes("grab")) {
      // Gem Grab favors Controller/Support to hold center or control sides
      if (bClass.includes("controller") || bClass.includes("control")) return 15;
      if (bClass.includes("support")) return 12;
      if (bClass.includes("marksman")) return 8;
    } else if (lowerMode.includes("bounty") || lowerMode.includes("knockout")) {
      // Bounty/Knockout favor snipers (Marksman) & Assassins
      if (bClass.includes("marksman") || bClass.includes("sniper")) return 20;
      if (bClass.includes("assassin")) return 15;
      if (bClass.includes("support")) return 5;
    } else if (lowerMode.includes("heist")) {
      // Heist favors raw high damage output (Damage Dealers)
      if (bClass.includes("damage dealer")) return 20;
      if (bClass.includes("artillery") || bClass.includes("thrower")) return 12;
      if (bClass.includes("tank")) return 8;
    } else if (lowerMode.includes("zone")) {
      // Hot Zone favors Area Controllers & Throwers
      if (bClass.includes("controller") || bClass.includes("control")) return 20;
      if (bClass.includes("artillery") || bClass.includes("thrower")) return 15;
      if (bClass.includes("tank")) return 10;
    }
    return 5; // Default average
  };

  // Real-time AI Assistant Calculations
  const aiAnalysis = useMemo(() => {
    if (!selectedMap) return { blueSynergy: 50, redSynergy: 50, blueCounter: 50, redCounter: 50 };

    const modeName = selectedMap.gameMode.name;

    // Calculate Synergy Score
    const calculateSynergy = (picks: Brawler[]) => {
      if (picks.length === 0) return 50;
      let score = 50;

      // Unique Classes check
      const classesInTeam = picks.map(p => p.class?.name || "");
      const uniqueClasses = new Set(classesInTeam);
      
      if (picks.length >= 2) {
        if (uniqueClasses.size === picks.length) {
          score += 15; // Diverse roles
        } else {
          score -= 10; // Overlapping roles
        }
      }

      // Specific Synergies: Support + Tank
      const hasSupport = classesInTeam.some(c => c.toLowerCase().includes("support"));
      const hasTank = classesInTeam.some(c => c.toLowerCase().includes("tank"));
      if (hasSupport && hasTank) {
        score += 15;
      }

      // Marksman + frontline balance
      const hasMarksman = classesInTeam.some(c => c.toLowerCase().includes("marksman"));
      if (hasMarksman && hasTank) {
        score += 10;
      }

      // Hard Limit score range
      return Math.max(10, Math.min(100, score));
    };

    // Calculate Counter-pick advantages
    const calculateCounter = (myPicks: Brawler[], enemyPicks: Brawler[]) => {
      if (myPicks.length === 0 || enemyPicks.length === 0) return 50;
      let advantage = 50;

      myPicks.forEach(my => {
        const myClass = my.class?.name?.toLowerCase() || "";
        
        enemyPicks.forEach(enemy => {
          const enemyClass = enemy.class?.name?.toLowerCase() || "";

          // Assassin counters Marksman
          if (myClass.includes("assassin") && enemyClass.includes("marksman")) {
            advantage += 8;
          }
          // Assassin counters Artillery/Thrower
          if (myClass.includes("assassin") && enemyClass.includes("artillery")) {
            advantage += 8;
          }
          // Tank counters Assassin
          if (myClass.includes("tank") && enemyClass.includes("assassin")) {
            advantage += 8;
          }
          // Damage Dealer counters Tank
          if (myClass.includes("damage dealer") && enemyClass.includes("tank")) {
            advantage += 8;
          }
          // Marksman/Sniper counters Tank (kiting in open area)
          if (myClass.includes("marksman") && enemyClass.includes("tank")) {
            advantage += 6;
          }

          // Opposite effect (enemy counters me)
          if (enemyClass.includes("assassin") && myClass.includes("marksman")) {
            advantage -= 8;
          }
          if (enemyClass.includes("assassin") && myClass.includes("artillery")) {
            advantage -= 8;
          }
          if (enemyClass.includes("tank") && myClass.includes("assassin")) {
            advantage -= 8;
          }
          if (enemyClass.includes("damage dealer") && myClass.includes("tank")) {
            advantage -= 8;
          }
        });
      });

      return Math.max(10, Math.min(95, advantage));
    };

    const blueSynergy = calculateSynergy(bluePicks);
    const redSynergy = calculateSynergy(redPicks);

    const blueCounterAdv = calculateCounter(bluePicks, redPicks);
    const redCounterAdv = calculateCounter(redPicks, bluePicks);

    return {
      blueSynergy,
      redSynergy,
      blueCounter: blueCounterAdv,
      redCounter: redCounterAdv
    };
  }, [selectedMap, bluePicks, redPicks]);

  // Core AI Recommendations Algorithm
  const aiRecommendationsData = useMemo(() => {
    if (!selectedMap || phase === "COMPLETE") return { list: [], reasons: [] };

    const modeName = selectedMap.gameMode.name;
    const currentTeam = currentTurn.team;
    const isBanPhase = currentTurn.phase === "BAN";

    const myPicks = currentTeam === "BLUE" ? bluePicks : redPicks;
    const enemyPicks = currentTeam === "BLUE" ? redPicks : bluePicks;

    const scoredBrawlers = initialBrawlers
      .filter(b => !unavailableBrawlersIds.has(b.id))
      .map(b => {
        let score = 50; // Starting baseline
        const bClass = b.class?.name?.toLowerCase() || "";
        const bName = b.name;

        // 1. Map & Mode Weight
        score += getGameModeWeight(modeName, b);

        // 2. Draft Phase specifics (Ban or Pick)
        if (isBanPhase) {
          // In Ban Phase, score high potential threats that enemy might want
          // Example: Ban top-tier characters of the current game mode
          if (modeName.toLowerCase().includes("bounty") && bClass.includes("marksman")) score += 20;
          if (modeName.toLowerCase().includes("ball") && bClass.includes("tank")) score += 20;
          if (modeName.toLowerCase().includes("heist") && bName === "Colette") score += 30; // Heist legend
        } else {
          // In Pick Phase, focus on Counter and Synergy
          
          // Counter-pick opportunities
          enemyPicks.forEach(enemy => {
            const enemyClass = enemy.class?.name?.toLowerCase() || "";

            if (bClass.includes("assassin") && enemyClass.includes("marksman")) score += 25;
            if (bClass.includes("assassin") && enemyClass.includes("artillery")) score += 25;
            if (bClass.includes("tank") && enemyClass.includes("assassin")) score += 25;
            if (bClass.includes("damage dealer") && enemyClass.includes("tank")) score += 25;
          });

          // Synergy boost with current team
          const teamClasses = myPicks.map(p => p.class?.name?.toLowerCase() || "");
          if (teamClasses.includes("tank") && bClass.includes("support")) score += 15;
          if (teamClasses.includes("support") && bClass.includes("tank")) score += 15;
          
          // Penalize duplicate class picks
          if (teamClasses.includes(bClass)) {
            score -= 20;
          }
        }

        return { brawler: b, score };
      })
      .sort((a, b) => b.score - a.score);

    // Get top 3
    const recommendations = scoredBrawlers.slice(0, 3).map(x => x.brawler);
    
    // Generate intelligent reasoning strings for top 3
    const reasons = recommendations.map(b => {
      const bClass = b.class?.name || "";
      const bName = b.name;

      if (isBanPhase) {
        return `🚫 HIGH RISK: Ban ${bName} (${bClass}) because they dominate on ${selectedMap.gameMode.name} maps.`;
      }

      // Check if this solves an enemy pick
      let counterReason = "";
      enemyPicks.forEach(enemy => {
        const enemyClass = enemy.class?.name?.toLowerCase() || "";
        const myClass = b.class?.name?.toLowerCase() || "";

        if (myClass.includes("assassin") && enemyClass.includes("marksman")) {
          counterReason = `🎯 COUNTER: Excellent pick to dive and eliminate ${enemy.name} (${enemy.class?.name}).`;
        } else if (myClass.includes("tank") && enemyClass.includes("assassin")) {
          counterReason = `🛡️ WALL: Extremely durable, perfect to counter ${enemy.name}'s close combat damage.`;
        } else if (myClass.includes("damage dealer") && enemyClass.includes("tank")) {
          counterReason = `💥 SHREDDER: Designed to melt high-HP pools like ${enemy.name} (${enemy.class?.name}) quickly.`;
        }
      });
      if (counterReason) return counterReason;

      // Check synergy
      const teamClasses = myPicks.map(p => p.class?.name?.toLowerCase() || "");
      if (teamClasses.includes("tank") && bClass.toLowerCase().includes("support")) {
        return `💖 SYNERGY: Great support abilities to heal and sustain your frontline tank.`;
      }

      // Check Mode recommendation
      if (modeName.toLowerCase().includes("heist") && bClass.toLowerCase().includes("damage dealer")) {
        return `🎰 TARGET BURST: High DPS structure, perfect for bursting the Heist Safe down fast.`;
      }
      if (modeName.toLowerCase().includes("ball") && bClass.toLowerCase().includes("tank")) {
        return `⚽ FRONT RUNNER: High health pool enables pushing through goals easily.`;
      }

      return `⭐ ALL-STAR: Highly balanced ${bClass} choice for ${selectedMap.gameMode.name}.`;
    });

    return { list: recommendations, reasons };
  }, [selectedMap, phase, currentTurn, bluePicks, redPicks, blueBans, redBans, initialBrawlers, unavailableBrawlersIds]);

  const aiRecommendations = aiRecommendationsData.list;
  const aiReasons = aiRecommendationsData.reasons;

  // Selected Map Popular recommendations (used in pre-pick screen)
  const getPrePickRecommendations = (map: BrawlMap) => {
    const mode = map.gameMode.name.toLowerCase();
    
    // Static curated top picks for Esports modes
    if (mode.includes("ball")) {
      return initialBrawlers.filter(b => ["Frank", "Shelly", "Max"].includes(b.name)).slice(0, 3);
    } else if (mode.includes("grab")) {
      return initialBrawlers.filter(b => ["Poco", "Gene", "Spike"].includes(b.name)).slice(0, 3);
    } else if (mode.includes("bounty") || mode.includes("knockout")) {
      return initialBrawlers.filter(b => ["Piper", "Leon", "Nani"].includes(b.name)).slice(0, 3);
    } else if (mode.includes("heist")) {
      return initialBrawlers.filter(b => ["Colette", "Colt", "Spike"].includes(b.name)).slice(0, 3);
    } else {
      return initialBrawlers.slice(0, 3);
    }
  };

  return (
    <PageContainer className="text-gray-100 pb-24">
      {/* ESPORTS HEADER ZONE */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 mb-8 p-6 bg-gradient-to-r from-dark-surface/90 to-dark-surface/40 border border-dark-border rounded-2xl glass-panel-premium">
        <div className="absolute top-0 left-0 w-32 h-[2px] bg-brawl-yellow"></div>
        <div className="absolute top-0 right-0 w-32 h-[2px] bg-brawl-purple"></div>

        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brawl-yellow"></span>
            </span>
            <span className="text-xs uppercase tracking-widest text-brawl-yellow font-heading font-extrabold">
              Brawl Stars Arena Live
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-1">
            Esports Draft <span className="text-brawl-yellow text-glow-yellow">Simulator</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Simulate pro-tier 3v3 tournament draft with real-time strategic counter-picks and AI recommendation.
          </p>
        </div>

        {phase !== "MAP_SELECTION" && selectedMap && (
          <div className="flex items-center gap-4 bg-black/40 px-5 py-3 rounded-xl border border-white/5">
            {selectedMap.gameMode.imageUrl && (
              <img 
                src={selectedMap.gameMode.imageUrl} 
                alt={selectedMap.gameMode.name} 
                className="w-10 h-10 object-contain"
              />
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-heading font-semibold">Current Arena</p>
              <h4 className="text-white text-base font-bold">{selectedMap.name}</h4>
              <p className="text-xs text-glow-purple font-semibold" style={{ color: selectedMap.gameMode.color }}>
                {selectedMap.gameMode.name}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="ml-2 hover:bg-red-500/20 text-red-400">
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* PHASE 1: MAP SELECTION DISPLAY */}
      {phase === "MAP_SELECTION" && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-white">Select Battlefield</h2>
            <p className="text-gray-400 text-sm">
              Every battle begins with map environment tactics. Choose a map below to unlock AI pre-picks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialMaps.length > 0 ? (
              initialMaps.slice(0, 12).map((map) => {
                const prePicks = getPrePickRecommendations(map);
                return (
                  <Card 
                    key={map.id} 
                    className="glass-panel-premium glass-panel-interactive border border-dark-border cursor-pointer group flex flex-col justify-between"
                    onClick={() => handleSelectMap(map)}
                  >
                    <div className="relative h-40 overflow-hidden rounded-t-xl bg-dark-bg">
                      {map.imageUrl ? (
                        <img
                          src={map.imageUrl}
                          alt={map.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-black/80 flex items-center justify-center">
                          <TrophyIcon className="text-white/20" size={48} />
                        </div>
                      )}
                      
                      {/* Game Mode Pill */}
                      <div className="absolute top-3 left-3 bg-black/75 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                        {map.gameMode.imageUrl && (
                          <img src={map.gameMode.imageUrl} alt="" className="w-4 h-4 object-contain" />
                        )}
                        <span className="text-xs font-bold text-white tracking-wide">{map.gameMode.name}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-white tracking-tight">{map.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">Environment: {map.environment.name || "Stadium"}</p>
                      </div>

                      {/* AI Pre-pick preview */}
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <SparklesIcon className="text-brawl-yellow w-3.5 h-3.5" />
                          <span className="text-[10px] font-heading font-black text-brawl-yellow uppercase tracking-widest">
                            AI Popular Picks
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {prePicks.map(b => (
                            <div key={b.id} className="relative w-8 h-8 rounded-md overflow-hidden bg-black/50 border border-white/10">
                              <img src={b.imageUrl} alt={b.name} className="object-cover w-full h-full" />
                            </div>
                          ))}
                          <span className="text-[10px] text-gray-400 font-medium">Highly favored in {map.gameMode.name}</span>
                        </div>
                      </div>

                      <Button variant="primary" size="sm" className="w-full">
                        SELECT ARENA
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                Loading game maps data... Please wait.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2 & 3: MAIN DRAFT ARENA CLIENT */}
      {phase !== "MAP_SELECTION" && selectedMap && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: BLUE TEAM (3 PICK / 2 BAN) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between border-b border-brawl-blue/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brawl-blue animate-pulse"></span>
                <h2 className="text-xl font-black text-brawl-blue tracking-wider">Blue Team</h2>
              </div>
              <Badge variant="primary" className="bg-brawl-blue/20 text-brawl-blue border border-brawl-blue/30 uppercase tracking-widest font-heading text-[10px]">
                ALLIES
              </Badge>
            </div>

            {/* BLUE BAN SLOT */}
            <div className="space-y-3">
              <p className="text-xs uppercase text-gray-400 font-heading font-black tracking-widest">
                Team Bans (Max 2)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((idx) => {
                  const brawler = blueBans[idx];
                  const isActive = currentTurn.phase === "BAN" && currentTurn.team === "BLUE" && blueBans.length === idx;
                  return (
                    <div 
                      key={idx}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl bg-dark-surface border transition-all duration-300 overflow-hidden ${
                        isActive 
                          ? "border-brawl-blue shadow-[0_0_15px_rgba(52,152,219,0.35)] animate-pulse" 
                          : "border-white/5"
                      }`}
                    >
                      {brawler ? (
                        <>
                          <img src={brawler.imageUrl} alt={brawler.name} className="w-full h-full object-cover brightness-50" />
                          <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
                            <span className="text-brawl-red font-heading font-black border-2 border-brawl-red px-2 py-0.5 transform -rotate-12 rounded text-xs uppercase tracking-widest">
                              Banned
                            </span>
                          </div>
                          <span className="absolute bottom-1 text-[10px] text-white font-bold bg-black/75 px-1.5 py-0.5 rounded">
                            {brawler.name}
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-600">
                          <CloseIcon size={24} />
                          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Empty</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BLUE PICK SLOTS */}
            <div className="space-y-4">
              <p className="text-xs uppercase text-gray-400 font-heading font-black tracking-widest">
                Combat Picks (3v3)
              </p>
              
              {[0, 1, 2].map((idx) => {
                const brawler = bluePicks[idx];
                const isActive = currentTurn.phase === "PICK" && currentTurn.team === "BLUE" && bluePicks.length === idx;
                return (
                  <div 
                    key={idx}
                    className={`relative flex items-center gap-4 p-3.5 rounded-xl bg-dark-surface border transition-all duration-300 overflow-hidden h-[90px] ${
                      isActive 
                        ? "border-brawl-blue shadow-[0_0_20px_rgba(52,152,219,0.4)] ring-1 ring-brawl-blue" 
                        : "border-white/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brawl-blue animate-pulse"></div>
                    )}
                    
                    {brawler ? (
                      <>
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/50">
                          <img src={brawler.imageUrl} alt={brawler.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest font-heading" style={{ color: brawler.rarity?.color || "#ffffff" }}>
                            {brawler.rarity?.name || "Common"}
                          </span>
                          <h4 className="text-white text-base font-black truncate">{brawler.name}</h4>
                          <span className="inline-block bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-300 border border-white/5 mt-0.5 uppercase tracking-wider font-semibold">
                            {brawler.class?.name || "Brawler"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 font-bold block">SLOT 0{idx + 1}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full border border-dashed border-white/5 rounded-lg text-gray-600 text-xs gap-2">
                        {isActive ? (
                          <>
                            <span className="animate-ping w-2 h-2 rounded-full bg-brawl-blue"></span>
                            <span className="text-brawl-blue font-heading font-black uppercase tracking-wider">Picking now...</span>
                          </>
                        ) : (
                          <span className="uppercase tracking-widest font-bold text-[10px]">Awaiting Slot</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SYNERGY PANEL FOR BLUE */}
            <div className="bg-black/30 p-4 rounded-xl border border-brawl-blue/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brawl-blue uppercase tracking-wider">Team Synergy</span>
                <span className="text-sm font-black text-white">{aiAnalysis.blueSynergy}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-brawl-blue h-full transition-all duration-500"
                  style={{ width: `${aiAnalysis.blueSynergy}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-brawl-blue uppercase tracking-wider">Counter Rating</span>
                <span className="text-sm font-black text-white">{aiAnalysis.blueCounter}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-brawl-blue h-full transition-all duration-500"
                  style={{ width: `${aiAnalysis.blueCounter}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* CENTER: COUNDOWN TIMER & DRAFT GRID AND CONTROLS (6 COLS) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* TIMER & TURN FLOW CAROUSEL */}
            <div className="glass-panel-premium border border-dark-border p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Backglow depending on active team */}
              {phase === "DRAFTING" && (
                <div className={`absolute -inset-10 opacity-15 blur-3xl pointer-events-none rounded-full transition-all duration-1000 ${
                  currentTurn.team === "BLUE" ? "bg-brawl-blue" : "bg-brawl-red"
                }`}></div>
              )}

              {phase === "DRAFTING" ? (
                <>
                  <div className="text-center space-y-1 z-10">
                    <span className={`text-xs font-heading font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      currentTurn.team === "BLUE" 
                        ? "bg-brawl-blue/10 border-brawl-blue/30 text-brawl-blue" 
                        : "bg-brawl-red/10 border-brawl-red/30 text-brawl-red"
                    }`}>
                      {currentTurn.label}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      {currentTurn.phase === "BAN" ? "🚫 CHOOSE BRAWLER TO BAN" : "⚔️ CHOOSE BRAWLER TO LOCK IN"}
                    </h3>
                  </div>

                  {/* Circular Timer Visual representation */}
                  <div className="my-6 relative z-10 flex items-center justify-center">
                    <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                      timeLeft <= 5 
                        ? "border-brawl-red text-brawl-red shadow-[0_0_20px_rgba(231,76,60,0.6)]" 
                        : currentTurn.team === "BLUE"
                          ? "border-brawl-blue text-brawl-blue shadow-[0_0_15px_rgba(52,152,219,0.3)]"
                          : "border-brawl-red text-brawl-red shadow-[0_0_15px_rgba(231,76,60,0.3)]"
                    } ${shackTimer ? "animate-bounce scale-110" : ""}`}>
                      <ClockIcon size={24} className="opacity-80" />
                      <span className="text-4xl font-extrabold mt-1 tracking-tighter">
                        {timeLeft}
                      </span>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex gap-3 z-10">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsPaused(p => !p)}
                      className="border-white/10 hover:border-white/20 text-xs px-4"
                    >
                      {isPaused ? "▶️ Resume" : "⏸️ Pause Clock"}
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={handleAutoSelect}
                      className="text-xs px-4 flex items-center gap-1.5"
                    >
                      <SparklesIcon className="w-3.5 h-3.5" />
                      AI Auto Lock
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-4 z-10">
                  <div className="w-16 h-16 bg-brawl-yellow/10 border border-brawl-yellow/30 text-brawl-yellow rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(247,211,58,0.2)]">
                    <TrophyIcon size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-glow-yellow text-brawl-yellow">DRAFT COMPLETE</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-heading">
                      Competitive Simulation Finished
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button variant="primary" onClick={handleReset}>
                      START NEW SIMULATION
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* INTERACTIVE BRAWLER SELECTOR GRID */}
            {phase === "DRAFTING" && (
              <div className="glass-panel-premium border border-dark-border p-6 rounded-2xl space-y-6">
                
                {/* Search & Class filter inputs */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full">
                    <Input 
                      type="text" 
                      placeholder="Search Brawlers..." 
                      className="w-full bg-black/40 border-white/5 placeholder-gray-500 text-sm focus:border-brawl-purple/40"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Select Rarity Filter */}
                  <div className="w-full sm:w-48">
                    <select
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-300 font-bold focus:border-brawl-purple/40 outline-none cursor-pointer"
                      value={selectedRarity}
                      onChange={e => setSelectedRarity(e.target.value)}
                    >
                      <option value="ALL">All Rarities</option>
                      {rarities.filter(r => r !== "ALL").map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Badges for Class Roles */}
                <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
                  {classes.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-heading uppercase tracking-wider border transition-all cursor-pointer ${
                        selectedClass === cls
                          ? "bg-brawl-purple text-white border-brawl-purple shadow-[0_0_10px_rgba(155,89,182,0.4)]"
                          : "bg-black/20 text-gray-400 border-white/5 hover:border-white/10 hover:text-white"
                      }`}
                    >
                      {cls === "ALL" ? "All Classes" : cls}
                    </button>
                  ))}
                </div>

                {/* BRAWLER IMAGES GRID */}
                <div className="h-[360px] overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {filteredBrawlers.length > 0 ? (
                    filteredBrawlers.map((brawler) => {
                      const isUnavailable = unavailableBrawlersIds.has(brawler.id);
                      const isPreSelected = preSelectedBrawler?.id === brawler.id;
                      
                      return (
                        <button
                          key={brawler.id}
                          disabled={isUnavailable}
                          onClick={() => setPreSelectedBrawler(brawler)}
                          className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-200 group flex flex-col items-center justify-between p-1 bg-dark-bg cursor-pointer ${
                            isUnavailable 
                              ? "opacity-35 cursor-not-allowed border-black/40" 
                              : isPreSelected 
                                ? "border-brawl-yellow ring-2 ring-brawl-yellow shadow-[0_0_15px_rgba(247,211,58,0.4)] scale-105" 
                                : "border-white/5 hover:border-white/20 hover:scale-102"
                          }`}
                          style={{
                            borderBottomWidth: isPreSelected ? "2px" : "1px",
                            borderBottomColor: !isUnavailable && !isPreSelected ? brawler.rarity?.color : undefined
                          }}
                        >
                          <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/40">
                            {brawler.imageUrl && (
                              <img 
                                src={brawler.imageUrl} 
                                alt={brawler.name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                            
                            {/* Static banner stamp when already blocked */}
                            {isUnavailable && (
                              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                <span className="text-[9px] font-heading font-black text-gray-500 uppercase tracking-wider border border-gray-500 px-1 py-0.5 rounded">
                                  LOCKED
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="absolute bottom-1 bg-black/80 w-[90%] py-0.5 rounded text-[9px] font-black text-center text-white truncate px-1">
                            {brawler.name}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 text-sm">
                      No matching Brawlers found. Try adjusting filters.
                    </div>
                  )}
                </div>

                {/* PRE-SELECTED LOCK IN BOX */}
                {preSelectedBrawler && (
                  <div className="bg-black/50 p-4 rounded-xl border border-brawl-yellow/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-brawl-yellow/40 bg-black shrink-0 relative">
                        <img src={preSelectedBrawler.imageUrl} alt="" className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: preSelectedBrawler.rarity?.color }}>
                            {preSelectedBrawler.rarity?.name}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                            {preSelectedBrawler.class?.name}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white">{preSelectedBrawler.name}</h4>
                      </div>
                    </div>

                    <Button 
                      variant={currentTurn.phase === "BAN" ? "danger" : "primary"}
                      onClick={() => handleLockIn(preSelectedBrawler)}
                      className="w-full sm:w-auto uppercase font-heading font-black tracking-widest px-8"
                    >
                      {currentTurn.phase === "BAN" ? "🚫 LOCK BAN" : "⚔️ LOCK PICK"}
                    </Button>
                  </div>
                )}

              </div>
            )}

            {/* DRAFT LIVE FEED LOG */}
            <div className="glass-panel-premium border border-dark-border p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white tracking-widest uppercase">Arena Log</h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black font-heading">
                  Real-time events
                </span>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 h-[120px] overflow-y-auto space-y-2 text-xs font-semibold">
                {eventLog.map((log, index) => (
                  <div 
                    key={index} 
                    className={`pb-1.5 border-b border-white/5 last:border-0 ${
                      index === 0 ? "text-brawl-yellow font-bold text-[13px] animate-pulse" : "text-gray-400"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: RED TEAM (3 PICK / 2 BAN) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between border-b border-brawl-red/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brawl-red animate-pulse"></span>
                <h2 className="text-xl font-black text-brawl-red tracking-wider">Red Team</h2>
              </div>
              <Badge variant="primary" className="bg-brawl-red/20 text-brawl-red border border-brawl-red/30 uppercase tracking-widest font-heading text-[10px]">
                OPPONENTS
              </Badge>
            </div>

            {/* RED BAN SLOT */}
            <div className="space-y-3">
              <p className="text-xs uppercase text-gray-400 font-heading font-black tracking-widest">
                Team Bans (Max 2)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((idx) => {
                  const brawler = redBans[idx];
                  const isActive = currentTurn.phase === "BAN" && currentTurn.team === "RED" && redBans.length === idx;
                  return (
                    <div 
                      key={idx}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl bg-dark-surface border transition-all duration-300 overflow-hidden ${
                        isActive 
                          ? "border-brawl-red shadow-[0_0_15px_rgba(231,76,60,0.35)] animate-pulse" 
                          : "border-white/5"
                      }`}
                    >
                      {brawler ? (
                        <>
                          <img src={brawler.imageUrl} alt={brawler.name} className="w-full h-full object-cover brightness-50" />
                          <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
                            <span className="text-brawl-red font-heading font-black border-2 border-brawl-red px-2 py-0.5 transform -rotate-12 rounded text-xs uppercase tracking-widest">
                              Banned
                            </span>
                          </div>
                          <span className="absolute bottom-1 text-[10px] text-white font-bold bg-black/75 px-1.5 py-0.5 rounded">
                            {brawler.name}
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-600">
                          <CloseIcon size={24} />
                          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Empty</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RED PICK SLOTS */}
            <div className="space-y-4">
              <p className="text-xs uppercase text-gray-400 font-heading font-black tracking-widest">
                Combat Picks (3v3)
              </p>
              
              {[0, 1, 2].map((idx) => {
                const brawler = redPicks[idx];
                const isActive = currentTurn.phase === "PICK" && currentTurn.team === "RED" && redPicks.length === idx;
                return (
                  <div 
                    key={idx}
                    className={`relative flex items-center gap-4 p-3.5 rounded-xl bg-dark-surface border transition-all duration-300 overflow-hidden h-[90px] ${
                      isActive 
                        ? "border-brawl-red shadow-[0_0_20px_rgba(231,76,60,0.4)] ring-1 ring-brawl-red" 
                        : "border-white/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brawl-red animate-pulse"></div>
                    )}
                    
                    {brawler ? (
                      <>
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/50">
                          <img src={brawler.imageUrl} alt={brawler.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest font-heading" style={{ color: brawler.rarity?.color || "#ffffff" }}>
                            {brawler.rarity?.name || "Common"}
                          </span>
                          <h4 className="text-white text-base font-black truncate">{brawler.name}</h4>
                          <span className="inline-block bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-300 border border-white/5 mt-0.5 uppercase tracking-wider font-semibold">
                            {brawler.class?.name || "Brawler"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 font-bold block">SLOT 0{idx + 1}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full border border-dashed border-white/5 rounded-lg text-gray-600 text-xs gap-2">
                        {isActive ? (
                          <>
                            <span className="animate-ping w-2 h-2 rounded-full bg-brawl-red"></span>
                            <span className="text-brawl-red font-heading font-black uppercase tracking-wider">Picking now...</span>
                          </>
                        ) : (
                          <span className="uppercase tracking-widest font-bold text-[10px]">Awaiting Slot</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SYNERGY PANEL FOR RED */}
            <div className="bg-black/30 p-4 rounded-xl border border-brawl-red/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brawl-red uppercase tracking-wider">Team Synergy</span>
                <span className="text-sm font-black text-white">{aiAnalysis.redSynergy}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-brawl-red h-full transition-all duration-500"
                  style={{ width: `${aiAnalysis.redSynergy}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-brawl-red uppercase tracking-wider">Counter Rating</span>
                <span className="text-sm font-black text-white">{aiAnalysis.redCounter}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-brawl-red h-full transition-all duration-500"
                  style={{ width: `${aiAnalysis.redCounter}%` }}
                ></div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* AI STRATEGIC ASSISTANT TERMINAL (FULL WIDTH SIDEBAR / FOOTER ACCORDION) */}
      {phase === "DRAFTING" && selectedMap && (
        <div className="mt-8 glass-panel-premium border border-brawl-yellow/30 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-brawl-yellow text-black text-[10px] font-heading font-black px-4 py-1 uppercase tracking-widest rounded-br-lg shadow-[0_0_10px_rgba(247,211,58,0.2)]">
            AI Assistant Connected
          </div>

          <div className="flex items-center gap-3 mt-2 mb-4">
            <SparklesIcon className="text-brawl-yellow animate-pulse" size={24} />
            <h3 className="text-lg font-black text-white">
              Tactical Analysis & <span className="text-brawl-yellow">Counter Recommendations</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiRecommendations.map((brawler, idx) => (
              <div 
                key={brawler.id} 
                className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between hover:border-brawl-yellow/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/40">
                    <img src={brawler.imageUrl} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-gray-300">
                        Rank #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: brawler.rarity?.color }}>
                        {brawler.rarity?.name}
                      </span>
                    </div>
                    <h4 className="text-white text-base font-black leading-tight mt-0.5">{brawler.name}</h4>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 flex-grow italic">
                  {aiReasons[idx] || "Highly favorable balanced pick for current draft condition."}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Class: {brawler.class?.name}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPreSelectedBrawler(brawler)}
                    className="text-[10px] px-3.5 py-1.5 border-brawl-yellow/20 text-brawl-yellow hover:bg-brawl-yellow/10"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
