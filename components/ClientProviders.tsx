"use client";

import { useState, useEffect } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";

function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "40px" }}>🤖</div>
      <p style={{ fontSize: "16px", fontWeight: 600, color: "#111" }}>
        AI Assistant
      </p>
      <p style={{ fontSize: "13px", color: "#666" }}>Loading...</p>
      <div style={{ display: "flex", gap: "8px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#6366f1",
              animation: "bounce 0.8s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <PageLoader />
        {children}
      </TooltipProvider>
    </AuthProvider>
  );
}