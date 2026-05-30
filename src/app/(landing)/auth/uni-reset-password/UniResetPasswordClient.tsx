"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthHeader from "@/components/auth/authHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UniResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid =
    newPassword.length >= 8 && newPassword === confirmPassword && !!token;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/uni-proxy/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data?.message || "Failed to reset password. The link may have expired.",
        );
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 2500);
    } catch {
      setError("Network error. Please check your connection and try again.");
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
              <KeyRound className="h-6 w-6 text-[#641BC4]" />
            </div>
            <CardTitle className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              Reset Password
            </CardTitle>
            <p className="text-sm text-center px-2" style={{ color: "var(--foreground-muted)" }}>
              Enter your new password below to complete the reset.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
            {!token ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <AlertCircle className="h-10 w-10" style={{ color: "var(--crimson-signal)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Invalid or missing reset token.
                </p>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  Please request a new password reset link.
                </p>
                <Link
                  href="/auth/uni-forgot-password"
                  className="text-sm font-semibold hover:underline"
                  style={{ color: "var(--violet-ink)" }}
                >
                  Request new link
                </Link>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--emerald-tint)", border: "1px solid var(--border-fine)" }}>
                  <CheckCircle2 className="h-7 w-7" style={{ color: "var(--emerald-signal)" }} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                    Password reset successful!
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Redirecting you to sign in...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="font-medium" style={{ color: "var(--foreground)" }}>
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="h-11 pr-10"
                      style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "var(--surface-muted)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {showNew ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="font-medium" style={{ color: "var(--foreground)" }}>
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="h-11 pr-10"
                      style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)", background: "var(--surface-muted)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {showConfirm ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs flex items-center gap-1" style={{ color: "var(--crimson-signal)" }}>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--crimson-signal)" }}>
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !isValid}
                  className="h-12 w-full font-semibold text-white transition-all disabled:opacity-60"
                  style={{ borderRadius: "var(--radius-lg)", background: "var(--violet-ink)", border: "none", boxShadow: "var(--shadow-card)" }}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "var(--violet-ink)" }}
                  >
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
