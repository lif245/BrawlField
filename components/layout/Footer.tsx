import React from "react";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-black/40 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brawl-yellow transform -skew-x-12">
                <span className="text-black font-heading font-black text-sm transform skew-x-12">BF</span>
              </div>
              <span className="text-xl font-heading font-extrabold tracking-wider text-white">
                Brawl<span className="text-brawl-yellow">Field</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Elevate your Brawl Stars gameplay with analytics, team recommendations, real-time meta tier lists, and strategic guides designed for premium competitive performance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-heading font-extrabold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/brawlers" className="text-sm text-gray-400 hover:text-brawl-yellow transition-all">
                  Brawlers Database
                </Link>
              </li>
              <li>
                <Link href="/maps" className="text-sm text-gray-400 hover:text-brawl-yellow transition-all">
                  Active Maps
                </Link>
              </li>
              <li>
                <Link href="/tier-list" className="text-sm text-gray-400 hover:text-brawl-yellow transition-all">
                  Meta Tier List
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Social */}
          <div>
            <h3 className="text-sm font-heading font-extrabold text-white uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="https://discord.gg" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-brawl-yellow transition-all">
                  Discord Server
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-brawl-yellow transition-all">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-brawl-yellow transition-all">
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer compliant with Supercell Fan Content Policy */}
        <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Disclaimer: This material is unofficial and is not endorsed by Supercell. For more information see Supercell&apos;s Fan Content Policy: www.supercell.com/fan-content-policy.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              &copy; {currentYear} BrawlField. All rights reserved. Designed with ❤️ for Brawlers.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-400 transition-all">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-400 transition-all">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
