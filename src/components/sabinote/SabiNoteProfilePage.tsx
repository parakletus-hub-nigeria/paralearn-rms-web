"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchStandaloneProfile, updateStandaloneProfile } from "@/reduxToolKit/sabiStandaloneAuth/sabiStandaloneAuthThunks";
import { standaloneLogout } from "@/reduxToolKit/sabiStandaloneAuth/sabiStandaloneAuthThunks";
import { LessonGeneratorWallet } from "@/components/RMS/LessonGenerator/LessonGeneratorWallet";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import { toast } from "sonner";
import { User, School, LogOut, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SabiNoteProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, loading } = useSelector((s: RootState) => s.sabiStandaloneAuth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", schoolName: "" });

  useEffect(() => {
    dispatch(fetchStandaloneProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) setForm({ name: user.name ?? "", schoolName: user.schoolName ?? "" });
  }, [user]);

  const handleSave = async () => {
    const result = await dispatch(updateStandaloneProfile(form));
    if (updateStandaloneProfile.fulfilled.match(result)) {
      toast.success("Profile updated!");
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(standaloneLogout());
    router.push(routespath.SABINOTE_LOGIN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30">
      {/* Minimal header */}
      <header className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">SabiNote</span>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(routespath.SABINOTE_DASHBOARD)}
              className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors">Dashboard</button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 transition-colors">
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              {[
                { label: "Full Name", field: "name", icon: User },
                { label: "School Name", field: "schoolName", icon: School },
              ].map(({ label, field, icon: Icon }) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                  <div className="relative group">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={(form as any)[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium" />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">Cancel</button>
                <Button onClick={handleSave} disabled={loading}
                  className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Name", value: user?.name },
                { label: "Role", value: user?.role || "—" },
                { label: "School", value: user?.schoolName || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-medium text-slate-900 capitalize">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wallet — reuse existing component */}
        <LessonGeneratorWallet />
      </main>
    </div>
  );
}
