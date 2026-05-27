import React from "react";
import { SearchIcon } from "./icons";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean;
  glow?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", showIcon = true, glow = true, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {showIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brawl-yellow transition-colors duration-300">
            <SearchIcon size={18} />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={`
            w-full bg-dark-bg/60 text-white placeholder-gray-500 text-sm 
            rounded-md border border-white/10 py-3 transition-all duration-300
            ${showIcon ? "pl-11" : "pl-4"} pr-4
            focus:outline-none focus:border-brawl-yellow/50 focus:bg-dark-surface/80
            ${glow ? "focus:shadow-[0_0_15px_rgba(247,211,58,0.15)]" : ""}
            ${className}
          `}
          {...props}
        />
        {/* Gaming underline highlight */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brawl-yellow/0 to-transparent group-focus-within:via-brawl-yellow transition-all duration-500 scale-x-0 group-focus-within:scale-x-100" />
      </div>
    );
  }
);

Input.displayName = "Input";
