"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MenuIcon, TrophyIcon, ShieldIcon, SwordIcon, StarIcon, CloseIcon } from "../ui/icons";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Brawlers", href: "/brawlers", icon: <SwordIcon size={16} /> },
    { name: "Maps & Modes", href: "/maps", icon: <ShieldIcon size={16} /> },
    { name: "Tier List", href: "/tier-list", icon: <TrophyIcon size={16} /> },
    { name: "Team Builder", href: "/team-builder", icon: <StarIcon size={16} /> },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-dark-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-brawl-yellow transform -skew-x-12 group-hover:scale-105 transition-all duration-300">
                <span className="text-black font-heading font-black text-xl transform skew-x-12">BF</span>
                <div className="absolute inset-0 rounded-lg border-2 border-white/20 animate-pulse-glow" />
              </div>
              <span className="text-2xl font-heading font-extrabold tracking-wider text-white text-glow-yellow transition-all duration-300">
                Brawl<span className="text-brawl-yellow">Field</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-heading font-extrabold text-gray-300 hover:text-brawl-yellow hover:scale-105 transition-all duration-200 uppercase tracking-wider"
              >
                <span className="text-brawl-yellow/80">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Call-to-action */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" isSkewed={true}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" isSkewed={true}>
              Join Platform
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all cursor-pointer"
            >
              {isOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-x-0 border-b border-white/5 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-heading font-extrabold text-gray-300 hover:text-brawl-yellow hover:bg-white/5 transition-all duration-200 uppercase tracking-wider"
              >
                <span className="text-brawl-yellow">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
              <Button variant="ghost" size="md" isSkewed={false} className="w-full" onClick={() => setIsOpen(false)}>
                Sign In
              </Button>
              <Button variant="primary" size="md" isSkewed={false} className="w-full" onClick={() => setIsOpen(false)}>
                Join Platform
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
