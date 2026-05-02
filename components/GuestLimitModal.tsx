"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function GuestLimitModal() {
  const { authMode, guestLimitReached, loginAsUser, logout } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  if (authMode !== "guest" || !guestLimitReached) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.mobile.trim()) e.mobile = "Required";
    if (!consent) e.consent = "Required";
    return e;
  };

const handleSignIn = async () => {
  const e = validate();
  if (Object.keys(e).length > 0) { setErrors(e); return; }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        consentGiven: consent,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setServerError(data.error || "Something went wrong."); return; }

    loginAsUser({
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      consentGiven: true,
      registeredAt: new Date().toISOString(),
    });
  } catch {
    setServerError("Network error. Please try again.");
  }
};

  const field = (key: "name" | "email" | "mobile", placeholder: string, type = "text") => (
    <div className="space-y-1">
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: "" })); }}
        className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary
          ${errors[key] ? "border-red-500" : "border-border"}`}
      />
      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-4">
        <div className="text-center space-y-1">
          <div className="text-3xl">🔒</div>
          <h2 className="text-xl font-bold">Guest limit reached</h2>
          <p className="text-sm text-muted-foreground">Sign in to keep chatting</p>
        </div>

        {field("name", "Full Name")}
        {field("email", "Email Address", "email")}
        {field("mobile", "Mobile Number", "tel")}

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setErrors(p => ({ ...p, consent: "" })); }} className="mt-1" />
          <span className="text-xs text-muted-foreground">I agree my data may be stored to personalise my experience</span>
        </label>
        {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}
        {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}
        <button
          type="button"
          onClick={handleSignIn}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        >
          Sign In & Continue
        </button>

        <button type="button" onClick={logout} className="w-full text-sm text-muted-foreground hover:underline">
          Start over
        </button>
      </div>
    </div>
  );
}