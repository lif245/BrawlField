import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "premium";
  glowColor?: "yellow" | "purple" | "blue" | "none";
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", glowColor = "none", children, ...props }, ref) => {
    // Glass panel classes from app/globals.css
    const baseStyles = "rounded-xl overflow-hidden border transition-all duration-300";
    
    // Panel type styles
    const variantStyles = {
      default: "glass-panel",
      premium: "glass-panel-premium",
      interactive: "glass-panel-premium glass-panel-interactive",
    };

    // Border glow color mapping
    const glowStyles = {
      none: "",
      yellow: "hover:border-brawl-yellow/50 hover:shadow-[0_0_20px_rgba(247,211,58,0.15)]",
      purple: "hover:border-brawl-purple/50 hover:shadow-[0_0_20px_rgba(155,89,182,0.2)]",
      blue: "hover:border-brawl-blue/50 hover:shadow-[0_0_20px_rgba(52,152,219,0.2)]",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${glowStyles[glowColor]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-5 border-b border-white/5 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 bg-black/20 border-t border-white/5 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
