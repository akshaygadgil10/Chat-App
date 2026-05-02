import { useAuth } from "@/lib/auth-context";

// Inside the component:
const { authMode, guestMessagesUsed } = useAuth();

// In JSX:
{authMode === "guest" && (
  <div className="text-xs text-muted-foreground px-4 py-2 border-t border-border">
    Guest: {3 - guestMessagesUsed} message{3 - guestMessagesUsed !== 1 ? "s" : ""} left
  </div>
)}