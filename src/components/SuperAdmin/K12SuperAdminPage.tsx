"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  setK12AdminSession,
  clearK12AdminSession,
  K12_SESSION_KEY,
  K12_SUBDOMAIN_KEY,
} from "@/reduxToolKit/superAdmin/superAdminSlice";
import {
  useRegisterK12SchoolMutation,
  useGetK12SchoolsQuery,
  useSuspendK12SchoolMutation,
  useActivateK12SchoolMutation,
  useDeleteK12SchoolMutation,
  RegisterSchoolPayload,
  RegisterSchoolResult,
  K12School,
} from "@/reduxToolKit/superAdminFeatures/k12SchoolsApi";
import {
  useGetSuperAdminTemplatesQuery,
  useCreateSuperAdminTemplateMutation,
  useUpdateSuperAdminTemplateMutation,
  useDeleteSuperAdminTemplateMutation,
} from "@/reduxToolKit/api/endpoints/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  ShieldCheck,
  Plus,
  X,
  Eye,
  EyeOff,
  Copy,
  School,
  CheckCircle2,
  Globe,
  LogOut,
  AlertTriangle,
  Lock,
  GraduationCap,
  MapPin,
  Link2,
  UserCircle,
  Mail,
  Phone,
  Hash,
  Sparkles,
  BookOpen,
  ExternalLink,
  LayoutTemplate,
  Pencil,
  Trash2,
  ImageOff,
  Loader2,
  Search,
  PauseCircle,
  PlayCircle,
  Users,
  Building2,
} from "lucide-react";

// ─── Lock Screen (real JWT login) ─────────────────────────────────────────────

function LockScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    if (!email.trim()) return toast.error("Enter your admin email");
    if (!pass.trim()) return toast.error("Enter your password");
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.message || "Login failed. Check your credentials.");
        return;
      }
      const userEmail = json?.data?.user?.email ?? email.trim();
      const subdomain = json?.data?.school?.subdomain ?? "";
      if (!subdomain) {
        toast.error("Could not determine school subdomain from login response.");
        return;
      }
      // Verify this account has super admin privileges (cookie is set by the login above)
      const verify = await fetch("/api/proxy/super-admin/verify", {
        credentials: "include",
        headers: { "X-Tenant-Subdomain": subdomain },
      });
      if (!verify.ok) {
        toast.error("This account does not have K-12 super admin privileges.");
        return;
      }
      dispatch(setK12AdminSession({ subdomain, email: userEmail }));
      toast.success("K-12 Admin Panel unlocked");
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#060d1a]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-700/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-950/40 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/60">
              <School className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            ParaLearn
          </h1>
          <p className="text-blue-300/70 text-sm font-medium mt-1 tracking-widest uppercase">
            K-12 Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-[2rem] p-8 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none">
                Restricted Access
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                K-12 school provisioning only
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-200/80 text-xs leading-relaxed">
              This portal provisions K-12 schools and admin accounts. Only
              authorised ParaLearn team members should access this page.
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <div>
              <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Admin Email
              </Label>
              <div className="relative mt-1.5">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="superadmin@paralearn.ng"
                  className="h-12 pl-10 rounded-xl bg-white/[0.06] border-white/[0.12] text-white placeholder:text-slate-600 text-sm focus:border-blue-400/60 focus:bg-white/[0.08] focus:ring-0"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Password
              </Label>
              <div className="relative mt-1.5">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <Input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="Enter your password…"
                  className="h-12 pl-10 pr-11 rounded-xl bg-white/[0.06] border-white/[0.12] text-white placeholder:text-slate-600 font-mono text-sm focus:border-blue-400/60 focus:bg-white/[0.08] focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isLoading || !email.trim() || !pass.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-blue-900/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Sign In</>
            )}
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          ParaLearn · Platform v2 · K-12 Admin
        </p>
      </div>
    </div>
  );
}

// ─── Register School Modal ─────────────────────────────────────────────────────

function RegisterSchoolModal({ onClose }: { onClose: () => void }) {
  const [registerSchool, { isLoading }] = useRegisterK12SchoolMutation();
  const [result, setResult] = useState<RegisterSchoolResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState<RegisterSchoolPayload>({
    schoolName: "",
    domain: "",
    adminEmail: "",
    adminPassword: "",
    adminFirstName: "",
    adminLastName: "",
    phoneNumber: "",
    address: "",
    motto: "",
    website: "",
  });

  const set = (field: keyof RegisterSchoolPayload, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.schoolName) return toast.error("School name is required");
    if (!form.domain) return toast.error("Domain (subdomain) is required");
    if (!form.adminEmail) return toast.error("Admin email is required");
    if (!form.adminPassword || form.adminPassword.length < 8)
      return toast.error("Admin password must be at least 8 characters");
    if (!form.adminFirstName || !form.adminLastName)
      return toast.error("Admin first and last name are required");

    try {
      const payload: RegisterSchoolPayload = {
        schoolName: form.schoolName,
        domain: form.domain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminFirstName: form.adminFirstName,
        adminLastName: form.adminLastName,
      };
      if (form.phoneNumber) payload.phoneNumber = form.phoneNumber;
      if (form.address) payload.address = form.address;
      if (form.motto) payload.motto = form.motto;
      if (form.website) payload.website = form.website;

      const res = await registerSchool(payload).unwrap();
      setResult(res);
      toast.success("School registered successfully!");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to register school");
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full sm:max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[88vh]">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-none">
                Register K-12 School
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Provision a new school on ParaLearn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {result ? (
            // ── Success State ──────────────────────────────────────────────
            <div className="space-y-4">
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
                <div className="flex items-center gap-3 relative">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-bold text-sm">School registered!</p>
                    <p className="text-emerald-600 text-xs mt-0.5">
                      Share credentials securely with the school admin.
                    </p>
                  </div>
                </div>
              </div>

              {/* School details */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">School</p>
                </div>
                <div className="p-4 space-y-2.5">
                  <p className="font-bold text-slate-900 text-base">{result.schoolName}</p>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-mono">{result.schoolId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-sm text-blue-600 font-bold font-mono">
                      {result.subdomain}.pln.ng
                    </span>
                    {result.wasSubdomainModified && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                        Modified from &quot;{result.originalDomain}&quot;
                      </span>
                    )}
                  </div>
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {result.loginUrl}
                  </a>
                </div>

                <div className="bg-slate-50 px-4 py-2.5 border-t border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Account</p>
                </div>
                <div className="p-4 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm text-slate-700 font-semibold">{result.adminEmail}</span>
                </div>
              </div>

              {/* Login URL copy */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-100/60 border-b border-blue-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <p className="text-blue-700 text-xs font-bold uppercase tracking-wider">
                    Share with School Admin
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: "Login URL", value: result.loginUrl, field: "url" },
                    { label: "Email", value: result.adminEmail, field: "email" },
                  ].map(({ label, value, field }) => (
                    <div key={field} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">{label}</p>
                        <p className="text-sm text-blue-900 font-mono truncate">{value}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(value, field)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-200 hover:bg-blue-300 active:scale-95 text-blue-900 rounded-xl text-xs font-bold transition-all"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedField === field ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 active:scale-[.99] text-white font-bold shadow-lg shadow-blue-200 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            // ── Form State ─────────────────────────────────────────────────
            <div className="space-y-6">

              {/* School Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <School className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">School Details</h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                      School Name <span className="text-red-400 normal-case">*</span>
                    </Label>
                    <Input
                      value={form.schoolName}
                      onChange={(e) => set("schoolName", e.target.value)}
                      placeholder="e.g. Bright Future Academy"
                      className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Domain with live preview */}
                  <div>
                    <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                      Domain (Subdomain) <span className="text-red-400 normal-case">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Link2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <Input
                        value={form.domain}
                        onChange={(e) =>
                          set("domain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        placeholder="brightfuture"
                        className="h-11 rounded-xl pl-10 pr-24 font-mono border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-400 pointer-events-none">
                        .pln.ng
                      </span>
                    </div>
                    {form.domain && (
                      <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-600 font-mono font-semibold">
                          {form.domain}.pln.ng
                        </span>
                        <span className="text-xs text-blue-400 ml-auto">Live URL preview</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Motto
                      </Label>
                      <Input
                        value={form.motto}
                        onChange={(e) => set("motto", e.target.value)}
                        placeholder="Knowledge is Light"
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Website
                      </Label>
                      <Input
                        value={form.website}
                        onChange={(e) => set("website", e.target.value)}
                        placeholder="https://..."
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Phone
                      </Label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          value={form.phoneNumber}
                          onChange={(e) => set("phoneNumber", e.target.value)}
                          placeholder="+234..."
                          className="h-11 rounded-xl pl-10 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Address
                      </Label>
                      <div className="relative mt-1.5">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          value={form.address}
                          onChange={(e) => set("address", e.target.value)}
                          placeholder="City, State"
                          className="h-11 rounded-xl pl-10 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400 font-medium">
                    Admin Account
                  </span>
                </div>
              </div>

              {/* Admin Account */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <UserCircle className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">School Admin Account</h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                      Admin Email <span className="text-red-400 normal-case">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        value={form.adminEmail}
                        onChange={(e) => set("adminEmail", e.target.value)}
                        placeholder="admin@brightfuture.ng"
                        className="h-11 rounded-xl pl-10 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                      Admin Password <span className="text-red-400 normal-case">*</span>
                    </Label>
                    <Input
                      type="password"
                      value={form.adminPassword}
                      onChange={(e) => set("adminPassword", e.target.value)}
                      placeholder="Min 8 characters"
                      className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        First Name <span className="text-red-400 normal-case">*</span>
                      </Label>
                      <Input
                        value={form.adminFirstName}
                        onChange={(e) => set("adminFirstName", e.target.value)}
                        placeholder="Grace"
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Last Name <span className="text-red-400 normal-case">*</span>
                      </Label>
                      <Input
                        value={form.adminLastName}
                        onChange={(e) => set("adminLastName", e.target.value)}
                        placeholder="Okoro"
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-blue-700 text-xs leading-relaxed">
                  The school will be accessible at{" "}
                  <strong>{form.domain || "subdomain"}.pln.ng</strong> after
                  registration. Share the login URL and password securely with
                  the school admin.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[.99] text-white font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Registering school…
                  </>
                ) : (
                  <>
                    <School className="w-4 h-4" />
                    Register School
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const [showModal, setShowModal] = useState(false);

  const handleLockOut = () => {
    dispatch(clearK12AdminSession());
    toast("Session ended.");
  };

  return (
    <div className="min-h-screen bg-[#060d1a] relative overflow-x-hidden">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-blue-700/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-lg" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/50">
                <School className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">ParaLearn</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  K-12 Admin
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">K-12 school provisioning console</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowModal(true)}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Register School
            </button>
            <button
              onClick={handleLockOut}
              title="Lock session"
              className="h-10 px-4 rounded-xl flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Lock
            </button>
          </div>
        </div>

        {/* ── Info Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: School,
              title: "Register School",
              desc: "Provision a new K-12 school with admin account, subdomain, and login URL.",
              color: "text-blue-400",
              bg: "bg-blue-500/20",
              border: "border-blue-500/20",
              gradient: "from-blue-500/20 to-cyan-600/10",
            },
            {
              icon: GraduationCap,
              title: "Admin Setup",
              desc: "Each school gets a dedicated admin who completes setup: sessions, classes, subjects.",
              color: "text-cyan-400",
              bg: "bg-cyan-500/20",
              border: "border-cyan-500/20",
              gradient: "from-cyan-500/20 to-teal-600/10",
            },
            {
              icon: BookOpen,
              title: "Self-Service",
              desc: "After provisioning, the school admin logs in and configures everything independently.",
              color: "text-teal-400",
              bg: "bg-teal-500/20",
              border: "border-teal-500/20",
              gradient: "from-teal-500/20 to-emerald-600/10",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-2xl p-5 backdrop-blur-sm`}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className={`text-sm font-bold mb-1 ${card.color}`}>{card.title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Flow Steps ── */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm mb-8">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400 inline-block" />
            School Setup Flow
          </h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Register School",
                desc: 'Click "Register School" and fill in school name, domain, and admin credentials.',
                color: "bg-blue-500",
              },
              {
                step: "2",
                title: "Share Credentials",
                desc: "Copy the login URL, admin email, and password. Share securely with the school administrator.",
                color: "bg-cyan-500",
              },
              {
                step: "3",
                title: "Admin Configures School",
                desc: "Admin logs in at [subdomain].pln.ng and sets up: academic sessions, classes, subjects, teachers, and students.",
                color: "bg-teal-500",
              },
              {
                step: "4",
                title: "School Goes Live",
                desc: "Teachers and students access the platform via the school subdomain.",
                color: "bg-emerald-500",
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full ${color} text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5`}>
                  {step}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-bold">Ready to onboard a new school?</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Register their school in under 2 minutes.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Register New School
          </button>
        </div>

        {/* ── Registered Schools ── */}
        <SchoolsManager />

        {/* ── Report Card Templates ── */}
        <ReportCardTemplateManager />

        <p className="text-center text-slate-700 text-xs mt-8">
          ParaLearn K-12 Admin · School Provisioning Console
        </p>
      </div>

      {showModal && <RegisterSchoolModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ─── Schools Manager ──────────────────────────────────────────────────────────

function SchoolsManager() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<K12School | null>(null);
  const [confirmName, setConfirmName] = useState("");

  const { data, isLoading, isError, refetch } = useGetK12SchoolsQuery({ limit: 100, search: search || undefined });
  const [suspendSchool, { isLoading: suspending }] = useSuspendK12SchoolMutation();
  const [activateSchool, { isLoading: activating }] = useActivateK12SchoolMutation();
  const [deleteSchool, { isLoading: deleting }] = useDeleteK12SchoolMutation();

  const schools: K12School[] = (data as any)?.schools ?? (data as any)?.data ?? (Array.isArray(data) ? data : []);

  const handleToggleActive = async (school: K12School) => {
    try {
      if (school.isActive) {
        await suspendSchool(school.id).unwrap();
        toast.success(`${school.name} suspended`);
      } else {
        await activateSchool(school.id).unwrap();
        toast.success(`${school.name} activated`);
      }
    } catch {
      toast.error("Failed to update school status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (confirmName.trim().toLowerCase() !== deleteTarget.name.trim().toLowerCase()) {
      toast.error("School name does not match — deletion cancelled");
      return;
    }
    try {
      await deleteSchool(deleteTarget.id).unwrap();
      toast.success(`${deleteTarget.name} permanently deleted`);
      setDeleteTarget(null);
      setConfirmName("");
    } catch {
      toast.error("Failed to delete school");
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          Registered Schools
          {schools.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold">
              {schools.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => refetch()}
          className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search schools..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-400/50"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
        </div>
      ) : isError ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <AlertTriangle className="mx-auto h-7 w-7 text-red-400 mb-2" />
          <p className="text-red-300 text-sm font-semibold">Failed to load schools</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
          <School className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <p className="text-slate-500 text-sm">No schools registered yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schools.map((school) => (
            <div
              key={school.id}
              className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.05] transition-colors"
            >
              {/* Logo / Avatar */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                {school.logoUrl ? (
                  <img src={school.logoUrl} alt={school.name} className="w-full h-full object-cover" />
                ) : (
                  <School className="w-5 h-5 text-blue-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{school.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-slate-500 text-xs">{school.subdomain}.pln.ng</span>
                  {school._count?.users != null && (
                    <span className="flex items-center gap-1 text-slate-600 text-xs">
                      <Users className="w-3 h-3" />
                      {school._count.users}
                    </span>
                  )}
                  <span className="text-slate-600 text-xs">
                    {new Date(school.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                school.isActive
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {school.isActive ? "Active" : "Suspended"}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleActive(school)}
                  disabled={suspending || activating}
                  title={school.isActive ? "Suspend school" : "Activate school"}
                  className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                    school.isActive
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                  } disabled:opacity-40`}
                >
                  {school.isActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                  {school.isActive ? "Suspend" : "Activate"}
                </button>
                <button
                  onClick={() => { setDeleteTarget(school); setConfirmName(""); }}
                  title="Permanently delete school"
                  className="h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0d1628] border border-red-500/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Delete School Permanently</h3>
                <p className="text-slate-500 text-xs mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5">
              <p className="text-red-300 text-xs leading-relaxed">
                Permanently deleting <strong>{deleteTarget.name}</strong> will remove all associated data — classes, subjects, assessments, students, scores, and teachers. This <strong>cannot be reversed</strong>.
              </p>
            </div>

            <div className="mb-5">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                Type the school name to confirm
              </label>
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={deleteTarget.name}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-slate-700 text-sm focus:outline-none focus:border-red-400/60"
                onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setConfirmName(""); }}
                className="flex-1 h-11 rounded-xl bg-white/[0.05] border border-white/[0.1] text-slate-300 text-sm font-semibold hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleting ||
                  confirmName.trim().toLowerCase() !== deleteTarget.name.trim().toLowerCase()
                }
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete Permanently</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Report Card Template Manager ─────────────────────────────────────────────

interface TemplateForm {
  name: string;
  ejsCode: string;
  thumbnailUrl: string;
  description: string;
  version: string;
}

const emptyForm: TemplateForm = {
  name: "",
  ejsCode: "",
  thumbnailUrl: "",
  description: "",
  version: "1",
};

function ReportCardTemplateManager() {
  const { data: templates = [], isLoading, isError } = useGetSuperAdminTemplatesQuery();
  const [createTemplate, { isLoading: creating }] = useCreateSuperAdminTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateSuperAdminTemplateMutation();
  const [deleteTemplate] = useDeleteSuperAdminTemplateMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const set = (k: keyof TemplateForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (tpl: any) => {
    setEditId(tpl.id);
    setForm({
      name: tpl.name ?? "",
      ejsCode: tpl.ejsCode ?? "",
      thumbnailUrl: tpl.thumbnailUrl ?? "",
      description: tpl.description ?? "",
      version: String(tpl.version ?? 1),
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.ejsCode.trim() || !form.thumbnailUrl.trim()) {
      toast.error("Name, EJS Code, and Thumbnail URL are required.");
      return;
    }
    const payload = {
      name: form.name,
      ejsCode: form.ejsCode,
      thumbnailUrl: form.thumbnailUrl,
      description: form.description || undefined,
      version: parseInt(form.version) || 1,
    };
    try {
      if (editId) {
        await updateTemplate({ id: editId, ...payload }).unwrap();
        toast.success("Template updated.");
      } else {
        await createTemplate(payload).unwrap();
        toast.success("Template created.");
      }
      setFormOpen(false);
    } catch {
      toast.error("Failed to save template.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTemplate(deleteTarget).unwrap();
      toast.success("Template deleted.");
    } catch {
      toast.error("Failed to delete template.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const isSaving = creating || updating;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-blue-400" />
          Report Card Templates
        </h2>
        <button
          onClick={openCreate}
          className="h-9 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          New Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
        </div>
      ) : isError ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto h-7 w-7 text-red-400 mb-3" />
          <p className="text-red-300 text-sm font-semibold">Failed to load templates</p>
          <p className="text-slate-500 text-xs mt-1">
            The backend may require additional authentication for super admin template endpoints.
          </p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-10 text-center">
          <ImageOff className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">No templates yet. Create the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl: any) => (
            <div
              key={tpl.id}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
            >
              <div className="aspect-[4/3] bg-slate-800 overflow-hidden">
                {tpl.thumbnailUrl ? (
                  <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="h-8 w-8 text-slate-600" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white font-semibold text-sm leading-tight">{tpl.name}</p>
                  <span className="text-[10px] text-slate-500 shrink-0">v{tpl.version}</span>
                </div>
                {tpl.description && (
                  <p className="text-slate-500 text-xs line-clamp-2">{tpl.description}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openEdit(tpl)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(tpl.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full sm:max-w-lg bg-[#0d1626] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[88vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <LayoutTemplate className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-white font-bold text-sm">
                  {editId ? "Edit Template" : "New Template"}
                </p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                  Name <span className="text-red-400 normal-case">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Classic A4"
                  className="mt-1.5 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-400"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                  Thumbnail URL <span className="text-red-400 normal-case">*</span>
                </Label>
                <Input
                  value={form.thumbnailUrl}
                  onChange={(e) => set("thumbnailUrl", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="mt-1.5 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-400"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                  Description
                </Label>
                <Input
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Best for primary schools"
                  className="mt-1.5 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-400"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                  Version
                </Label>
                <Input
                  type="number"
                  value={form.version}
                  onChange={(e) => set("version", e.target.value)}
                  className="mt-1.5 h-11 rounded-xl bg-white/5 border-white/10 text-white focus:border-blue-400 w-28"
                />
              </div>
              <div>
                <Label className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                  EJS Template Code <span className="text-red-400 normal-case">*</span>
                </Label>
                <Textarea
                  value={form.ejsCode}
                  onChange={(e) => set("ejsCode", e.target.value)}
                  placeholder={"<div class='report'><h1><%= student.name %></h1></div>"}
                  rows={8}
                  className="mt-1.5 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-400 font-mono text-xs resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 shrink-0 flex gap-3">
              <button
                onClick={() => setFormOpen(false)}
                className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : editId ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0d1626] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Delete template?</p>
                <p className="text-slate-500 text-xs mt-0.5">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function K12SuperAdminPage() {
  const dispatch = useDispatch<AppDispatch>();
  const k12Unlocked = useSelector((s: RootState) => s.superAdmin?.k12Unlocked);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Rehydrate session from sessionStorage on page load / refresh
    const subdomain = sessionStorage.getItem(K12_SUBDOMAIN_KEY) ?? "";
    const email = sessionStorage.getItem("k12_admin_email") ?? "";
    if (sessionStorage.getItem(K12_SESSION_KEY) === "true" && subdomain) {
      dispatch(setK12AdminSession({ subdomain, email }));
    }
    setHydrated(true);
  }, [dispatch]);

  if (!hydrated) return null;
  if (!k12Unlocked) return <LockScreen />;
  return <Dashboard />;
}
