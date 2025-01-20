// src/components/ui/page-header.tsx
import React from "react";

interface PageHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function PageHeader({ heading, text, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children && (
        <div className="flex items-center space-x-2">{children}</div>
      )}
    </div>
  );
}

export type { PageHeaderProps };
