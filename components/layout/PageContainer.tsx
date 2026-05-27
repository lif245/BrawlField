import React from "react";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  hasSidebar?: boolean;
  animate?: boolean;
}

export const PageContainer = ({
  children,
  className = "",
  hasSidebar = false,
  animate = true,
}: PageContainerProps) => {
  const containerClass = hasSidebar
    ? "flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
    : "flex-1 px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full";

  const animationClass = animate
    ? "animate-in fade-in slide-in-from-bottom-5 duration-500"
    : "";

  return (
    <main className={`${containerClass} ${animationClass} ${className}`}>
      {children}
    </main>
  );
};
export default PageContainer;
