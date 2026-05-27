import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isSkewed?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isSkewed = true, glow = true, children, ...props }, ref) => {
    // Base classes
    const baseStyles = "relative inline-flex items-center justify-center font-heading font-extrabold uppercase tracking-wider transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    // Size variants
    const sizeStyles = {
      sm: "px-4 py-2 text-xs rounded",
      md: "px-6 py-3 text-sm rounded-md",
      lg: "px-8 py-4 text-base rounded-lg",
    };

    // Skew styling for intense game feel
    const skewClass = isSkewed ? "transform -skew-x-12" : "";
    const unskewClass = isSkewed ? "transform skew-x-12 inline-block" : "";

    // Design variants using Brawl Stars theme
    const variantStyles = {
      primary: `
        bg-brawl-yellow text-black border-b-4 border-amber-600 
        hover:bg-yellow-300 hover:border-amber-500 hover:text-black
        ${glow ? "glow-btn-yellow shadow-[0_0_15px_rgba(247,211,58,0.3)] hover:shadow-[0_0_25px_rgba(247,211,58,0.6)]" : ""}
      `,
      secondary: `
        bg-brawl-purple text-white border-b-4 border-purple-800 
        hover:bg-purple-500 hover:border-purple-700
        ${glow ? "shadow-[0_0_15px_rgba(155,89,182,0.3)] hover:shadow-[0_0_25px_rgba(155,89,182,0.6)]" : ""}
      `,
      ghost: `
        bg-transparent text-white border border-white/20 hover:bg-white/10 hover:border-white/40
      `,
      danger: `
        bg-brawl-red text-white border-b-4 border-red-800 
        hover:bg-red-500 hover:border-red-700
        ${glow ? "shadow-[0_0_15px_rgba(231,76,60,0.3)] hover:shadow-[0_0_25px_rgba(231,76,60,0.6)]" : ""}
      `,
      success: `
        bg-brawl-green text-white border-b-4 border-emerald-800 
        hover:bg-emerald-500 hover:border-emerald-700
        ${glow ? "shadow-[0_0_15px_rgba(46,204,113,0.3)] hover:shadow-[0_0_25px_rgba(46,204,113,0.6)]" : ""}
      `,
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${skewClass} ${className}`}
        {...props}
      >
        {/* Gaming slant corner cuts using pseudo-elements if not skewed */}
        <span className={`${unskewClass} flex items-center justify-center gap-2`}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
