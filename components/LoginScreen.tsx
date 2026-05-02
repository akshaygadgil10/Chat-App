"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Field = "name" | "email" | "mobile";

export function LoginScreen() {
  const { loginAsGuest, loginAsUser } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field | "consent", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e: Partial<Record<Field | "consent", string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.mobile.trim()) e.mobile = "Mobile is required";
    else if (!/^[+]?[\d\s\-()]{7,15}$/.test(form.mobile)) e.mobile = "Invalid mobile";
    if (!consent) e.consent = "You must agree to continue";
    return e;
  };

  const handleSignIn = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSubmitting(true);
    setServerError("");

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

      if (!res.ok) {
        setServerError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      loginAsUser({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        consentGiven: true,
        registeredAt: new Date().toISOString(),
      });

    } catch {
      setServerError("Network error. Please check your connection.");
      setSubmitting(false);
    }
  };

  const handleChange = (field: Field, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border shadow-xl bg-card space-y-6">

        <div className="text-center space-y-1">
          <div className="text-4xl mb-2">🤖</div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">
            {showSignIn ? "Create your account to get started" : "Sign in for unlimited access or try as a guest"}
          </p>
        </div>

        {!showSignIn ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowSignIn(true)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Sign In / Register
            </button>
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex-1 h-px bg-border" />or<div className="flex-1 h-px bg-border" />
            </div>
            <button
              type="button"
              onClick={loginAsGuest}
              className="w-full py-3 rounded-xl border border-border bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition"
            >
              Continue as Guest
            </button>
            <p className="text-center text-xs text-muted-foreground pt-1">
              Guest mode allows <strong>3 messages</strong> only
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                autoFocus
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.name ? "border-red-500" : "border-border"}`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.email ? "border-red-500" : "border-border"}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Mobile Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.mobile ? "border-red-500" : "border-border"}`}
              />
              {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
            </div>

            {/* Consent */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (errors.consent) setErrors((p) => ({ ...p, consent: undefined }));
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${consent ? "bg-primary border-primary" : errors.consent ? "border-red-500" : "border-border group-hover:border-primary"}`}>
                    {consent && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  I agree that my name, email, and mobile number may be stored to personalise my experience.
                </span>
              </label>
              {errors.consent && <p className="text-xs text-red-500 ml-8">{errors.consent}</p>}
            </div>

            {serverError && (
              <p className="text-sm text-red-500 text-center">{serverError}</p>
            )}
<p className="text-xs text-red-500">{submitting ? "LOADING..." : "idle"}</p>
            {/* Submit button with spinner */}
            <button
              type="button"
              onClick={handleSignIn}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setShowSignIn(false); setErrors({}); setServerError(""); }}
              className="w-full text-sm text-muted-foreground hover:underline"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}