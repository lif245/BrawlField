"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SwordIcon, ShieldIcon, TrophyIcon, StarIcon, ClockIcon, SparklesIcon } from "../ui/icons";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "My Brawlers", href: "/dashboard/brawlers", icon: <SwordIcon size={20} /> },
    { name: "Favorite Maps", href: "/dashboard/maps", icon: <ShieldIcon size={20} /> },
    { name: "My Teams", href: "/dashboard/teams", icon: <StarIcon size={20} /> },
    { name: "Rankings", href: "/dashboard/rankings", icon: <TrophyIcon size={20} /> },
    { name: "Recent Matches", href: "/dashboard/matches", icon: <ClockIcon size={20} /> },
    { name: "Meta Analytics", href: "/dashboard/meta", icon: <SparklesIcon size={20} /> },
  ];

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-[calc(100vh-80px)] sticky top-20 border-r border-white/5 bg-dark-bg/60 backdrop-blur-md transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Toggle button */}
      <div className="flex justify-end p-4 border-b border-white/5">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 hover:text-brawl-yellow transition-all duration-200 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Menu links */}
      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-4.5 rounded-lg px-4 py-3 text-sm font-heading font-extrabold text-gray-400 hover:text-brawl-yellow hover:bg-white/5 hover:border-l-4 hover:border-brawl-yellow transition-all duration-200 uppercase tracking-wider group"
          >
            <span className="text-gray-400 group-hover:text-brawl-yellow transition-colors duration-200">
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="truncate">{item.name}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Mini profile or settings at the bottom */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brawl-purple to-brawl-blue flex items-center justify-center font-heading font-black text-white text-xs border border-white/20">
            BP
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-heading font-extrabold text-white">BrawlPro</span>
              <span className="text-xs text-brawl-yellow font-medium">Rank #150</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
