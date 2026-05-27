"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TrophyIcon, StarIcon, SwordIcon, SparklesIcon, ShieldIcon, SearchIcon, CloseIcon } from "@/components/ui/icons";
import type { Brawler } from "@/types/brawler";

interface TierListClientProps {
  brawlers: Brawler[];
}

type TierName = "S" | "A" | "B" | "C" | "D";

interface TierDefinition {
  name: TierName;
  color: string;
  bgColor: string;
  glowColor: string;
  borderColor: string;
}

const TIERS: TierDefinition[] = [
  { name: "S", color: "text-[#FF8C00]", bgColor: "bg-[#FF8C00]/25", glowColor: "shadow-[0_0_20px_rgba(255,140,0,0.4)]", borderColor: "border-[#FF8C00]" },
  { name: "A", color: "text-[#9B59B6]", bgColor: "bg-[#9B59B6]/25", glowColor: "shadow-[0_0_20px_rgba(155,89,182,0.4)]", borderColor: "border-[#9B59B6]" },
  { name: "B", color: "text-[#3498DB]", bgColor: "bg-[#3498DB]/25", glowColor: "shadow-[0_0_20px_rgba(52,152,219,0.4)]", borderColor: "border-[#3498DB]" },
  { name: "C", color: "text-[#2ECC71]", bgColor: "bg-[#2ECC71]/25", glowColor: "shadow-[0_0_20px_rgba(46,204,113,0.4)]", borderColor: "border-[#2ECC71]" },
  { name: "D", color: "text-[#95A5A6]", bgColor: "bg-[#95A5A6]/25", glowColor: "shadow-[0_0_20px_rgba(149,165,166,0.4)]", borderColor: "border-[#95A5A6]" },
];

export default function TierListClient({ brawlers }: TierListClientProps) {
  // Main state: mapping each tier to Brawlers, and a "pool" for unassigned
  const [tierData, setTierData] = useState<Record<TierName, Brawler[]>>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  });
  const [pool, setPool] = useState<Brawler[]>(brawlers);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  
  // Drag states
  const [draggedBrawlerId, setDraggedBrawlerId] = useState<number | null>(null);
  const [draggedSource, setDraggedSource] = useState<TierName | "pool" | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Notification system
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Trigger temporary notification
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Load layout from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("bf-tierlist-layout");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, number[]>;
        const newTierData: Record<TierName, Brawler[]> = { S: [], A: [], B: [], C: [], D: [] };
        const usedIds = new Set<number>();

        // Reconstruct from saved IDs
        (Object.keys(newTierData) as TierName[]).forEach((tier) => {
          const ids = parsed[tier] || [];
          ids.forEach((id) => {
            const found = brawlers.find((b) => b.id === id);
            if (found) {
              newTierData[tier].push(found);
              usedIds.add(id);
            }
          });
        });

        // Remaining go to pool
        const newPool = brawlers.filter((b) => !usedIds.has(b.id));

        setTierData(newTierData);
        setPool(newPool);
        showToast("Loaded saved layout from your browser storage", "info");
      } catch (err) {
        console.error("Failed to load saved tierlist", err);
      }
    }
  }, [brawlers]);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, id: number, source: TierName | "pool", index: number) => {
    setDraggedBrawlerId(id);
    setDraggedSource(source);
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle Drop on a specific row
  const handleDropOnRow = (e: React.DragEvent, targetTier: TierName, targetIdx?: number) => {
    e.preventDefault();
    if (draggedBrawlerId === null || draggedSource === null) return;

    // Find the brawler
    let brawlerToMove: Brawler | undefined;
    if (draggedSource === "pool") {
      brawlerToMove = pool.find((b) => b.id === draggedBrawlerId);
    } else {
      brawlerToMove = tierData[draggedSource].find((b) => b.id === draggedBrawlerId);
    }

    if (!brawlerToMove) return;

    // Remove from source
    let newPool = [...pool];
    let newTierData = {
      S: [...tierData.S],
      A: [...tierData.A],
      B: [...tierData.B],
      C: [...tierData.C],
      D: [...tierData.D],
    };

    if (draggedSource === "pool") {
      newPool = newPool.filter((b) => b.id !== draggedBrawlerId);
    } else {
      newTierData[draggedSource] = newTierData[draggedSource].filter((b) => b.id !== draggedBrawlerId);
    }

    // Insert into target row
    const targetRow = newTierData[targetTier];
    const insertIdx = targetIdx !== undefined ? targetIdx : targetRow.length;
    targetRow.splice(insertIdx, 0, brawlerToMove);

    setPool(newPool);
    setTierData(newTierData);

    // Reset drag states
    setDraggedBrawlerId(null);
    setDraggedSource(null);
    setDraggedIndex(null);
  };

  // Handle Drop on pool
  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedBrawlerId === null || draggedSource === null || draggedSource === "pool") return;

    const brawlerToMove = tierData[draggedSource].find((b) => b.id === draggedBrawlerId);
    if (!brawlerToMove) return;

    // Remove from source row
    const newTierData = {
      S: [...tierData.S],
      A: [...tierData.A],
      B: [...tierData.B],
      C: [...tierData.C],
      D: [...tierData.D],
    };
    newTierData[draggedSource] = newTierData[draggedSource].filter((b) => b.id !== draggedBrawlerId);

    // Return to pool
    const newPool = [...pool, brawlerToMove];

    setPool(newPool);
    setTierData(newTierData);

    setDraggedBrawlerId(null);
    setDraggedSource(null);
    setDraggedIndex(null);
  };

  // Reset list layout
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the tier list?")) {
      setTierData({ S: [], A: [], B: [], C: [], D: [] });
      setPool(brawlers);
      localStorage.removeItem("bf-tierlist-layout");
      showToast("Tier list has been reset", "info");
    }
  };

  // Save layout to LocalStorage and trigger a mock API post
  const handleSave = async () => {
    const layoutMap: Record<string, number[]> = {};
    (Object.keys(tierData) as TierName[]).forEach((tier) => {
      layoutMap[tier] = tierData[tier].map((b) => b.id);
    });

    // 1. Save to LocalStorage
    localStorage.setItem("bf-tierlist-layout", JSON.stringify(layoutMap));

    // 2. Call mock database save API
    try {
      const res = await fetch("/api/tier-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: layoutMap }),
      });
      if (res.ok) {
        showToast("Tier list successfully saved to database & synchronized!", "success");
      } else {
        // Even if API returns 404 (because route might not be in place), local persistence did succeed
        showToast("Tier list saved successfully in local cache!", "success");
      }
    } catch (err) {
      showToast("Saved locally (Offline mode active)", "success");
    }
  };

  // Unique rarities for filtering
  const rarities = useMemo(() => {
    const seen = new Set<string>();
    brawlers.forEach((b) => {
      if (b.rarity?.name) seen.add(b.rarity.name);
    });
    return Array.from(seen).sort();
  }, [brawlers]);

  // Filtered pool based on search and rarity selectors
  const filteredPool = useMemo(() => {
    return pool.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRarity = selectedRarity ? b.rarity?.name === selectedRarity : true;
      return matchSearch && matchRarity;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [pool, searchQuery, selectedRarity]);

  // Export Tier List as a High Quality PNG Image using Canvas API
  const handleExportImage = async () => {
    setIsExporting(true);
    showToast("Generating high-resolution tier list image...", "info");

    try {
      // 1. Preload all active Brawler images in the tiers
      const activeBrawlersWithTier: Array<{ tier: TierName; brawler: Brawler }> = [];
      (Object.keys(tierData) as TierName[]).forEach((tier) => {
        tierData[tier].forEach((brawler) => {
          activeBrawlersWithTier.push({ tier, brawler });
        });
      });

      // Simple preloader utility
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to load: " + url));
          img.src = url;
        });
      };

      // Load all images in parallel
      const imageMap = new Map<number, HTMLImageElement>();
      await Promise.all(
        activeBrawlersWithTier.map(async ({ brawler }) => {
          try {
            // Load higher resolution or primary imageUrl
            const img = await loadImage(brawler.imageUrl);
            imageMap.set(brawler.id, img);
          } catch (e) {
            console.error("Could not load image for: " + brawler.name, e);
          }
        })
      );

      // 2. Setup Canvas parameters
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not construct 2D context");

      const width = 1200;
      const rowHeaderWidth = 140;
      const brawlerIconSize = 80;
      const brawlerSpacing = 8;
      const rowPadding = 12;
      const minRowHeight = brawlerIconSize + rowPadding * 2; // 104px
      
      // Calculate row heights based on brawlers wrapped
      const rowBrawlersCount = (tier: TierName) => tierData[tier].length;
      const calculateRowHeight = (tier: TierName) => {
        const count = rowBrawlersCount(tier);
        const maxCols = Math.floor((width - rowHeaderWidth - 30) / (brawlerIconSize + brawlerSpacing));
        const rowsNeeded = Math.max(1, Math.ceil(count / Math.max(1, maxCols)));
        return rowsNeeded * brawlerIconSize + (rowsNeeded - 1) * brawlerSpacing + rowPadding * 2;
      };

      const rowHeights = {
        S: calculateRowHeight("S"),
        A: calculateRowHeight("A"),
        B: calculateRowHeight("B"),
        C: calculateRowHeight("C"),
        D: calculateRowHeight("D"),
      };

      const headerHeight = 100;
      const footerHeight = 60;
      const totalTiersHeight = Object.values(rowHeights).reduce((a, b) => a + b, 0);
      const totalHeight = headerHeight + totalTiersHeight + footerHeight + 10; // Extra padding

      canvas.width = width;
      canvas.height = totalHeight;

      // 3. Draw Background
      ctx.fillStyle = "#080512";
      ctx.fillRect(0, 0, width, totalHeight);

      // Draw beautiful diagonal stripes/grid in background
      ctx.strokeStyle = "rgba(155, 89, 182, 0.05)";
      ctx.lineWidth = 2;
      for (let i = -totalHeight; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + totalHeight, totalHeight);
        ctx.stroke();
      }

      // 4. Draw Header
      ctx.fillStyle = "rgba(16, 11, 36, 0.9)";
      ctx.fillRect(0, 0, width, headerHeight);
      ctx.strokeStyle = "rgba(247, 211, 58, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, headerHeight);

      // Header Text: BrawlField
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 900 36px 'Outfit', 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText("BRAWL", 40, 62);
      
      const brawlWidth = ctx.measureText("BRAWL").width;
      ctx.fillStyle = "#F7D33A"; // Brawl Yellow
      ctx.fillText("FIELD", 40 + brawlWidth + 8, 62);

      // Subtitle
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "600 14px 'Inter', system-ui, sans-serif";
      ctx.fillText("TACTICAL COMPETITIVE META TIER LIST", 40, 83);

      // Watermark right side
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.font = "900 18px 'Outfit', sans-serif";
      ctx.fillText("BRAWLFIELD.COM", width - 200, 58);

      // 5. Draw Tiers Rows
      let currentY = headerHeight;
      const tierHexColors = {
        S: "#FF8C00", // Dark Orange
        A: "#9B59B6", // Purple
        B: "#3498DB", // Blue
        C: "#2ECC71", // Green
        D: "#95A5A6", // Gray
      };

      TIERS.forEach((tierDef) => {
        const tierName = tierDef.name;
        const rowHeight = rowHeights[tierName];
        const tierHex = tierHexColors[tierName];

        // Draw Row BG
        ctx.fillStyle = "rgba(16, 11, 36, 0.6)";
        ctx.fillRect(0, currentY, width, rowHeight);
        
        // Row Border separator
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, currentY + rowHeight);
        ctx.lineTo(width, currentY + rowHeight);
        ctx.stroke();

        // Draw Row Header Box
        ctx.fillStyle = tierHex + "30"; // transparent colored BG
        ctx.fillRect(0, currentY, rowHeaderWidth, rowHeight);
        
        // Solid accent line next to header box
        ctx.fillStyle = tierHex;
        ctx.fillRect(rowHeaderWidth - 4, currentY, 4, rowHeight);

        // Draw Row Header Text ("S", "A" etc)
        ctx.fillStyle = tierHex;
        ctx.font = "bold 900 48px 'Outfit', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tierName, rowHeaderWidth / 2, currentY + rowHeight / 2);

        // Reset alignment
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        // Draw Brawler icons in this tier
        const list = tierData[tierName];
        const maxCols = Math.floor((width - rowHeaderWidth - 30) / (brawlerIconSize + brawlerSpacing));
        
        list.forEach((brawler, idx) => {
          const col = idx % maxCols;
          const rowIdx = Math.floor(idx / maxCols);

          const iconX = rowHeaderWidth + 20 + col * (brawlerIconSize + brawlerSpacing);
          const iconY = currentY + rowPadding + rowIdx * (brawlerIconSize + brawlerSpacing);

          // Draw rounded Brawler avatar background
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(iconX, iconY, brawlerIconSize, brawlerIconSize, 12);
          ctx.clip();
          
          ctx.fillStyle = "#1e163d";
          ctx.fillRect(iconX, iconY, brawlerIconSize, brawlerIconSize);

          const cachedImg = imageMap.get(brawler.id);
          if (cachedImg) {
            ctx.drawImage(cachedImg, iconX, iconY, brawlerIconSize, brawlerIconSize);
          } else {
            // Placeholder text if image loading failed
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(brawler.name.substring(0, 8), iconX + 8, iconY + brawlerIconSize / 2);
          }
          
          // Outer border on card portrait matching rarity color
          ctx.restore();
          ctx.strokeStyle = brawler.rarity?.color || "rgba(255,255,255,0.1)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(iconX, iconY, brawlerIconSize, brawlerIconSize, 12);
          ctx.stroke();
        });

        currentY += rowHeight;
      });

      // 6. Draw Footer
      ctx.fillStyle = "rgba(8, 5, 18, 0.95)";
      ctx.fillRect(0, currentY, width, footerHeight);
      
      // Footer decorative top border
      ctx.strokeStyle = "rgba(155, 89, 182, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(width, currentY);
      ctx.stroke();

      ctx.fillStyle = "#6B7280";
      ctx.font = "500 12px 'Inter', sans-serif";
      ctx.fillText("BrawlField strategy suite. All characters are trademarks of Supercell.", 40, currentY + 35);
      
      // Right side credit
      ctx.textAlign = "right";
      ctx.fillStyle = "#F7D33A";
      ctx.font = "bold 12px 'Outfit', sans-serif";
      ctx.fillText("CREATED BY BRAWL STARS ESPORTS COMBAT PLANNER", width - 40, currentY + 35);

      // 7. Download Trigger
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `brawlfield-tier-list-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Tier list exported and downloaded successfully! Share it on Discord!", "success");
    } catch (err) {
      console.error(err);
      showToast("Export failed: Please ensure network connection and retry.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-1 w-full min-h-screen bg-dark-bg text-gray-100">
      <PageContainer className="py-12 space-y-8">
        
        {/* Global Toast Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 animate-bounce shadow-2xl transition-all ${
            notification.type === "success" 
              ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
              : notification.type === "error"
              ? "bg-red-950/80 border-red-500 text-red-300"
              : "bg-brawl-blue/20 border-brawl-blue text-blue-200"
          }`}>
            <span className="h-2 w-2 rounded-full animate-ping bg-current" />
            <span className="font-heading font-bold text-sm tracking-wide">{notification.message}</span>
          </div>
        )}

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-wide">
              Tier List <span className="text-brawl-yellow">Maker</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Craft your competitive meta rankings. Drag and drop Brawlers to organize your esports draft selections.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button 
              variant="ghost" 
              size="md" 
              onClick={handleReset}
              className="text-brawl-red border border-brawl-red/10 hover:bg-brawl-red/10"
            >
              Reset List
            </Button>
            <Button 
              variant="secondary" 
              size="md" 
              onClick={handleSave}
            >
              Save List
            </Button>
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleExportImage}
              disabled={isExporting}
              className="glow-btn-yellow"
            >
              {isExporting ? "Exporting..." : "Export to Image"}
            </Button>
          </div>
        </div>

        {/* Interactive Board */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Main Tier List Grid Panel */}
          <Card variant="premium" className="border border-white/5 bg-dark-card overflow-hidden">
            <div className="flex flex-col divide-y divide-white/5">
              {TIERS.map((tierDef) => {
                const list = tierData[tierDef.name];
                return (
                  <div 
                    key={tierDef.name}
                    className="flex min-h-[110px] items-stretch group/row"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnRow(e, tierDef.name)}
                  >
                    {/* Tier Title Header Box */}
                    <div className={`w-28 sm:w-36 shrink-0 flex items-center justify-center relative select-none border-r border-white/5 uppercase font-heading font-black text-3xl sm:text-5xl transition-all duration-300 ${tierDef.bgColor} ${tierDef.color} ${tierDef.glowColor}`}>
                      {/* Left glowing neon border */}
                      <div className={`absolute left-0 inset-y-0 w-1.5 border-l-4 ${tierDef.borderColor}`} />
                      <span className="relative z-10">{tierDef.name}</span>
                    </div>

                    {/* Drag-drop target container for current Tier */}
                    <div className="flex-1 p-3 flex flex-wrap gap-2.5 items-center bg-black/10 hover:bg-black/20 transition-colors">
                      {list.length === 0 ? (
                        <span className="text-xs text-gray-600 font-semibold italic tracking-wide select-none pointer-events-none ml-2">
                          Drop Brawlers here to rank in Tier {tierDef.name}
                        </span>
                      ) : (
                        list.map((brawler, idx) => (
                          <div
                            key={brawler.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, brawler.id, tierDef.name, idx)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleDropOnRow(e, tierDef.name, idx);
                            }}
                            className="relative h-[72px] w-[72px] bg-dark-surface border rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 hover:border-brawl-yellow/50 transition-all duration-200 select-none group shadow-lg shrink-0"
                            style={{ borderColor: brawler.rarity?.color || "rgba(255,255,255,0.1)" }}
                          >
                            {/* Brawler Portrait */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={brawler.imageUrl} 
                              alt={brawler.name}
                              className="h-full w-full object-contain pointer-events-none"
                            />
                            
                            {/* Mini label hover */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/85 text-[8px] font-heading font-black text-center text-white py-0.5 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                              {brawler.name}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Unassigned Brawler Pool & Filters */}
          <Card variant="default" className="border border-white/5 bg-dark-card p-6 space-y-6">
            
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-heading font-black text-white flex items-center gap-2">
                <span className="text-brawl-yellow"><SwordIcon size={18} /></span>
                Brawlers Pool
                <Badge variant="outline" className="ml-2 bg-white/5 text-gray-300 font-semibold border-white/10">
                  {filteredPool.length} Brawlers Available
                </Badge>
              </h2>

              {/* Filtering pool UI */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-60">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                    <SearchIcon size={16} />
                  </span>
                  <Input 
                    type="text" 
                    placeholder="Search Brawlers..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 text-xs py-1.5 w-full bg-black/40 border-white/5"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-white"
                    >
                      <CloseIcon size={14} />
                    </button>
                  )}
                </div>

                {/* Rarity select buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                  <button
                    onClick={() => setSelectedRarity(null)}
                    className={`cursor-pointer text-[10px] font-heading font-black uppercase px-2.5 py-1 rounded transition-all ${
                      selectedRarity === null
                        ? "bg-brawl-yellow text-black"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  {rarities.map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => setSelectedRarity(selectedRarity === rarity ? null : rarity)}
                      className={`cursor-pointer text-[10px] font-heading font-black uppercase px-2.5 py-1 rounded transition-all ${
                        selectedRarity === rarity
                          ? "bg-brawl-purple text-white"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Brawlers Pool Droppable Target */}
            <div 
              className="min-h-[160px] p-4 bg-black/25 rounded-2xl border border-white/5 border-dashed flex flex-wrap gap-3 items-center justify-center hover:bg-black/35 hover:border-brawl-purple/40 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDropOnPool}
            >
              {filteredPool.length === 0 ? (
                <div className="text-center py-8">
                  <SparklesIcon className="text-gray-600 mx-auto mb-2 animate-spin" size={24} />
                  <p className="text-xs text-gray-500 font-semibold italic">No brawlers matching filters remain in pool</p>
                </div>
              ) : (
                filteredPool.map((brawler) => (
                  <div
                    key={brawler.id}
                    draggable
                    onDragStart={(e) => {
                      // Find its index in pool to drag
                      const idx = pool.findIndex((item) => item.id === brawler.id);
                      handleDragStart(e, brawler.id, "pool", idx);
                    }}
                    className="relative h-[68px] w-[68px] bg-dark-surface border rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:scale-110 hover:-translate-y-1 active:scale-95 hover:border-brawl-yellow/50 transition-all duration-200 select-none group shadow-lg"
                    style={{ borderColor: brawler.rarity?.color || "rgba(255,255,255,0.1)" }}
                  >
                    {/* Brawler Portrait */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={brawler.imageUrl} 
                      alt={brawler.name}
                      className="h-full w-full object-contain pointer-events-none"
                    />

                    {/* Rarity thin status bottom bar */}
                    <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: brawler.rarity?.color }} />
                    
                    {/* Label tooltip on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/85 text-[8px] font-heading font-black text-center text-white py-0.5 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      {brawler.name}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Instruction Footer */}
            <div className="flex items-center gap-3 text-xs text-gray-500 bg-white/5 border border-white/5 rounded-xl p-3.5">
              <SparklesIcon size={16} className="text-brawl-yellow animate-pulse" />
              <span>
                <strong>Quick Tip:</strong> You can drag items directly from the bottom pool up into any tier S, A, B, C, D row. To remove a ranked Brawler, simply drag them back to the bottom <strong>Brawlers Pool</strong>. Save often!
              </span>
            </div>

          </Card>
        </div>
      </PageContainer>
    </div>
  );
}
