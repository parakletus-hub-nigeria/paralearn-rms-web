"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchGradingSystem,
  fetchGradingTemplates,
  fetchSchoolSettings,
  updateGradingSystem,
  updateSchoolSettings,
} from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { Header } from "@/components/RMS/header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Save } from "lucide-react";

export function AdminSchoolSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { schoolSettings, gradingSystem, gradingTemplates, loading, error, success } = useSelector(
    (s: RootState) => s.admin
  );

  const [settingsJson, setSettingsJson] = useState("");
  const [gradingJson, setGradingJson] = useState("");

  useEffect(() => {
    dispatch(fetchSchoolSettings());
    dispatch(fetchGradingSystem());
    dispatch(fetchGradingTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (schoolSettings && !settingsJson) setSettingsJson(JSON.stringify(schoolSettings, null, 2));
  }, [schoolSettings, settingsJson]);

  useEffect(() => {
    if (gradingSystem && !gradingJson) setGradingJson(JSON.stringify(gradingSystem, null, 2));
  }, [gradingSystem, gradingJson]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearAdminSuccess());
    }
  }, [error, success, dispatch]);

  const reload = () => {
    dispatch(fetchSchoolSettings());
    dispatch(fetchGradingSystem());
    dispatch(fetchGradingTemplates());
  };

  const saveSettings = async () => {
    try {
      const obj = settingsJson ? JSON.parse(settingsJson) : {};
      await dispatch(updateSchoolSettings(obj)).unwrap();
    } catch (e: any) {
      toast.error(e?.message || e || "Invalid JSON / Failed to update settings");
    }
  };

  const saveGrading = async () => {
    try {
      const obj = gradingJson ? JSON.parse(gradingJson) : {};
      await dispatch(updateGradingSystem(obj)).unwrap();
    } catch (e: any) {
      toast.error(e?.message || e || "Invalid JSON / Failed to update grading");
    }
  };

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      <section className="mb-10 text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">School Settings</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          Implements guide section 11: <span className="font-semibold">/school-settings</span> and grading endpoints.
        </p>
      </section>

      <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
        <div className="flex justify-end">
          <Button
            onClick={reload}
            variant="outline"
            className="h-11 rounded-xl border-slate-200"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload
          </Button>
        </div>

        <Tabs defaultValue="settings" className="mt-6">
          <TabsList className="grid grid-cols-3 md:w-[520px] rounded-xl">
            <TabsTrigger value="settings" className="rounded-lg">
              Settings
            </TabsTrigger>
            <TabsTrigger value="grading" className="rounded-lg">
              Grading
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg">
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <Card className="p-6 rounded-2xl border-slate-100 bg-slate-50">
              <p className="font-bold text-slate-900">GET /school-settings</p>
              <p className="text-sm text-slate-500 mt-1">
                Edit JSON and save via <span className="font-semibold">PUT /school-settings</span>.
              </p>
              <div className="mt-4">
                <Textarea
                  value={settingsJson}
                  onChange={(e) => setSettingsJson(e.target.value)}
                  className="min-h-[340px] rounded-xl font-mono text-xs"
                />
              </div>
              <Button
                onClick={saveSettings}
                disabled={loading}
                className="mt-4 bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="grading" className="mt-6">
            <Card className="p-6 rounded-2xl border-slate-100 bg-slate-50">
              <p className="font-bold text-slate-900">GET /school-settings/grading</p>
              <p className="text-sm text-slate-500 mt-1">
                Edit JSON and save via <span className="font-semibold">PUT /school-settings/grading</span>.
              </p>
              <div className="mt-4">
                <Textarea
                  value={gradingJson}
                  onChange={(e) => setGradingJson(e.target.value)}
                  className="min-h-[340px] rounded-xl font-mono text-xs"
                />
              </div>
              <Button
                onClick={saveGrading}
                disabled={loading}
                className="mt-4 bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Grading
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card className="p-6 rounded-2xl border-slate-100 bg-slate-50">
              <p className="font-bold text-slate-900">GET /school-settings/grading/templates</p>
              <p className="text-sm text-slate-500 mt-1">
                Read-only list of pre-defined grading systems.
              </p>
              <div className="mt-4 space-y-3">
                {(gradingTemplates || []).length === 0 ? (
                  <p className="text-sm text-slate-500">—</p>
                ) : (
                  (gradingTemplates || []).slice(0, 10).map((t: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="font-semibold text-slate-900">{t?.name || t?.title || `Template ${idx + 1}`}</p>
                      <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap">
                        {JSON.stringify(t, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

