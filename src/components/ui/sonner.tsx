"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--bg-1)",
          "--normal-text": "var(--fg)",
          "--normal-border": "var(--line-2)",
          "--border-radius": "0",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
