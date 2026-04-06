"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { standaloneRegister } from "@/reduxToolKit/sabiStandaloneAuth/sabiStandaloneAuthThunks";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import { Mail, Lock, User, School, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLES = ["teacher", "admin", "headteacher", "other"] as const;

export default function SabiNoteRegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((s: RootState) => s.sabiStandaloneAuth);
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    schoolName: "", role: "teacher" as (typeof ROLES)[number],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, schoolName: form.schoolName || undefined };
    const result = await dispatch(standaloneRegister(payload));
    if (standaloneRegister.fulfilled.match(result)) {
      router.push(routespath.SABINOTE_DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen bg-sabi-surface font-body text-sabi-on-surface selection:bg-sabi-primary-fixed selection:text-sabi-on-primary-fixed flex flex-col items-center justify-center p-4 py-12">
      <style dangerouslySetInnerHTML={{__html: `.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }`}} />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 justify-center text-2xl font-extrabold text-sabi-primary">
            <span className="material-symbols-outlined text-3xl">account_tree</span>
            SabiNote
          </Link>
          <h1 className="text-3xl font-headline font-bold text-sabi-on-surface tracking-tight">Create your account</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sabi-tertiary-fixed border border-sabi-tertiary-fixed-dim text-sabi-on-tertiary-fixed text-xs font-bold shadow-sm">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span> 5 free Parats on signup
          </div>
        </div>

        <div className="bg-sabi-surface-container-lowest rounded-3xl border border-sabi-outline-variant/20 shadow-xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sabi-error-container text-sabi-on-error-container text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Full Name", field: "name", type: "text", icon: User, placeholder: "Jane Doe" },
              { label: "Email", field: "email", type: "email", icon: Mail, placeholder: "jane@example.com" },
              { label: "Password", field: "password", type: "password", icon: Lock, placeholder: "Min. 6 characters" },
              { label: "School Name (optional)", field: "schoolName", type: "text", icon: School, placeholder: "Green Valley High" },
            ].map(({ label, field, type, icon: Icon, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-sabi-outline">{label}</label>
                <div className="relative group">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sabi-outline group-focus-within:text-sabi-primary transition-colors" />
                  <input
                    type={type} placeholder={placeholder}
                    required={field !== "schoolName"}
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-sabi-surface border border-sabi-outline-variant/30 focus:border-sabi-primary focus:ring-1 focus:ring-sabi-primary rounded-xl outline-none transition-all text-sm font-medium text-sabi-on-surface placeholder:text-sabi-outline-variant"
                  />
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-sabi-outline">Role (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                    className={`py-2 px-3 rounded-xl border text-sm font-bold capitalize transition-all ${form.role === r ? "border-sabi-primary bg-sabi-primary-fixed text-sabi-on-primary-fixed" : "border-sabi-outline-variant/30 bg-sabi-surface text-sabi-on-surface-variant hover:bg-sabi-surface-container-low"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading}
                className="w-full py-6 h-auto bg-gradient-to-r from-sabi-primary to-sabi-primary-container hover:from-sabi-primary/90 hover:to-sabi-primary-container/90 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Create Account</>}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm font-medium text-sabi-on-surface-variant">
            Already have an account?{" "}
            <Link href={routespath.SABINOTE_LOGIN} className="font-bold text-sabi-primary hover:text-sabi-primary/80 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
