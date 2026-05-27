import React from "react";

export type BadgeVariant =
  | "common"
  | "rare"
  | "super-rare"
  | "epic"
  | "mythic"
  | "legendary"
  | "primary"
  | "secondary"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge = ({ className = "", variant = "primary", children, ...props }: BadgeProps) => {
  // Base gaming badge styling
  const baseStyles =
    "inline-flex items-center px-2.5 py-1 rounded text-xs font-heading font-extrabold uppercase tracking-wider transform -skew-x-12 border transition-all duration-300";

  // Color styles corresponding to Brawl Stars colors & Brawler rarity
  const variantStyles = {
    primary: "bg-brawl-yellow/10 text-brawl-yellow border-brawl-yellow/30 shadow-[0_0_8px_rgba(247,211,58,0.1)]",
    secondary: "bg-brawl-purple/10 text-brawl-purple border-brawl-purple/30 shadow-[0_0_8px_rgba(155,89,182,0.1)]",
    outline: "bg-transparent text-gray-300 border-white/20",
    
    // Brawl Stars Rarities
    common: "bg-gray-500/10 text-gray-300 border-gray-500/30",
    rare: "bg-brawl-green/10 text-brawl-green border-brawl-green/30 shadow-[0_0_8px_rgba(46,204,113,0.1)]",
    "super-rare": "bg-brawl-blue/10 text-brawl-blue border-brawl-blue/30 shadow-[0_0_8px_rgba(52,152,219,0.1)]",
    epic: "bg-purple-600/20 text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.1)]",
    mythic: "bg-red-500/25 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]",
    legendary: "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse-glow",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      <span className="transform skew-x-12 flex items-center gap-1.5">{children}</span>
    </span>
  );
};
