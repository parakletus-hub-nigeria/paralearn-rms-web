"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthHeader from "@/components/auth/authHeader";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import { loginUser } from "@/reduxToolKit/user/userThunks";
import { AppDispatch } from "@/reduxToolKit/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail } from "lucide-react";

export default function SigninPage() {
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: any) => state.user);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const isValid = () => {
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRe.test(data.email) && data.password.length >= 8;
  };

  const submit = async () => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();

      if (result && result.accessToken) {
        if (result.redirecting) {
          toast.success("Logged in successfully! Redirecting...");
          return;
        }
        toast.success("Logged in successfully!");
        router.push(routespath.DASHBOARD);
      } else {
        toast.error("Login failed. No token received.");
      }
    } catch (e: any) {
      toast.error(
        (typeof e === "string" ? e : (e as Error)?.message) ||
          "Login failed. Please check your credentials and try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-slate-50 via-white to-purple-50/30 pb-12">
      <AuthHeader />
      <div className="mt-8 w-[95%] max-w-md sm:mt-12">
        <Card className="w-full border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/50 shadow-primary/5 ring-1 ring-slate-200/60">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Admin Login
            </CardTitle>
            <p className="text-sm text-slate-500">
              Sign in to your administrator account to continue
            </p>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700">
                Admin Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={data.email}
                onChange={handleChange}
                placeholder="admin@school.edu"
                className="h-11 rounded-lg border-slate-300 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-11 rounded-lg border-slate-300 bg-slate-50/50 pr-10 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEye className="h-4 w-4" />
                  ) : (
                    <FaEyeSlash className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}

            <Button
              onClick={submit}
              disabled={loading || !isValid()}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-primary via-purple-700 to-primary font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="flex flex-col items-center gap-2 pt-1 text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:underline hover:underline-offset-2"
              >
                Forgot password?
              </Link>
              <p className="text-sm text-slate-500">
                Do not have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-primary hover:underline hover:underline-offset-2"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
}
