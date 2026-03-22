"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useChangePasswordMutation } from "@/reduxToolKit/uniFeatures/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pickRedirectPath } from "@/reduxToolKit/user/userUtils";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const roles = useSelector((s: any) => s.user?.user?.roles || []);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();
      setSuccess(true);
      setTimeout(() => router.replace(pickRedirectPath(roles, "university")), 1500);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to change password. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-purple-100 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Set your password
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your account requires a password change before you can continue.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm font-medium">
            Password updated. Redirecting to dashboard...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Temporary password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Enter your temporary password"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {isLoading ? "Saving..." : "Set new password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
