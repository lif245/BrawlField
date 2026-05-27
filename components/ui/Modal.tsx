"use client";

import React, { useEffect } from "react";
import { CloseIcon } from "./icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with strong blur and gaming dark overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} glass-panel-premium 
          rounded-2xl border border-brawl-purple/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]
          transform overflow-hidden transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in-95
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-brawl-purple/10 to-transparent">
          {title ? (
            <h2 className="text-xl font-heading font-extrabold tracking-wider text-white text-glow-purple">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-brawl-yellow transition-all duration-200 cursor-pointer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-gray-300 max-h-[70vh] overflow-y-auto scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
