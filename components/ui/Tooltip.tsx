"use client";

import React, { useState } from "react";

export interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export const Tooltip = ({ content, position = "top", children }: TooltipProps) => {
  const [active, setActive] = useState(false);

  const showTip = () => {
    setActive(true);
  };

  const hideTip = () => {
    setActive(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-brawl-purple border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-brawl-purple border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-brawl-purple border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-brawl-purple border-y-transparent border-l-transparent",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
    >
      {children}
      {active && (
        <div
          className={`
            absolute z-50 px-3 py-1.5 text-xs font-semibold text-white 
            bg-[#130f26]/90 border border-brawl-purple/50 rounded-lg shadow-xl
            backdrop-blur-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-150
            ${positionClasses[position]}
          `}
        >
          {content}
          {/* Arrow */}
          <div className={`absolute border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
export default Tooltip;
