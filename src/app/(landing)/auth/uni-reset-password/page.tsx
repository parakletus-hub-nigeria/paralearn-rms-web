"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthHeader from "@/components/auth/authHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UniResetPasswordPage() {
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
            <CardTitle className="text-xl font-bold text-slate-900">
              Reset Password
            </CardTitle>
            <p className="text-sm text-gray-700 text-center px-2">
              Enter your new password below to complete the reset.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
            {!token ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="text-sm font-semibold text-slate-700">
                  Invalid or missing reset token.
                </p>
                <p className="text-sm text-slate-500">
                  Please request a new password reset link.
                </p>
                <Link
                  href="/auth/uni-forgot-password"
                  className="text-sm font-semibold text-[#641BC4] hover:underline"
                >
                  Request new link
                </Link>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Password reset successful!
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Redirecting you to sign in...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-slate-700 font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="h-11 rounded-lg border-[#641BC4] bg-white focus:bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="h-11 rounded-lg border-[#641BC4] bg-white focus:bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {error && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !isValid}
                  className="h-12 w-full rounded-xl font-semibold text-white shadow-md transition-all disabled:opacity-60"
                  style={{ backgroundColor: "#641BC4" }}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-semibold text-[#641BC4] hover:underline"
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
