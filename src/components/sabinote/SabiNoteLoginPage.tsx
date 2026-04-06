"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { standaloneLogin } from "@/reduxToolKit/sabiStandaloneAuth/sabiStandaloneAuthThunks";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import { Mail, Lock, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SabiNoteLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((s: RootState) => s.sabiStandaloneAuth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(standaloneLogin(form));
    if (standaloneLogin.fulfilled.match(result)) {
      router.push(routespath.SABINOTE_DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen bg-sabi-surface font-body text-sabi-on-surface selection:bg-sabi-primary-fixed selection:text-sabi-on-primary-fixed flex flex-col items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{__html: `.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }`}} />
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 justify-center text-2xl font-extrabold text-sabi-primary">
            <span className="material-symbols-outlined text-3xl">account_tree</span>
            SabiNote
          </Link>
          <h1 className="text-3xl font-headline font-bold text-sabi-on-surface tracking-tight">Welcome back</h1>
          <p className="text-sabi-on-surface-variant font-medium text-sm">Sign in to your SabiNote account</p>
        </div>

        <div className="bg-sabi-surface-container-lowest rounded-3xl border border-sabi-outline-variant/20 shadow-xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sabi-error-container text-sabi-on-error-container text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-sabi-outline">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sabi-outline group-focus-within:text-sabi-primary transition-colors" />
                <input
                  type="email" required
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-sabi-surface border border-sabi-outline-variant/30 focus:border-sabi-primary focus:ring-1 focus:ring-sabi-primary rounded-xl outline-none transition-all text-sm font-medium text-sabi-on-surface placeholder:text-sabi-outline-variant"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-sabi-outline">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sabi-outline group-focus-within:text-sabi-primary transition-colors" />
                <input
                  type="password" required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-sabi-surface border border-sabi-outline-variant/30 focus:border-sabi-primary focus:ring-1 focus:ring-sabi-primary rounded-xl outline-none transition-all text-sm font-medium text-sabi-on-surface placeholder:text-sabi-outline-variant"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit" disabled={loading}
                className="w-full py-6 h-auto bg-gradient-to-r from-sabi-primary to-sabi-primary-container hover:from-sabi-primary/90 hover:to-sabi-primary-container/90 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Sign In</>}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm font-medium text-sabi-on-surface-variant">
            Don't have an account?{" "}
            <Link href={routespath.SABINOTE_REGISTER} className="font-bold text-sabi-primary hover:text-sabi-primary/80 transition-colors">
              Register for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
