"use client";

import { useState } from "react";
import Link from "next/link";
import AuthHeader from "@/components/auth/authHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function UniForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    email,
  );

  const handleSubmit = async () => {
    if (!isValidEmail) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/uni-proxy/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Still show success to prevent email enumeration
        console.error("Forgot password error:", data);
      }

      setIsSubmitted(true);
    } catch (err) {
      // Show success even on network error to prevent enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#F8F7FC]">
      <AuthHeader />
      <div className="mt-[50px] w-[95%] sm:w-[45%] max-w-md">
        <Card className="border-[1px] border-[#641BC4] bg-[#EDEAFB] shadow-lg rounded-lg">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#641BC4]/10">
              <Mail className="h-6 w-6 text-[#641BC4]" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Forgot Password
            </CardTitle>
            <p className="text-sm text-gray-700 text-center px-2">
              Enter your university account email address and we'll send you a
              reset link.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
            {isSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Check your inbox
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    If this email exists, you'll receive a reset link shortly.
                  </p>
                </div>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#641BC4] hover:underline mt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@university.edu"
                    className="h-11 rounded-lg border-[#641BC4] bg-white focus:bg-white"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !isValidEmail}
                  className="h-12 w-full rounded-xl font-semibold text-white shadow-md transition-all disabled:opacity-60"
                  style={{ backgroundColor: "#641BC4" }}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#641BC4] hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
