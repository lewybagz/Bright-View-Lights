// src/components/PerformanceWrapper.tsx
import React from "react";

interface PerformanceWrapperProps {
  children: React.ReactNode;
}

export function PerformanceWrapper({ children }: PerformanceWrapperProps) {
  React.useEffect(() => {
    console.timeEnd("Application Initialization");
    console.log("Application mounted");
  }, []);
  return <>{children}</>;
}
