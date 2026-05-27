"use client";

import React, { useState, useEffect, useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { SwordIcon, ShieldIcon, SparklesIcon, TrashIcon } from "@/components/ui/icons";

interface BrawlerOption {
  id: number;
  name: string;
  imageUrl: string;
  class: string;
}

interface MapOption {
  id: number;
  name: string;
  imageUrl: string;
  gameMode: string;
}

interface Line {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface Placement {
  id: string; // instance id
  brawlerId: number;
  name: string;
  imageUrl: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  role: string;
}

export default function TeamBuilderPage() {
  const { user, loginWithGoogle } = useAuth();
  const [brawlers, setBrawlers] = useState<BrawlerOption[]>([]);
  const [maps, setMaps] = useState<MapOption[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapOption | null>(null);
  
  // Strategy Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [canvasLines, setCanvasLines] = useState<Line[]>([]);
  const [draggedPlacement, setDraggedPlacement] = useState<string | null>(null);
  
  // Drawing Tools State
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [currentColor, setCurrentColor] = useState("#F7D33A"); // Brawl Yellow
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [searchBrawler, setSearchBrawler] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ id: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch Brawlers and Maps on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch brawlers from our own node endpoint or direct brawlapi
        const bRes = await fetch("https://api.brawlapi.com/v1/brawlers");
        const bData = await bRes.json();
        if (bData?.list) {
          setBrawlers(
            bData.list.map((b: any) => ({
              id: b.id,
              name: b.name,
              imageUrl: b.imageUrl,
              class: b.class.name,
            }))
          );
        }

        const mRes = await fetch("https://api.brawlapi.com/v1/maps");
        const mData = await mRes.json();
        if (mData?.list) {
          const filteredMaps = mData.list
            .filter((m: any) => !m.disabled)
            .map((m: any) => ({
              id: m.id,
              name: m.name,
              imageUrl: m.imageUrl,
              gameMode: m.gameMode.name,
            }));
          setMaps(filteredMaps);
          if (filteredMaps.length > 0) {
            setSelectedMap(filteredMaps[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load brawlers or maps, using fallback", err);
        // Fallback seed data if APIs fail
        setBrawlers([
          { id: 16000000, name: "Shelly", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000000.png", class: "Damage Dealer" },
          { id: 16000004, name: "El Primo", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000004.png", class: "Tank" },
          { id: 16000008, name: "Brock", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000008.png", class: "Marksman" },
          { id: 16000010, name: "Leon", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000010.png", class: "Assassin" },
          { id: 16000012, name: "Barley", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000012.png", class: "Artillery" },
          { id: 16000014, name: "Spike", imageUrl: "https://cdn.brawlapi.com/brawlers/borders/16000014.png", class: "Damage Dealer" },
        ]);
        const fallbackMap = { id: 15000014, name: "Sneaky Fields", imageUrl: "https://cdn.brawlapi.com/maps/ld/15000014.png", gameMode: "Brawl Ball" };
        setMaps([fallbackMap]);
        setSelectedMap(fallbackMap);
      }
    }

    loadData();
  }, []);

  // Load cloned plan if any exists in localStorage
  useEffect(() => {
    if (maps.length === 0 || brawlers.length === 0) return;
    
    const cloned = localStorage.getItem("bf_cloned_plan");
    if (cloned) {
      try {
        const parsed = JSON.parse(cloned);
        setTitle("Copy of " + parsed.title);
        setDescription(parsed.description || "");
        setCanvasLines(parsed.canvas_data?.lines || []);
        setPlacements(parsed.brawlers_data?.placements || []);
        
        // Find matching map
        if (parsed.map_id) {
          const matchingMap = maps.find((m) => m.id === parsed.map_id);
          if (matchingMap) {
            setSelectedMap(matchingMap);
          }
        }
        
        // Clear so it doesn't reload on subsequent mount
        localStorage.removeItem("bf_cloned_plan");
        alert("Cloned copy of battle plan loaded successfully! Make edits and save to publish under your dashboard.");
      } catch (err) {
        console.error("Failed to load cloned strategy:", err);
      }
    }
  }, [maps, brawlers]);

  // Redraw canvas lines when canvasLines state updates
  useEffect(() => {
    drawCanvas();
  }, [canvasLines, selectedMap]);

  // Adjust canvas size to match visual bounding container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawCanvas();
  };

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    // Timeout to ensure background image loads first
    const timer = setTimeout(resizeCanvas, 500);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      clearTimeout(timer);
    };
  }, [selectedMap]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed lines
    canvasLines.forEach((line) => {
      if (line.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Convert percentages back to actual pixel values
      const startPoint = line.points[0];
      ctx.moveTo((startPoint.x / 100) * canvas.width, (startPoint.y / 100) * canvas.height);

      for (let i = 1; i < line.points.length; i++) {
        const pt = line.points[i];
        ctx.lineTo((pt.x / 100) * canvas.width, (pt.y / 100) * canvas.height);
      }
      ctx.stroke();
    });
  };

  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Express as percentage of canvas width/height
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;
    
    return { x, y };
  };

  // Handlers for HTML5 Canvas Drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    setIsDrawing(true);
    const pos = getCanvasMousePos(e);
    const newLine: Line = {
      points: [pos],
      color: currentColor,
      width: lineWidth,
    };
    setCanvasLines((prev) => [...prev, newLine]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || canvasLines.length === 0) return;
    const pos = getCanvasMousePos(e);
    setCanvasLines((prev) => {
      const copy = [...prev];
      const activeLine = { ...copy[copy.length - 1] };
      activeLine.points = [...activeLine.points, pos];
      copy[copy.length - 1] = activeLine;
      return copy;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    setCanvasLines([]);
  };

  // Draggable Brawlers placement handlers
  const addBrawlerPlacement = (brawler: BrawlerOption) => {
    const newPlacement: Placement = {
      id: "place-" + Math.random().toString(36).substring(2, 9),
      brawlerId: brawler.id,
      name: brawler.name,
      imageUrl: brawler.imageUrl,
      x: 50, // default center
      y: 50, // default center
      role: "Lane Cover",
    };
    setPlacements((prev) => [...prev, newPlacement]);
  };

  const deletePlacement = (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlacementRole = (id: string, role: string) => {
    setPlacements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, role } : p))
    );
  };

  // Drag-and-drop within the board
  const handleBoardDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBoardDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedPlacement || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain percentage between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setPlacements((prev) =>
      prev.map((p) => (p.id === draggedPlacement ? { ...p, x: clampedX, y: clampedY } : p))
    );
    setDraggedPlacement(null);
  };

  // Save Strategy to backend API
  const handleSaveStrategy = async () => {
    if (!selectedMap) return;
    if (!title.trim()) {
      alert("Please enter a title for your strategy plan.");
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null, // Allow anonymous or logged-in saves
          map_id: selectedMap.id,
          map_name: selectedMap.name,
          map_image_url: selectedMap.imageUrl,
          title,
          description,
          canvas_data: { lines: canvasLines },
          brawlers_data: { placements },
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      setSaveResult(data);
    } catch (err) {
      console.error("Failed to save plan:", err);
      alert("Could not save your strategy board. Saved in LocalStorage mock instead.");
      
      // Fallback: save to localStorage direct simulation
      const fallbackId = "strat-local-" + Math.random().toString(36).substring(2, 11);
      const mockSavedPlan = {
        id: fallbackId,
        user_id: user?.id || "mock-user-guest",
        map_id: selectedMap.id,
        map_name: selectedMap.name,
        map_image_url: selectedMap.imageUrl,
        title,
        description,
        canvas_data: { lines: canvasLines },
        brawlers_data: { placements },
        created_at: new Date().toISOString(),
      };
      
      const localStrats = JSON.parse(localStorage.getItem("bf_mock_strategies") || "[]");
      localStrats.push(mockSavedPlan);
      localStorage.setItem("bf_mock_strategies", JSON.stringify(localStrats));
      
      setSaveResult({ id: fallbackId });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBrawlers = brawlers.filter((b) =>
    b.name.toLowerCase().includes(searchBrawler.toLowerCase())
  );

  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-heading font-black text-white">
              Tactical <span className="text-brawl-yellow">Strategy Board</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Select a battle map, position brawlers, sketch paths, and share your battle tactics!
            </p>
          </div>
          
          {!user && (
            <div className="bg-brawl-purple/10 border border-brawl-purple/30 rounded-xl p-3 text-xs text-brawl-purple flex items-center gap-3">
              <span>You are drawing as a **Guest**. Sign in to save to your personal profile!</span>
              <Button size="sm" variant="primary" isSkewed={true} onClick={loginWithGoogle}>
                Sign In
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL: Brawler Selection */}
          <div className="xl:col-span-3 space-y-6">
            <Card variant="premium">
              <CardHeader className="p-4 border-b border-white/5">
                <h3 className="font-heading font-extrabold text-white text-base flex items-center gap-2">
                  <SwordIcon size={16} className="text-brawl-yellow" />
                  Select Brawlers
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <Input
                  placeholder="Search Brawlers..."
                  value={searchBrawler}
                  onChange={(e) => setSearchBrawler(e.target.value)}
                  className="bg-black/30 border-white/10"
                />
                
                <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[350px] pr-1">
                  {filteredBrawlers.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => addBrawlerPlacement(b)}
                      className="flex flex-col items-center p-2 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 hover:border-brawl-yellow/30 transition-all group"
                      title={`Click to add ${b.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.imageUrl}
                        alt={b.name}
                        className="h-10 w-10 object-contain rounded-md transition-transform group-hover:scale-110"
                      />
                      <span className="text-[10px] text-gray-300 font-bold text-center mt-1.5 truncate max-w-full uppercase">
                        {b.name}
                      </span>
                    </button>
                  ))}
                  {filteredBrawlers.length === 0 && (
                    <div className="col-span-3 py-6 text-center text-xs text-gray-500">
                      No Brawlers found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 border-b border-white/5">
                <h3 className="font-heading font-extrabold text-white text-base flex items-center gap-2">
                  <ShieldIcon size={16} className="text-brawl-blue" />
                  Select Battle Map
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <select
                  value={selectedMap?.id || ""}
                  onChange={(e) => {
                    const match = maps.find((m) => m.id === Number(e.target.value));
                    if (match) setSelectedMap(match);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-brawl-yellow"
                >
                  {maps.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.gameMode}] {m.name}
                    </option>
                  ))}
                </select>
                
                {selectedMap && (
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black/50 p-2 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMap.imageUrl}
                      alt={selectedMap.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CENTER PANEL: Interactive Canvas Board */}
          <div className="xl:col-span-6 space-y-6">
            <div className="flex flex-wrap gap-3 items-center justify-between bg-black/30 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Draw Board:</span>
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setIsDrawingMode(true)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${
                      isDrawingMode
                        ? "bg-brawl-yellow text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Draw Paths
                  </button>
                  <button
                    onClick={() => setIsDrawingMode(false)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${
                      !isDrawingMode
                        ? "bg-brawl-yellow text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Move Icons
                  </button>
                </div>
              </div>

              {isDrawingMode && (
                <div className="flex items-center gap-2">
                  {/* Drawing Colors */}
                  {["#F7D33A", "#3498DB", "#E74C3C", "#2ECC71", "#FFFFFF"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={`h-6 w-6 rounded-full border transition-all ${
                        currentColor === color
                          ? "scale-125 border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  
                  <div className="border-l border-white/10 h-6 mx-1" />
                  
                  <button
                    onClick={clearDrawing}
                    className="text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-400 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                  >
                    Clear Sketch
                  </button>
                </div>
              )}
            </div>

            {/* Tactical Map Playground */}
            <div 
              ref={containerRef}
              onDragOver={handleBoardDragOver}
              onDrop={handleBoardDrop}
              className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl overflow-y-visible"
              style={{
                backgroundImage: selectedMap ? `url(${selectedMap.imageUrl})` : "none",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Canvas Overlay for sketches */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`absolute inset-0 z-10 w-full h-full ${
                  isDrawingMode ? "cursor-crosshair" : "pointer-events-none"
                }`}
              />

              {/* Placed draggable Brawlers icons */}
              {placements.map((p) => (
                <div
                  key={p.id}
                  draggable={!isDrawingMode}
                  onDragStart={() => setDraggedPlacement(p.id)}
                  className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 select-none"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    cursor: isDrawingMode ? "default" : "grab",
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Role badge */}
                    <span className="bg-black/80 border border-brawl-yellow/50 text-glow-yellow text-[8px] font-heading font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90 mb-1 leading-none shadow-lg">
                      {p.role}
                    </span>

                    {/* Brawler avatar border */}
                    <div className="h-12 w-12 rounded-full border-2 border-brawl-yellow bg-dark-bg p-0.5 shadow-xl transition-transform group-hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain pointer-events-none" />
                    </div>

                    <span className="text-[9px] text-white font-black uppercase mt-1 bg-black/50 px-1 py-0.5 rounded leading-none text-center">
                      {p.name}
                    </span>

                    {/* Quick delete button */}
                    {!isDrawingMode && (
                      <button
                        onClick={() => deletePlacement(p.id)}
                        className="absolute -top-3 -right-3 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 border border-white/20 text-white text-[9px] hover:bg-rose-500 cursor-pointer shadow-lg"
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {placements.length === 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/75 border border-white/5 px-6 py-2.5 rounded-2xl text-xs text-gray-300 pointer-events-none text-center">
                  Select Brawlers on the left to add tokens here, then toggle **Move Icons** to place them.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Details & Save Plan */}
          <div className="xl:col-span-3 space-y-6">
            <Card variant="premium" className="border-brawl-yellow/10">
              <CardHeader className="p-4 border-b border-white/5">
                <h3 className="font-heading font-extrabold text-white text-base flex items-center gap-2">
                  <SparklesIcon size={16} className="text-brawl-yellow animate-pulse" />
                  Strategy Blueprint
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Plan Title *
                  </label>
                  <Input
                    placeholder="e.g. Left Flank Ambush Scheme"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/30 border-white/10"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Strategy Description
                  </label>
                  <textarea
                    placeholder="Detail instructions for your team players here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-brawl-yellow"
                    maxLength={500}
                  />
                </div>

                {placements.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Assign Player Roles
                    </label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {placements.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.imageUrl} alt={p.name} className="h-6 w-6 object-contain rounded-md" />
                            <span className="text-xs font-bold text-white truncate max-w-[80px]">{p.name}</span>
                          </div>
                          
                          <select
                            value={p.role}
                            onChange={(e) => updatePlacementRole(p.id, e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-brawl-yellow tracking-wide uppercase focus:outline-none"
                          >
                            <option value="Lane Cover">Lane Cover</option>
                            <option value="Aggressor">Aggressor</option>
                            <option value="Gem Carrier">Gem Carrier</option>
                            <option value="Mid Defense">Mid Defense</option>
                            <option value="Bush Camper">Bush Camper</option>
                            <option value="Team Captain">Captain</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full mt-4 glow-btn-yellow text-glow-yellow"
                  size="lg"
                  isSkewed={true}
                  onClick={handleSaveStrategy}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving Strategy..." : "Save Battle Plan"}
                </Button>
              </CardContent>
            </Card>

            {saveResult && (
              <Card className="border-emerald-500/20 bg-emerald-500/5 animate-in fade-in zoom-in-95 duration-200">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-sm font-heading font-extrabold uppercase tracking-wide">Strategy Saved Successfully!</span>
                  </div>
                  
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your tactical map plan is online. Share this link with teammates to coordinate in real-time.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/plan/${saveResult.id}`}
                      className="bg-black/40 border border-emerald-500/20 rounded-xl px-2.5 py-1.5 text-xs text-emerald-200 select-all font-mono min-w-0 flex-1"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/plan/${saveResult.id}`);
                        alert("Sharable link copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>

                  <a
                    href={`/plan/${saveResult.id}`}
                    target="_blank"
                    className="block text-center text-xs font-bold text-glow-yellow text-brawl-yellow hover:underline mt-1"
                  >
                    Open Shared View ↗
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
