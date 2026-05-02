"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/LoginScreen";
import { GuestLimitModal } from "@/components/GuestLimitModal";
import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { useRef, useEffect, useState, useCallback } from "react";

// Completely isolated loading bar — manages its own state via callbacks
let setLoadingGlobal: ((v: boolean) => void) | null = null;

function LoadingBar() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoadingGlobal = setLoading;
    return () => { setLoadingGlobal = null; };
  }, []);

  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: "hsl(var(--primary) / 0.2)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "40%",
              backgroundColor: "hsl(var(--primary))",
              borderRadius: "2px",
              animation: "aui-loading 1s ease-in-out infinite",
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes aui-loading {
          0%   { margin-left: -40%; }
          100% { margin-left: 140%; }
        }
      `}</style>
    </>
  );
}

function ChatApp() {
  const { authMode, guestLimitReached, incrementGuestCount, userData } = useAuth();

  const authRef = useRef({ authMode, guestLimitReached, incrementGuestCount });
  useEffect(() => {
    authRef.current = { authMode, guestLimitReached, incrementGuestCount };
  }, [authMode, guestLimitReached, incrementGuestCount]);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      fetch: async (url: RequestInfo | URL, options?: RequestInit) => {
        const { authMode, guestLimitReached, incrementGuestCount } = authRef.current;

        if (authMode === "guest" && guestLimitReached) {
          return new Response(
            new ReadableStream({ start(c) { c.close(); } }),
            { status: 200, headers: { "Content-Type": "text/event-stream" } }
          );
        }

        if (authMode === "guest") incrementGuestCount();

        // Show loading
        setLoadingGlobal?.(true);

        try {
          const response = await window.fetch(url, options);

          // Watch stream for completion
          if (response.body) {
            const [a, b] = response.body.tee();
            const reader = a.getReader();
            (async () => {
              try {
                while (true) {
                  const { done } = await reader.read();
                  if (done) break;
                }
              } finally {
                setLoadingGlobal?.(false);
              }
            })();
            return new Response(b, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          }

          setLoadingGlobal?.(false);
          return response;
        } catch (e) {
          setLoadingGlobal?.(false);
          throw e;
        }
      },
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <GuestLimitModal />
      <LoadingBar />

      {userData?.name && (
        <div style={{
          position: "fixed",
          top: "12px",
          right: "16px",
          zIndex: 30,
          fontSize: "12px",
          color: "hsl(var(--muted-foreground))",
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          padding: "6px 12px",
          borderRadius: "9999px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          👋 {userData.name}
        </div>
      )}

      <div className="h-dvh">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}

export default function Home() {
  const { authMode } = useAuth();
  if (authMode === "none") return <LoginScreen />;
  return <ChatApp />;
}