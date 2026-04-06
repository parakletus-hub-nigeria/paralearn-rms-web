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
    <div className="min-h-screen bg-[#fbf8ff] font-body text-[#001453] selection:bg-[#dbe1ff] selection:text-[#00174b] flex flex-col items-center justify-center p-4 py-12">
      <style dangerouslySetInnerHTML={{__html: `.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }`}} />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 justify-center text-2xl font-extrabold text-[#004ac6]">
            <span className="material-symbols-outlined text-3xl">account_tree</span>
            SabiNote
          </Link>
          <h1 className="text-3xl font-headline font-bold text-[#001453] tracking-tight">Create your account</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6ffbbe] border border-[#4edea3] text-[#002113] text-xs font-bold shadow-sm">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span> 5 free Parats on signup
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-3xl border border-[#c3c6d7]/20 shadow-xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-sm">
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
                <label className="text-xs font-bold uppercase tracking-wider text-[#737686]">{label}</label>
                <div className="relative group">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737686] group-focus-within:text-[#004ac6] transition-colors" />
                  <input
                    type={type} placeholder={placeholder}
                    required={field !== "schoolName"}
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-[#fbf8ff] border border-[#c3c6d7]/30 focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] rounded-xl outline-none transition-all text-sm font-medium text-[#001453] placeholder:text-[#c3c6d7]"
                  />
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#737686]">Role (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                    className={`py-2 px-3 rounded-xl border text-sm font-bold capitalize transition-all ${form.role === r ? "border-[#004ac6] bg-[#dbe1ff] text-[#00174b]" : "border-[#c3c6d7]/30 bg-[#fbf8ff] text-[#434655] hover:bg-[#f3f2ff]"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading}
                className="w-full py-6 h-auto bg-gradient-to-r from-[#004ac6] to-[#2563eb] hover:from-[#004ac6]/90 hover:to-[#2563eb]/90 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Create Account</>}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm font-medium text-[#434655]">
            Already have an account?{" "}
            <Link href={routespath.SABINOTE_LOGIN} className="font-bold text-[#004ac6] hover:text-[#004ac6]/80 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
