"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  SwordIcon, 
  ShieldIcon, 
  TrophyIcon, 
  StarIcon, 
  SparklesIcon, 
  ClockIcon,
  SearchIcon,
  CloseIcon
} from "@/components/ui/icons";
import type { BrawlMap } from "@/types/map";
import type { Brawler } from "@/types/brawler";

interface PlannerClientProps {
  map: BrawlMap;
  brawlers: Brawler[];
}

interface DrawAction {
  type: "freehand" | "arrow";
  color: string;
  thickness: number;
  points: Array<{ x: number; y: number }>; // Saved as percentages (0 - 100) relative to board
}

interface BrawlerSkillIndicator {
  id: string;
  type: "attack" | "super" | "gadget" | "starpower";
  name: string;
  shape: "circle" | "cone" | "line";
  color: string;
  range: number; // percentage (5 - 60) relative to board size
  angle: number; // degrees (0 - 360)
  width: number; // degrees for cone, percentage for line width
}

interface BrawlerMarker {
  id: string; // unique instance ID
  brawler: Brawler;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  skills?: BrawlerSkillIndicator[];
}

const COLORS = [
  { value: "#F7D33A", label: "Yellow" }, // Yellow
  { value: "#9B59B6", label: "Purple" }, // Purple
  { value: "#E74C3C", label: "Red" },    // Red
  { value: "#3498DB", label: "Blue" },   // Blue
];

export default function PlannerClient({ map, brawlers }: PlannerClientProps) {
  // Canvas drawing options
  const [tool, setTool] = useState<"freehand" | "arrow">("freehand");
  const [color, setColor] = useState("#F7D33A");
  const [thickness, setThickness] = useState(4);

  // Drawing and Undo/Redo stacks
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  
  // Placed brawlers markers state
  const [markers, setMarkers] = useState<BrawlerMarker[]>([]);
  const [activeDragMarkerId, setActiveDragMarkerId] = useState<string | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [activeDragHandle, setActiveDragHandle] = useState<{ markerId: string; skillId: string } | null>(null);

  // Sidebar brawler filter state
  const [brawlerSearch, setBrawlerSearch] = useState("");
  const [brawlerRarity, setBrawlerRarity] = useState<string | null>(null);

  // Export JSON Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedJsonStr, setExportedJsonStr] = useState("");

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Refs for drawing container and canvas elements
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentAction = useRef<DrawAction | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Find currently active selected marker
  const selectedMarker = useMemo(() => {
    return markers.find((m) => m.id === selectedMarkerId) || null;
  }, [markers, selectedMarkerId]);

  // Load strategy from LocalStorage on mount if exists
  useEffect(() => {
    const saved = localStorage.getItem(`bf-strategy-${map.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.actions) setActions(parsed.actions);
        
        // Hydrate placed markers from IDs
        if (parsed.markers) {
          const hydratedMarkers = parsed.markers.map((m: any) => {
            const found = brawlers.find((b) => b.id === m.brawlerId);
            if (found) {
              return {
                id: m.id || `marker-${Date.now()}-${Math.random()}`,
                brawler: found,
                x: m.x,
                y: m.y,
                skills: m.skills || []
              };
            }
            return null;
          }).filter(Boolean) as BrawlerMarker[];
          setMarkers(hydratedMarkers);
        }
        showToast("Loaded saved strategy for this arena", "info");
      } catch (err) {
        console.error("Failed to load saved map plan", err);
      }
    }
  }, [map.id, brawlers]);

  // Adjust canvas pixel density on resize and redraw
  const adjustCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    
    // Set attributes width & height to match layout size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Trigger immediate canvas redrawing of loaded paths
    const ctx = canvas.getContext("2d");
    if (ctx) {
      redrawCanvas(canvas, ctx, actions, null, markers);
    }
  };

  useEffect(() => {
    // Call on mount
    adjustCanvasSize();
    
    // Add window resize listener
    window.addEventListener("resize", adjustCanvasSize);
    return () => {
      window.removeEventListener("resize", adjustCanvasSize);
    };
  }, [actions, markers]);

  // Main Canvas redraw routine
  const redrawCanvas = (
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    actionsList: DrawAction[],
    inProgressAction?: DrawAction | null,
    markersList?: BrawlerMarker[]
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Brawler Skill Range Indicators (background layer behind pencil strokes)
    if (markersList) {
      markersList.forEach((marker) => {
        if (!marker.skills) return;

        marker.skills.forEach((ind) => {
          const cx = (marker.x / 100) * canvas.width;
          const cy = (marker.y / 100) * canvas.height;
          const r = (ind.range / 100) * Math.min(canvas.width, canvas.height);
          
          ctx.strokeStyle = ind.color;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]); // cool premium tactical dash
          ctx.fillStyle = `${ind.color}20`; // ~12% opacity neon glow fill

          if (ind.shape === "circle") {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
          } else if (ind.shape === "cone") {
            // angle is centered, we span width/2 on both sides
            const startAngle = ((ind.angle - ind.width / 2) * Math.PI) / 180;
            const endAngle = ((ind.angle + ind.width / 2) * Math.PI) / 180;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
          } else if (ind.shape === "line") {
            const rectWidth = (ind.width / 100) * Math.min(canvas.width, canvas.height);

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((ind.angle * Math.PI) / 180);
            ctx.beginPath();
            // Rectangle starts at brawler (0,0) and extends forward by range (r)
            ctx.rect(0, -rectWidth / 2, r, rectWidth);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.setLineDash([]);
          }
        });
      });
    }

    // 2. Draw past drawing actions
    const drawSingleAction = (act: DrawAction) => {
      if (!act || !act.points || act.points.length < 1) return;

      ctx.strokeStyle = act.color;
      ctx.lineWidth = act.thickness;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (act.type === "freehand") {
        ctx.beginPath();
        const startX = (act.points[0].x / 100) * canvas.width;
        const startY = (act.points[0].y / 100) * canvas.height;
        ctx.moveTo(startX, startY);

        for (let i = 1; i < act.points.length; i++) {
          const x = (act.points[i].x / 100) * canvas.width;
          const y = (act.points[i].y / 100) * canvas.height;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (act.type === "arrow" && act.points.length >= 2) {
        const x1 = (act.points[0].x / 100) * canvas.width;
        const y1 = (act.points[0].y / 100) * canvas.height;
        const x2 = (act.points[1].x / 100) * canvas.width;
        const y2 = (act.points[1].y / 100) * canvas.height;

        // Draw line shaft
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = Math.max(12, act.thickness * 2.5);

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = act.color;
        ctx.fill();
      }
    };

    actionsList.forEach(drawSingleAction);

    // Draw active dynamic in-progress action preview
    if (inProgressAction) {
      drawSingleAction(inProgressAction);
    }
  };

  // Drawing event handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    isDrawing.current = true;
    
    // Clear redo stack upon new drawing operation
    setRedoStack([]);

    currentAction.current = {
      type: tool,
      color: color,
      thickness: thickness,
      points: [{ x: xPct, y: yPct }]
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentAction.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "freehand") {
      currentAction.current.points.push({ x: xPct, y: yPct });
    } else if (tool === "arrow") {
      // For arrow, replace the second point to form a straight line
      if (currentAction.current.points.length === 1) {
        currentAction.current.points.push({ x: xPct, y: yPct });
      } else {
        currentAction.current.points[1] = { x: xPct, y: yPct };
      }
    }

    // Redraw canvas with full history + active drawing preview
    redrawCanvas(canvas, ctx, actions, currentAction.current, markers);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentAction.current && currentAction.current.points.length > 0) {
      // Save drawn action to history
      setActions((prev) => [...prev, currentAction.current as DrawAction]);
    }
    currentAction.current = null;
  };

  // Touch drawing event handlers for iPad/mobile support
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xPct = ((touch.clientX - rect.left) / rect.width) * 100;
    const yPct = ((touch.clientY - rect.top) / rect.height) * 100;

    isDrawing.current = true;
    setRedoStack([]);

    currentAction.current = {
      type: tool,
      color: color,
      thickness: thickness,
      points: [{ x: xPct, y: yPct }]
    };
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentAction.current || !canvasRef.current || e.touches.length !== 1) return;
    
    if (e.cancelable) e.preventDefault();

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const xPct = ((touch.clientX - rect.left) / rect.width) * 100;
    const yPct = ((touch.clientY - rect.top) / rect.height) * 100;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "freehand") {
      currentAction.current.points.push({ x: xPct, y: yPct });
    } else if (tool === "arrow") {
      if (currentAction.current.points.length === 1) {
        currentAction.current.points.push({ x: xPct, y: yPct });
      } else {
        currentAction.current.points[1] = { x: xPct, y: yPct };
      }
    }

    redrawCanvas(canvas, ctx, actions, currentAction.current, markers);
  };

  const handleCanvasTouchEnd = () => {
    handleCanvasMouseUp();
  };

  // Canvas Actions
  const handleUndo = () => {
    if (actions.length === 0) return;
    const last = actions[actions.length - 1];
    setActions((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setActions((prev) => [...prev, next]);
  };

  const handleClearDrawing = () => {
    if (window.confirm("Clear all drawing lines on the canvas?")) {
      setActions([]);
      setRedoStack([]);
    }
  };

  const handleResetBoard = () => {
    if (window.confirm("Reset strategy board? All lines and brawler markers will be wiped.")) {
      setActions([]);
      setRedoStack([]);
      setMarkers([]);
      setSelectedMarkerId(null);
      localStorage.removeItem(`bf-strategy-${map.id}`);
      showToast("Strategy board reset", "info");
    }
  };

  // Dragging Brawler Markers within board logic
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!activeDragMarkerId || !boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setMarkers((prev) =>
        prev.map((m) => (m.id === activeDragMarkerId ? { ...m, x: xPct, y: yPct } : m))
      );
    };

    const handleGlobalMouseUp = () => {
      if (activeDragMarkerId) {
        setActiveDragMarkerId(null);
      }
    };

    if (activeDragMarkerId) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [activeDragMarkerId]);

  // Dragging Aim Handles within board logic
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!activeDragHandle || !boardRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = boardRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const marker = markers.find((m) => m.id === activeDragHandle.markerId);
      if (!marker || !marker.skills) return;

      const cx = (marker.x / 100) * canvas.width;
      const cy = (marker.y / 100) * canvas.height;

      const dx = mx - cx;
      const dy = my - cy;

      const distance = Math.sqrt(dx * dx + dy * dy);
      let range = Math.max(3, Math.min(50, (distance / Math.min(canvas.width, canvas.height)) * 100));

      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < 0) angle += 360;

      setMarkers((prev) =>
        prev.map((m) => {
          if (m.id === activeDragHandle.markerId) {
            return {
              ...m,
              skills: (m.skills || []).map((s) => {
                if (s.id === activeDragHandle.skillId) {
                  if (s.shape === "circle") {
                    return { ...s, range: parseFloat(range.toFixed(2)) };
                  }
                  return { ...s, range: parseFloat(range.toFixed(2)), angle: parseFloat(angle.toFixed(1)) };
                }
                return s;
              })
            };
          }
          return m;
        })
      );
    };

    const handleGlobalMouseUp = () => {
      if (activeDragHandle) {
        setActiveDragHandle(null);
      }
    };

    if (activeDragHandle) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [activeDragHandle, markers]);

  // Place Brawler on the board
  const placeBrawler = (brawler: Brawler) => {
    const markerId = `marker-${Date.now()}-${Math.random()}`;
    // Generate new marker at the center
    const newMarker: BrawlerMarker = {
      id: markerId,
      brawler: brawler,
      x: 50,
      y: 50,
      skills: []
    };
    setMarkers((prev) => [...prev, newMarker]);
    setSelectedMarkerId(markerId); // Spawn opens control dashboard immediately
    showToast(`Placed ${brawler.name} on the map. Drag them to position!`, "success");
  };

  // Remove placed Brawler
  const removeMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  };

  // Add a range indicator to the selected brawler marker
  const addSkillIndicator = (
    type: "attack" | "super" | "gadget" | "starpower",
    name: string,
    defaultShape: "circle" | "cone" | "line",
    color: string
  ) => {
    if (!selectedMarkerId) return;

    const newIndicator: BrawlerSkillIndicator = {
      id: `skill-${Date.now()}-${Math.random()}`,
      type,
      name,
      shape: defaultShape,
      color,
      range: 15, // 15% range default
      angle: 270, // Facing upwards default (North)
      width: defaultShape === "cone" ? 45 : 4, // 45° default sweep for cone, 4% length default thickness for line
    };

    setMarkers((prev) =>
      prev.map((m) => {
        if (m.id === selectedMarkerId) {
          return {
            ...m,
            skills: [...(m.skills || []), newIndicator],
          };
        }
        return m;
      })
    );
    showToast(`Added ${name} range indicator to map!`, "success");
  };

  // Delete dynamic range indicator
  const deleteSkillIndicator = (skillId: string) => {
    if (!selectedMarkerId) return;
    setMarkers((prev) =>
      prev.map((m) => {
        if (m.id === selectedMarkerId) {
          return {
            ...m,
            skills: (m.skills || []).filter((s) => s.id !== skillId),
          };
        }
        return m;
      })
    );
    showToast("Range indicator removed", "info");
  };

  // Update specific active indicator properties
  const updateSkillIndicator = (skillId: string, updates: Partial<BrawlerSkillIndicator>) => {
    if (!selectedMarkerId) return;
    setMarkers((prev) =>
      prev.map((m) => {
        if (m.id === selectedMarkerId) {
          return {
            ...m,
            skills: (m.skills || []).map((s) => (s.id === skillId ? { ...s, ...updates } : s)),
          };
        }
        return m;
      })
    );
  };

  // Rarity mappings
  const uniqueRarities = useMemo(() => {
    const seen = new Set<string>();
    brawlers.forEach((b) => {
      if (b.rarity?.name) seen.add(b.rarity.name);
    });
    return Array.from(seen).sort();
  }, [brawlers]);

  // Filtered list of brawlers in right sidebar
  const filteredBrawlers = useMemo(() => {
    return brawlers.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(brawlerSearch.toLowerCase());
      const matchRarity = brawlerRarity ? b.rarity?.name === brawlerRarity : true;
      return matchSearch && matchRarity;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [brawlers, brawlerSearch, brawlerRarity]);

  // Export Plan to JSON
  const handleExportPlan = () => {
    const payload = {
      mapId: map.id,
      mapName: map.name,
      timestamp: new Date().toISOString(),
      actions: actions,
      markers: markers.map((m) => ({
        id: m.id,
        brawlerId: m.brawler.id,
        brawlerName: m.brawler.name,
        x: parseFloat(m.x.toFixed(2)),
        y: parseFloat(m.y.toFixed(2)),
        skills: m.skills || []
      })),
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    setExportedJsonStr(jsonStr);
    setShowExportModal(true);
  };

  // Save Strategy to Server / LocalStorage
  const handleSavePlan = async () => {
    const payload = {
      mapId: map.id,
      actions: actions,
      markers: markers.map((m) => ({
        id: m.id,
        brawlerId: m.brawler.id,
        x: parseFloat(m.x.toFixed(2)),
        y: parseFloat(m.y.toFixed(2)),
        skills: m.skills || []
      })),
    };

    // 1. Save to local cache
    localStorage.setItem(`bf-strategy-${map.id}`, JSON.stringify(payload));

    // 2. Mock API server post
    try {
      const res = await fetch(`/api/maps/${map.id}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Esports strategy plan saved and synchronized to databases!", "success");
      } else {
        showToast("Strategy plan saved successfully to browser cache!", "success");
      }
    } catch (e) {
      showToast("Offline mode active. Strategy cached locally.", "success");
    }
  };

  return (
    <div className="flex flex-1 w-full min-h-screen bg-dark-bg text-gray-100">
      <PageContainer className="py-8 space-y-6">
        
        {/* Global Toast */}
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

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/maps">
              <Button variant="ghost" size="sm" className="border border-white/5 py-1 px-3">
                ← Arenas
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-wide truncate max-w-[300px] sm:max-w-md">
                  {map.name}
                </h1>
                <Badge 
                  style={{
                    backgroundColor: `${map.gameMode?.color || "#ffffff"}20`,
                    borderColor: map.gameMode?.color || "#ffffff",
                    color: map.gameMode?.color || "#ffffff"
                  }}
                  className="hidden sm:inline-block"
                >
                  {map.gameMode?.name}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">
                Esports Map Combat Planner — design path drafts and character drops.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={handleResetBoard} className="text-brawl-red border border-brawl-red/10">
              Reset Board
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPlan}>
              Export JSON
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePlan} className="glow-btn-yellow">
              Save Strategy
            </Button>
          </div>
        </div>

        {/* Main Work Area Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Tactics Tools Dashboard (lg:col-span-2 - more compact to enlarge map!) */}
          <Card variant="premium" className="lg:col-span-2 border border-white/5 bg-dark-card p-5 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-heading font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                Combat Drawing Tools
              </h2>

              {/* Tool Selector */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setTool("freehand")}
                  className={`cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border font-heading font-extrabold text-xs uppercase transition-all ${
                    tool === "freehand"
                      ? "bg-brawl-yellow/15 border-brawl-yellow text-brawl-yellow shadow-[0_0_10px_rgba(247,211,58,0.2)]"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg mb-1">✏️</span>
                  Pencil Line
                </button>
                <button
                  onClick={() => setTool("arrow")}
                  className={`cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border font-heading font-extrabold text-xs uppercase transition-all ${
                    tool === "arrow"
                      ? "bg-brawl-purple/15 border-brawl-purple text-brawl-purple shadow-[0_0_10px_rgba(155,89,182,0.2)]"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg mb-1">➡️</span>
                  Draft Arrow
                </button>
              </div>

              {/* Color Palette */}
              <div className="space-y-2">
                <span className="text-[10px] font-heading font-black text-gray-400 uppercase tracking-wider block">
                  Palette Select
                </span>
                <div className="flex gap-2">
                  {COLORS.map((col) => (
                    <button
                      key={col.value}
                      onClick={() => setColor(col.value)}
                      className={`cursor-pointer h-8 w-8 rounded-full border transition-all ${
                        color === col.value
                          ? "scale-115 ring-2 ring-white border-transparent"
                          : "border-white/10 hover:scale-105"
                      }`}
                      style={{ backgroundColor: col.value }}
                      title={col.label}
                    />
                  ))}
                </div>
              </div>

              {/* Brush Thickness */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-heading font-black text-gray-400 uppercase tracking-wider">
                  <span>Line Thickness</span>
                  <span className="text-brawl-yellow font-bold">{thickness}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={thickness}
                  onChange={(e) => setThickness(parseInt(e.target.value))}
                  className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brawl-yellow"
                />
              </div>

              {/* Canvas controls */}
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    isSkewed={false}
                    disabled={actions.length === 0}
                    onClick={handleUndo}
                    className="text-xs py-1.5"
                  >
                    Undo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isSkewed={false}
                    disabled={redoStack.length === 0}
                    onClick={handleRedo}
                    className="text-xs py-1.5"
                  >
                    Redo
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  isSkewed={false}
                  disabled={actions.length === 0}
                  onClick={handleClearDrawing}
                  className="w-full text-xs text-brawl-red hover:bg-brawl-red/10 border-brawl-red/15 py-1.5"
                >
                  Clear Sketch
                </Button>
              </div>
            </div>

            {/* Strategy Meta Summary */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-wider">
                Arena Rotations
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ShieldIcon size={12} className="text-brawl-blue" />
                <span>Theme: {map.environment?.name || "Standard"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <TrophyIcon size={12} className="text-brawl-yellow" />
                <span>Format: 3v3 Arena Combat</span>
              </div>
            </div>
          </Card>

          {/* Center Column: Interactive Canvas Map Board (lg:col-span-7 - much wider!) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            {/* The Strategy board wrapper container (Perfect vertical Brawl map aspect ratio 21/33!) */}
            <div 
              ref={boardRef}
              className="relative w-full max-w-[620px] bg-black/60 rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none"
              style={{ aspectRatio: "21/33" }}
            >
              {/* Back Map Blueprint Layer */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={map.imageUrl} 
                alt="" 
                className="absolute inset-0 h-full w-full object-contain pointer-events-none opacity-90"
              />

              {/* Front Drawing Canvas Layer */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasTouchEnd}
                className="absolute inset-0 h-full w-full z-10 cursor-crosshair touch-none"
              />

              {/* Interactive Placed Floating Brawler Bubble Markers Layer */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {markers.map((marker) => {
                  const isSelected = marker.id === selectedMarkerId;
                  return (
                    <div
                      key={marker.id}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // Only trigger left click select & drag
                        if (e.button === 0) {
                          setActiveDragMarkerId(marker.id);
                          setSelectedMarkerId(marker.id);
                        }
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        if (e.touches.length === 1) {
                          setActiveDragMarkerId(marker.id);
                          setSelectedMarkerId(marker.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        removeMarker(marker.id);
                        showToast(`Removed ${marker.brawler.name} marker`, "info");
                      }}
                      className={`absolute pointer-events-auto h-11 w-11 rounded-full cursor-grab active:cursor-grabbing hover:scale-115 active:scale-95 border-2 flex items-center justify-center transition-all shadow-2xl relative group bg-dark-surface ${
                        isSelected 
                          ? "ring-4 ring-brawl-yellow animate-pulse border-brawl-yellow scale-110" 
                          : ""
                      }`}
                      style={{ 
                        left: `${marker.x}%`, 
                        top: `${marker.y}%`,
                        transform: "translate(-50%, -50%)",
                        borderColor: marker.brawler.rarity?.color || "#ffffff",
                        boxShadow: isSelected 
                          ? `0 0 25px ${marker.brawler.rarity?.color || "#ffffff"}, 0 8px 32px rgba(0,0,0,0.8)`
                          : `0 8px 24px rgba(0,0,0,0.6), 0 0 12px ${(marker.brawler.rarity?.color || "#ffffff")}40`
                      }}
                    >
                      {/* Brawler avatar inside bubble */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={marker.brawler.imageUrl} 
                        alt="" 
                        className="h-9 w-9 object-contain rounded-full pointer-events-none"
                      />

                      {/* Small close click button */}
                      <button
                        onMouseDown={(e) => e.stopPropagation()} // stop drag triggering
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMarker(marker.id);
                          showToast(`Removed ${marker.brawler.name} marker`, "info");
                        }}
                        className="absolute -top-1 -right-1 h-4.5 w-4.5 bg-brawl-red border border-red-700 text-white rounded-full flex items-center justify-center text-[8px] font-black pointer-events-auto hover:bg-red-500 shadow-md"
                      >
                        ×
                      </button>

                      {/* Small name identifier hover tag */}
                      <div className="absolute bottom-[-22px] bg-black/90 border border-white/10 rounded-md px-1.5 py-0.5 text-[7px] font-heading font-black uppercase text-white tracking-widest opacity-90 select-none group-hover:scale-110">
                        {marker.brawler.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aim Handles for Selected Brawler Skills */}
              <div className="absolute inset-0 z-30 pointer-events-none">
                {selectedMarker && selectedMarker.skills && selectedMarker.skills.map((skill) => {
                  const rad = (skill.angle * Math.PI) / 180;
                  const canvas = canvasRef.current;
                  if (!canvas) return null;
                  
                  const cx = (selectedMarker.x / 100) * canvas.width;
                  const cy = (selectedMarker.y / 100) * canvas.height;
                  const r = (skill.range / 100) * Math.min(canvas.width, canvas.height);
                  
                  let hx = cx;
                  let hy = cy;
                  
                  if (skill.shape === "circle") {
                    hx = cx + r;
                    hy = cy;
                  } else {
                    hx = cx + r * Math.cos(rad);
                    hy = cy + r * Math.sin(rad);
                  }
                  
                  const hxPct = (hx / canvas.width) * 100;
                  const hyPct = (hy / canvas.height) * 100;
                  
                  return (
                    <div
                      key={`handle-${skill.id}`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.button === 0) {
                          setActiveDragHandle({ markerId: selectedMarker.id, skillId: skill.id });
                        }
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        if (e.touches.length === 1) {
                          setActiveDragHandle({ markerId: selectedMarker.id, skillId: skill.id });
                        }
                      }}
                      className="absolute pointer-events-auto h-6 w-6 rounded-full cursor-grab active:cursor-grabbing hover:scale-125 active:scale-95 border-2 flex items-center justify-center transition-all bg-dark-surface shadow-lg group"
                      style={{
                        left: `${hxPct}%`,
                        top: `${hyPct}%`,
                        transform: "translate(-50%, -50%)",
                        borderColor: skill.color,
                        boxShadow: `0 0 15px ${skill.color}, 0 4px 12px rgba(0,0,0,0.6)`
                      }}
                      title={`Drag directly on map to rotate/aim/resize ${skill.name}!`}
                    >
                      <span className="text-[10px] select-none text-white pointer-events-none group-hover:scale-110">🎯</span>
                    </div>
                  );
                })}
              </div>

              {/* Instructions float overlay */}
              <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none bg-black/75 border border-white/5 backdrop-blur-sm rounded-xl p-2.5 text-[9px] text-gray-400">
                👉 <strong>Tactical Direct Controls:</strong> Click to spawn Brawlers. Drag characters to move. **Click Brawler** to highlight, then **Drag the 🎯 Aim Handle** directly on the map to orient, rotate, and resize skills!
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Draggable Brawlers Armory OR Brawler Tactics Console */}
          <Card variant="premium" className="lg:col-span-3 border border-white/5 bg-dark-card p-5 space-y-4 flex flex-col h-[630px] overflow-hidden">
            {selectedMarker ? (
              <div className="flex flex-col h-full space-y-4">
                {/* Header controls */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <button
                    onClick={() => setSelectedMarkerId(null)}
                    className="flex items-center gap-1 text-[10px] font-heading font-black uppercase text-gray-400 hover:text-white cursor-pointer"
                  >
                    ← Spawners
                  </button>
                  <Badge variant="primary" className="bg-brawl-yellow/15 border-brawl-yellow text-brawl-yellow text-[9px] uppercase">
                    Tactics Active
                  </Badge>
                </div>

                {/* Selected Agent Header */}
                <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-3 rounded-2xl relative">
                  <div 
                    className="h-11 w-11 rounded-xl overflow-hidden border-2 p-0.5 shrink-0 bg-dark-surface shadow-md"
                    style={{ borderColor: selectedMarker.brawler.rarity?.color || "rgba(255,255,255,0.1)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedMarker.brawler.imageUrl} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="truncate flex-1">
                    <h3 className="text-xs font-heading font-black text-white uppercase tracking-wide truncate block leading-tight">
                      {selectedMarker.brawler.name}
                    </h3>
                    <span 
                      className="text-[8px] font-heading font-bold uppercase tracking-wider block"
                      style={{ color: selectedMarker.brawler.rarity?.color }}
                    >
                      {selectedMarker.brawler.rarity?.name} — {selectedMarker.brawler.class?.name}
                    </span>
                  </div>
                </div>

                {/* Add Range Overlays */}
                <div className="space-y-2 shrink-0">
                  <span className="text-[9px] font-heading font-black text-gray-400 uppercase tracking-widest block">
                    Show Skill Overlays (แสดงสกิล)
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addSkillIndicator("attack", "Main Attack", "line", "#F7D33A")}
                      className="cursor-pointer flex items-center justify-center gap-1.5 p-2 rounded-xl border border-brawl-yellow/10 bg-brawl-yellow/5 hover:bg-brawl-yellow/15 text-brawl-yellow font-heading font-black text-[9px] uppercase transition-all"
                    >
                      <span>⚔️</span>
                      Attack
                    </button>
                    <button
                      onClick={() => addSkillIndicator("super", "Super Skill", "cone", "#E74C3C")}
                      className="cursor-pointer flex items-center justify-center gap-1.5 p-2 rounded-xl border border-brawl-red/10 bg-brawl-red/5 hover:bg-brawl-red/15 text-brawl-red font-heading font-black text-[9px] uppercase transition-all"
                    >
                      <span>💀</span>
                      Super
                    </button>
                  </div>

                  {/* Dynamic Gadgets Section */}
                  {selectedMarker.brawler.gadgets && selectedMarker.brawler.gadgets.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-white/5 mt-1">
                      <span className="text-[8px] font-heading font-black text-gray-500 uppercase tracking-wider block">
                        Gadget Range Overlays
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {selectedMarker.brawler.gadgets.map((gadget) => (
                          <button
                            key={gadget.id}
                            onClick={() => addSkillIndicator("gadget", gadget.name, "circle", "#2ECC71")}
                            className="cursor-pointer flex items-center gap-2 p-1.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-heading font-bold text-[8px] text-left transition-all uppercase"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={gadget.imageUrl} alt="" className="h-5 w-5 object-contain rounded-lg shrink-0 border border-emerald-500/20 bg-dark-surface" />
                            <span className="truncate flex-1">{gadget.name}</span>
                            <span className="text-[7px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-black text-emerald-300">ADD</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Config List */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar">
                  <span className="text-[9px] font-heading font-black text-gray-400 uppercase tracking-widest block border-t border-white/5 pt-3">
                    Config Ranges ({selectedMarker.skills?.length || 0})
                  </span>

                  {(!selectedMarker.skills || selectedMarker.skills.length === 0) ? (
                    <div className="text-center py-8 text-[9px] text-gray-500 italic bg-black/10 border border-dashed border-white/5 rounded-xl px-2">
                      No active skill lines on map.<br/>Click dynamic skills above to project area indicator lines!
                    </div>
                  ) : (
                    selectedMarker.skills.map((skill) => (
                      <div 
                        key={skill.id}
                        className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-3 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-heading font-black uppercase text-white truncate max-w-[125px]">
                            {skill.name}
                          </span>
                          <button
                            onClick={() => deleteSkillIndicator(skill.id)}
                            className="text-[8px] text-brawl-red hover:underline font-heading font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Shape select */}
                        <div className="space-y-1">
                          <span className="text-[7px] font-heading font-black text-gray-500 uppercase">Indicator Shape</span>
                          <div className="grid grid-cols-3 gap-1">
                            {(["circle", "cone", "line"] as const).map((sh) => (
                              <button
                                key={sh}
                                onClick={() => updateSkillIndicator(skill.id, { shape: sh })}
                                className={`cursor-pointer text-[7px] font-heading font-extrabold uppercase py-1 rounded border transition-all ${
                                  skill.shape === sh 
                                    ? "bg-white/10 border-white/20 text-white" 
                                    : "bg-white/5 border-transparent text-gray-500 hover:text-white"
                                }`}
                              >
                                {sh === "circle" ? "⭕ Cir" : sh === "cone" ? "📐 Cone" : "▭ Line"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Range slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[7px] font-heading font-black text-gray-500 uppercase">
                            <span>Range Radius</span>
                            <span className="text-white font-bold">{skill.range}%</span>
                          </div>
                          <input
                            type="range"
                            min="3"
                            max="50"
                            value={skill.range}
                            onChange={(e) => updateSkillIndicator(skill.id, { range: parseInt(e.target.value) })}
                            className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brawl-yellow"
                          />
                        </div>

                        {/* Angle slider (not for circle) */}
                        {skill.shape !== "circle" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[7px] font-heading font-black text-gray-500 uppercase">
                              <span>Aim Angle (Direction)</span>
                              <span className="text-white font-bold">{skill.angle}°</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={skill.angle}
                              onChange={(e) => updateSkillIndicator(skill.id, { angle: parseInt(e.target.value) })}
                              className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brawl-purple"
                            />
                          </div>
                        )}

                        {/* Width slider (for cone or line) */}
                        {skill.shape !== "circle" && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[7px] font-heading font-black text-gray-500 uppercase">
                              <span>{skill.shape === "cone" ? "Spread Width" : "Thickness"}</span>
                              <span className="text-white font-bold">{skill.width}{skill.shape === "cone" ? "°" : "%"}</span>
                            </div>
                            <input
                              type="range"
                              min={skill.shape === "cone" ? 10 : 2}
                              max={skill.shape === "cone" ? 120 : 15}
                              value={skill.width}
                              onChange={(e) => updateSkillIndicator(skill.id, { width: parseInt(e.target.value) })}
                              className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brawl-blue"
                            />
                          </div>
                        )}

                        {/* Color select */}
                        <div className="space-y-1">
                          <span className="text-[7px] font-heading font-black text-gray-500 uppercase">Glow Color</span>
                          <div className="flex gap-1.5 justify-between">
                            {["#F7D33A", "#E74C3C", "#2ECC71", "#3498DB", "#9B59B6"].map((col) => (
                              <button
                                key={col}
                                onClick={() => updateSkillIndicator(skill.id, { color: col })}
                                className={`cursor-pointer h-4.5 w-4.5 rounded-full border transition-all ${
                                  skill.color === col 
                                    ? "ring-2 ring-white border-transparent scale-110" 
                                    : "border-white/10"
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Remove Marker button */}
                <div className="pt-2 border-t border-white/5 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      removeMarker(selectedMarker.id);
                      showToast(`Removed ${selectedMarker.brawler.name} marker from the field.`, "info");
                    }} 
                    className="w-full text-brawl-red border-brawl-red/20 hover:bg-brawl-red/10 text-[10px] py-1.5"
                  >
                    Delete Character Marker
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-heading font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                  Spawn Brawlers
                </h2>

                {/* Sidebar search input */}
                <div className="relative shrink-0">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <SearchIcon size={14} />
                  </span>
                  <Input
                    placeholder="Find brawler..."
                    value={brawlerSearch}
                    onChange={(e) => setBrawlerSearch(e.target.value)}
                    className="pl-8 text-xs py-1 w-full bg-black/40 border-white/5"
                  />
                  {brawlerSearch && (
                    <button
                      onClick={() => setBrawlerSearch("")}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-white"
                    >
                      <CloseIcon size={12} />
                    </button>
                  )}
                </div>

                {/* Sidebar Rarity Filtering buttons */}
                <div className="flex gap-1 overflow-x-auto shrink-0 pb-1.5 max-w-full">
                  <button
                    onClick={() => setBrawlerRarity(null)}
                    className={`cursor-pointer text-[8px] font-heading font-black uppercase px-2 py-0.5 rounded ${
                      brawlerRarity === null ? "bg-brawl-yellow text-black" : "bg-white/5 text-gray-400"
                    }`}
                  >
                    All
                  </button>
                  {uniqueRarities.map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => setBrawlerRarity(brawlerRarity === rarity ? null : rarity)}
                      className={`cursor-pointer text-[8px] font-heading font-black uppercase px-2 py-0.5 rounded truncate ${
                        brawlerRarity === rarity ? "bg-brawl-purple text-white" : "bg-white/5 text-gray-400"
                      }`}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>

                {/* Brawlers spawn list */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 custom-scrollbar">
                  {filteredBrawlers.length === 0 ? (
                    <div className="text-center py-10 text-xs text-gray-600 italic">
                      No matching brawlers found
                    </div>
                  ) : (
                    filteredBrawlers.map((brawler) => (
                      <div
                        key={brawler.id}
                        onClick={() => placeBrawler(brawler)}
                        className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 hover:border-brawl-yellow/30 hover:bg-black/50 transition-all duration-200 cursor-pointer group select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="h-8 w-8 rounded-lg overflow-hidden border p-0.5 shrink-0 bg-dark-surface"
                            style={{ borderColor: brawler.rarity?.color || "rgba(255,255,255,0.1)" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={brawler.imageUrl} alt="" className="h-full w-full object-contain" />
                          </div>
                          <div className="truncate max-w-[120px]">
                            <span className="text-xs font-heading font-extrabold text-gray-200 group-hover:text-brawl-yellow uppercase truncate block leading-tight">
                              {brawler.name}
                            </span>
                            <span 
                              className="text-[8px] font-heading font-bold uppercase tracking-wider block"
                              style={{ color: brawler.rarity?.color }}
                            >
                              {brawler.rarity?.name}
                            </span>
                          </div>
                        </div>
                        
                        <span className="text-[9px] text-brawl-yellow font-extrabold uppercase bg-brawl-yellow/10 px-2 py-0.5 rounded group-hover:bg-brawl-yellow group-hover:text-black transition-colors shrink-0">
                          Spawn +
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* JSON Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <Card variant="premium" className="w-full max-w-lg border border-white/10 bg-dark-card shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setShowExportModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-heading font-black text-white flex items-center gap-2">
                    <span className="text-brawl-yellow">JSON</span> Strategy Plan Export
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Copy and share this strategic drawing action map configuration.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    value={exportedJsonStr}
                    className="w-full h-64 bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto outline-none focus:border-brawl-yellow/30"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    isSkewed={false}
                    onClick={() => {
                      navigator.clipboard.writeText(exportedJsonStr);
                      showToast("JSON payload copied to your clipboard!", "success");
                    }}
                  >
                    Copy Payload
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    isSkewed={false}
                    onClick={() => setShowExportModal(false)}
                  >
                    Close Modal
                  </Button>
                </div>
              </div>

            </Card>
          </div>
        )}

      </PageContainer>
    </div>
  );
}
