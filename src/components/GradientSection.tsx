"use client";

import React from "react";

interface GradientSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientSection = ({
  children,
  className = "",
}: GradientSectionProps) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to bottom, rgb(219, 191, 234) 0%, rgb(219, 191, 234) 25%, rgba(219, 191, 234, 0.5) 50%, rgb(255, 255, 255) 100%)`,
    backgroundAttachment: "fixed",
    minHeight: "100vh",
  };

  return (
    <div style={gradientStyle} className={`${className}`}>
      {children}
    </div>
  );
};
