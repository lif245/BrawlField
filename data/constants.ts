/**
 * BrawlField - Application Constants
 *
 * Static data and configuration constants used across the application.
 */

export const APP_NAME = "BrawlField";
export const APP_DESCRIPTION =
  "Brawl Stars Strategy & Tools Platform — Guides, analytics, and team composition tools.";

/** Brawler rarity color mapping for UI styling */
export const RARITY_COLORS: Record<string, string> = {
  common: "#B0E0E6",
  rare: "#4CAF50",
  super_rare: "#2196F3",
  epic: "#9C27B0",
  mythic: "#F44336",
  legendary: "#FFD700",
};

/** Navigation links for the main menu */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/brawlers", label: "Brawlers" },
  { href: "/meta", label: "Meta" },
  { href: "/tools", label: "Tools" },
] as const;
