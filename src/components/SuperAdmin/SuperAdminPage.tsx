"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  setSuperAdminKey,
  clearSuperAdminKey,
} from "@/reduxToolKit/superAdmin/superAdminSlice";
import {
  useListUniversitiesQuery,
  useBootstrapUniversityMutation,
  BootstrapUniversityPayload,
} from "@/reduxToolKit/superAdminFeatures/universitiesApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ShieldCheck,
  Plus,
  X,
  Eye,
  EyeOff,
  Copy,
  Building2,
  Users,
  CheckCircle2,
  Globe,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Lock,
  Sparkles,
  GraduationCap,
  MapPin,
  Link2,
  UserCircle,
  Mail,
  Hash,
} from "lucide-react";

// ─── Lock Screen ──────────────────────────────────────────────────────────────

function LockScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleUnlock = () => {
    if (!key.trim()) return toast.error("Please enter the Super Admin Key");
    if (key.trim().length < 10)
      return toast.error("Key too short — check your secrets vault");
    dispatch(setSuperAdminKey(key.trim()));
    toast.success("Access granted");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0614]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-950/40 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-purple-500/30 blur-xl" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-900/60">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            ParaLearn
          </h1>
          <p className="text-purple-300/70 text-sm font-medium mt-1 tracking-widest uppercase">
            Super Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-[2rem] p-8 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none">
                Restricted Access
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Platform-level operations only
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-200/80 text-xs leading-relaxed">
              This portal provisions universities and admin accounts. Use only
              with an authorised key from the backend secrets vault.
            </p>
          </div>

          {/* Input */}
          <div className="space-y-2 mb-5">
            <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Super Admin Key
            </Label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <Input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="Paste key from secrets vault…"
                className="h-12 pl-10 pr-11 rounded-xl bg-white/[0.06] border-white/[0.12] text-white placeholder:text-slate-600 font-mono text-sm focus:border-purple-400/60 focus:bg-white/[0.08] focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={!key.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-purple-900/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Unlock Portal
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          ParaLearn · Platform v2 · Super Admin
        </p>
      </div>
    </div>
  );
}

// ─── Bootstrap University Modal ───────────────────────────────────────────────

interface BootstrapResult {
  university: { id: string; name: string; subdomain: string };
  admin: { email: string; temporaryPassword: string };
  message: string;
}

function BootstrapModal({ onClose }: { onClose: () => void }) {
  const [bootstrapUniversity, { isLoading }] = useBootstrapUniversityMutation();
  const [result, setResult] = useState<BootstrapResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<BootstrapUniversityPayload>({
    name: "",
    subdomain: "",
    schoolAdminEmail: "",
    adminFirstName: "",
    adminLastName: "",
    logoUrl: "",
    address: "",
  });

  const set = (field: keyof BootstrapUniversityPayload, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name) return toast.error("University name is required");
    if (!form.subdomain) return toast.error("Subdomain is required");
    if (!form.schoolAdminEmail) return toast.error("Admin email is required");
    if (!form.adminFirstName || !form.adminLastName)
      return toast.error("Admin first and last name are required");

    try {
      const payload: BootstrapUniversityPayload = {
        name: form.name,
        subdomain: form.subdomain.toLowerCase().replace(/\s+/g, "-"),
        schoolAdminEmail: form.schoolAdminEmail,
        adminFirstName: form.adminFirstName,
        adminLastName: form.adminLastName,
      };
      if (form.logoUrl) payload.logoUrl = form.logoUrl;
      if (form.address) payload.address = form.address;

      const res = await bootstrapUniversity(payload).unwrap();
      setResult(res);
      toast.success("University bootstrapped successfully!");
    } catch (e: any) {
      toast.error(
        e?.data?.message || e?.message || "Failed to bootstrap university",
      );
    }
  };

  const copyPassword = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.admin.temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Password copied to clipboard");
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-none">
                Bootstrap University
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Provision a new institution on ParaLearn
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
              {/* Success banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
                <div className="flex items-center gap-3 relative">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-bold text-sm">
                      University created!
                    </p>
                    <p className="text-emerald-600 text-xs mt-0.5">
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details card */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Institution
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-bold text-slate-900 text-base">
                    {result.university.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-mono">
                      {result.university.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-sm text-purple-600 font-bold font-mono">
                      {result.university.subdomain}.pln.ng
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 px-4 py-2.5 border-t border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Admin Account
                  </p>
                </div>
                <div className="p-4 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm text-slate-700 font-semibold">
                    {result.admin.email}
                  </span>
                </div>
              </div>

              {/* Temporary password */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100/60 border-b border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <p className="text-amber-700 text-xs font-bold uppercase tracking-wider">
                    Temporary Password — shown once
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="font-mono text-xl font-black text-amber-900 tracking-widest select-all break-all">
                      {result.admin.temporaryPassword}
                    </p>
                    <button
                      onClick={copyPassword}
                      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-900 rounded-xl text-xs font-bold transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-amber-600/80 text-xs leading-relaxed">
                    Share this securely with the school admin. It is never
                    stored in plain text and will not be shown again.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 active:scale-[.99] text-white font-bold shadow-lg shadow-purple-200 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            // ── Form State ─────────────────────────────────────────────────
            <div className="space-y-6">

              {/* University Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">
                    University Details
                  </h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                      University Name <span className="text-red-400 normal-case">*</span>
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Rivers State University"
                      className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {/* Subdomain with live preview */}
                  <div>
                    <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                      Subdomain <span className="text-red-400 normal-case">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Link2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <Input
                        value={form.subdomain}
                        onChange={(e) =>
                          set(
                            "subdomain",
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }
                        placeholder="rsu"
                        className="h-11 rounded-xl pl-10 pr-24 font-mono border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-purple-400 pointer-events-none">
                        .pln.ng
                      </span>
                    </div>
                    {form.subdomain && (
                      <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg">
                        <Globe className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-600 font-mono font-semibold">
                          {form.subdomain}.pln.ng
                        </span>
                        <span className="text-xs text-purple-400 ml-auto">
                          Live URL preview
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Address
                      </Label>
                      <div className="relative mt-1.5">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        <Input
                          value={form.address}
                          onChange={(e) => set("address", e.target.value)}
                          placeholder="City, State"
                          className="h-11 rounded-xl pl-10 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Logo URL
                      </Label>
                      <Input
                        value={form.logoUrl}
                        onChange={(e) => set("logoUrl", e.target.value)}
                        placeholder="https://..."
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
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
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserCircle className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">
                    School Admin Account
                  </h3>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                      Admin Email <span className="text-red-400 normal-case">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <Input
                        type="email"
                        value={form.schoolAdminEmail}
                        onChange={(e) =>
                          set("schoolAdminEmail", e.target.value)
                        }
                        placeholder="admin@rsu.edu.ng"
                        className="h-11 rounded-xl pl-10 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        First Name <span className="text-red-400 normal-case">*</span>
                      </Label>
                      <Input
                        value={form.adminFirstName}
                        onChange={(e) => set("adminFirstName", e.target.value)}
                        placeholder="John"
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-xs font-bold uppercase tracking-wide">
                        Last Name <span className="text-red-400 normal-case">*</span>
                      </Label>
                      <Input
                        value={form.adminLastName}
                        onChange={(e) => set("adminLastName", e.target.value)}
                        placeholder="Doe"
                        className="mt-1.5 h-11 rounded-xl border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-blue-700 text-xs leading-relaxed">
                  A secure temporary password is generated automatically and
                  displayed <strong>once</strong> after success. Keep the dialog
                  open to copy it.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 active:scale-[.99] text-white font-bold shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating university…
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    Bootstrap University
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

  const { data: universities, isLoading, isError, refetch } =
    useListUniversitiesQuery();

  const totalUsers = universities
    ? universities.reduce((acc, u) => acc + (u._count?.users ?? 0), 0)
    : 0;
  const activeCount = universities?.filter((u) => u.isActive).length ?? 0;

  const handleLockOut = () => {
    dispatch(clearSuperAdminKey());
    toast("Session ended. Key cleared from memory.");
  };

  return (
    <div className="min-h-screen bg-[#0a0614] relative overflow-x-hidden">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-purple-500/30 blur-lg" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/50">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  ParaLearn
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                University management console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowModal(true)}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New University
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

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Universities",
              value: universities?.length ?? "—",
              sub: "Registered institutions",
              icon: Building2,
              gradient: "from-purple-500/20 to-violet-600/10",
              border: "border-purple-500/20",
              color: "text-purple-400",
              iconBg: "bg-purple-500/20",
            },
            {
              label: "Active",
              value: activeCount,
              sub: "Currently live",
              icon: CheckCircle2,
              gradient: "from-emerald-500/20 to-teal-600/10",
              border: "border-emerald-500/20",
              color: "text-emerald-400",
              iconBg: "bg-emerald-500/20",
            },
            {
              label: "Total Users",
              value: isLoading ? "—" : totalUsers,
              sub: "Across all institutions",
              icon: Users,
              gradient: "from-blue-500/20 to-indigo-600/10",
              border: "border-blue-500/20",
              color: "text-blue-400",
              iconBg: "bg-blue-500/20",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-5 backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    {s.label}
                  </p>
                  <p className={`text-4xl font-black mt-2 ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-slate-600 text-xs mt-1">{s.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Universities Table ── */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <div>
              <h2 className="text-white font-bold">All Universities</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {universities?.length ?? 0} institution
                {(universities?.length ?? 0) !== 1 ? "s" : ""} registered
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="h-8 px-3 rounded-lg flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* States */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading universities…</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-red-300 font-bold">Failed to load</p>
                <p className="text-slate-500 text-sm mt-1">
                  Check your Super Admin Key (403 = wrong key)
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="h-9 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          ) : !universities || universities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-slate-400 font-semibold">
                  No universities yet
                </p>
                <p className="text-slate-600 text-sm mt-1">
                  Click &quot;New University&quot; to bootstrap the first one.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 h-10 px-5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Bootstrap first university
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["University", "Subdomain", "Status", "Users", "Created"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {universities.map((uni, idx) => (
                    <tr
                      key={uni.id}
                      className={`border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors group ${
                        idx === universities.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      {/* University */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-600/20 flex items-center justify-center border border-purple-400/20 shrink-0">
                            <GraduationCap className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-purple-200 transition-colors">
                              {uni.name}
                            </p>
                            <p className="text-[11px] text-slate-600 font-mono mt-0.5 truncate max-w-[200px]">
                              {uni.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Subdomain */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-400/20 rounded-lg px-2.5 py-1.5 w-fit">
                          <Globe className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="text-purple-300 font-mono text-xs font-semibold">
                            {uni.subdomain}.pln.ng
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            uni.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              uni.isActive
                                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                : "bg-red-400"
                            }`}
                          />
                          {uni.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Users */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="text-slate-300 font-semibold">
                            {uni._count?.users ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(uni.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-8">
          ParaLearn Super Admin · University Management Console
        </p>
      </div>

      {showModal && <BootstrapModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const apiKey = useSelector((s: RootState) => s.superAdmin?.apiKey);

  if (!apiKey) return <LockScreen />;
  return <Dashboard />;
}
