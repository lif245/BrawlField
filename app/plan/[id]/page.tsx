"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth";
import { ShieldIcon, TrophyIcon, SparklesIcon } from "@/components/ui/icons";

interface Line {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface Placement {
  id: string;
  brawlerId: number;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  role: string;
}

interface Strategy {
  id: string;
  user_id: string | null;
  map_id: number;
  map_name: string;
  map_image_url: string;
  title: string;
  description: string;
  canvas_data: { lines: Line[] };
  brawlers_data: { placements: Placement[] };
  created_at: string;
  updated_at: string;
}

export default function SharedPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [plan, setPlan] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch plan data by ID
  useEffect(() => {
    if (!id) return;

    async function loadPlan() {
      try {
        const response = await fetch(`/api/strategies?id=${id}`);
        if (!response.ok) {
          throw new Error("Strategy not found (status " + response.status + ")");
        }
        const data = await response.json();
        setPlan(data);
      } catch (err: any) {
        console.error("Failed to load strategy plan from API, checking local storage:", err);
        // Fallback to check local storage in case the user is running pure offline mock
        const localStrats = JSON.parse(localStorage.getItem("bf_mock_strategies") || "[]");
        const found = localStrats.find((s: any) => s.id === id);
        
        if (found) {
          setPlan(found);
        } else {
          setError(err.message || "Failed to load plan");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPlan();
  }, [id]);

  // Handle canvas rendering when plan is loaded
  useEffect(() => {
    if (!plan) return;
    drawCanvas();
  }, [plan]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions relative to visual container size
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    const lines = plan?.canvas_data?.lines || [];
    lines.forEach((line) => {
      if (line.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const startPoint = line.points[0];
      ctx.moveTo((startPoint.x / 100) * canvas.width, (startPoint.y / 100) * canvas.height);

      for (let i = 1; i < line.points.length; i++) {
        const pt = line.points[i];
        ctx.lineTo((pt.x / 100) * canvas.width, (pt.y / 100) * canvas.height);
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    const resizeHandler = () => {
      drawCanvas();
    };
    window.addEventListener("resize", resizeHandler);
    // Timeout to trigger layout calculations after background asset renders
    const timer = setTimeout(drawCanvas, 600);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      clearTimeout(timer);
    };
  }, [plan]);

  // Clone strategy function
  const handleCloneToEdit = () => {
    if (!plan) return;

    // Put current plan contents in local storage cloned slot
    const cloneData = {
      title: plan.title,
      description: plan.description,
      map_id: plan.map_id,
      canvas_data: plan.canvas_data,
      brawlers_data: plan.brawlers_data,
    };

    localStorage.setItem("bf_cloned_plan", JSON.stringify(cloneData));
    
    alert("Plan blueprints copied! Redirecting to Tactical board...");
    router.push("/team-builder");
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 w-full items-center justify-center py-20">
        <span className="h-10 w-10 border-4 border-brawl-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-1 w-full items-center justify-center py-20">
        <PageContainer className="text-center space-y-4">
          <h2 className="text-2xl font-heading font-black text-white">PLAN NOT FOUND</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            The strategy plan link you opened might be broken, deleted, or missing from the database.
          </p>
          <Button variant="primary" isSkewed={true} onClick={() => router.push("/team-builder")}>
            Create New Plan
          </Button>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-1 w-full">
      <PageContainer className="py-10 space-y-8">
        
        {/* Banner Details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/40 border border-white/5 rounded-3xl p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brawl-yellow">
              <ShieldIcon size={16} />
              <span className="text-[10px] font-heading font-black tracking-widest uppercase">Shared Strategy blueprint</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase leading-tight">
              {plan.title}
            </h1>
            <p className="text-xs text-gray-400">
              Active Battle Map: <strong className="text-brawl-yellow">{plan.map_name}</strong> • Created at:{" "}
              {new Date(plan.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <Button
              variant="primary"
              size="lg"
              isSkewed={true}
              className="glow-btn-yellow text-glow-yellow font-extrabold uppercase tracking-wider"
              onClick={handleCloneToEdit}
            >
              Clone to Edit ✂
            </Button>
            
            <Button variant="secondary" size="lg" isSkewed={true} onClick={() => router.push("/team-builder")}>
              Create My Own
            </Button>
          </div>
        </div>

        {/* Read-Only Canvas Board and Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Read-Only Board */}
          <div className="lg:col-span-8 space-y-6">
            <div 
              ref={containerRef}
              className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl"
              style={{
                backgroundImage: `url(${plan.map_image_url})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Canvas Overlay for sketches */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 w-full h-full pointer-events-none"
              />

              {/* Positioned Brawler Tokens */}
              {plan.brawlers_data?.placements?.map((p) => (
                <div
                  key={p.id}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <span className="bg-black/80 border border-brawl-yellow/50 text-glow-yellow text-[8px] font-heading font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90 mb-1 leading-none shadow-lg">
                      {p.role}
                    </span>

                    <div className="h-12 w-12 rounded-full border-2 border-brawl-yellow bg-dark-bg p-0.5 shadow-xl flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain" />
                    </div>

                    <span className="text-[9px] text-white font-black uppercase mt-1 bg-black/50 px-1 py-0.5 rounded leading-none text-center">
                      {p.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Tactic Info & Team Roster info */}
          <div className="lg:col-span-4 space-y-6">
            <Card variant="premium" className="border-brawl-yellow/10">
              <CardHeader className="p-4 border-b border-white/5">
                <h3 className="font-heading font-extrabold text-white text-base">
                  Tactical Guidelines
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1 bg-black/20 p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Tactic Scheme Info</span>
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line mt-1">
                    {plan.description || "No specific team instruction detailed for this board layout."}
                  </p>
                </div>

                {plan.brawlers_data?.placements?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Role Assignment Sheet</span>
                    
                    <div className="space-y-2">
                      {plan.brawlers_data.placements.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.imageUrl} alt={p.name} className="h-6 w-6 object-contain rounded-md" />
                            <span className="text-xs font-bold text-white">{p.name}</span>
                          </div>
                          
                          <span className="text-[9px] font-heading font-black text-glow-yellow text-brawl-yellow uppercase tracking-wide">
                            {p.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/5 pt-4">
                  <div className="bg-brawl-purple/10 border border-brawl-purple/20 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-brawl-purple font-black uppercase tracking-wider block">Cooperative Work</span>
                      <span className="text-xs text-gray-300 mt-1 block leading-tight">Clone this layout to custom modify its markers.</span>
                    </div>
                    
                    <Button size="sm" variant="primary" isSkewed={true} onClick={handleCloneToEdit}>
                      Clone Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
