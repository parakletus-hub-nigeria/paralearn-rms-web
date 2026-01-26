"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { getTenantInfo, updateSchoolBranding } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Settings, Save, Palette, Building2, Globe, Phone, MapPin, Link as LinkIcon } from "lucide-react";
import logo from "../../../public/mainLogo.svg";

export const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tenantInfo, loading, error, success } = useSelector(
    (state: RootState) => state.user
  );

  const [brandingData, setBrandingData] = useState({
    logoUrl: "",
    primaryColor: "#641BC4",
    secondaryColor: "#9747FF",
    accentColor: "#AD8ED6",
    motto: "",
  });

  useEffect(() => {
    dispatch(getTenantInfo());
  }, [dispatch]);

  useEffect(() => {
    if (tenantInfo) {
      setBrandingData({
        logoUrl: tenantInfo.logoUrl || "",
        primaryColor: tenantInfo.primaryColor || "#641BC4",
        secondaryColor: tenantInfo.secondaryColor || "#9747FF",
        accentColor: tenantInfo.accentColor || "#AD8ED6",
        motto: tenantInfo.motto || "",
      });
    }
  }, [tenantInfo]);

  useEffect(() => {
    if (success) {
      toast.success("Settings updated successfully!");
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  const handleBrandingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(updateSchoolBranding(brandingData)).unwrap();
      // Refresh tenant info
      dispatch(getTenantInfo());
    } catch (error: any) {
      toast.error(error || "Failed to update settings");
    }
  };

  return (
    <div className="w-full min-h-screen pb-8">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#641BC4] to-[#8538E0] flex items-center justify-center shadow-md">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              School Settings
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 ml-13 sm:ml-14">
            Manage your school information and branding
          </p>
        </div>

        {loading && !tenantInfo ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <Image
                src={logo}
                alt="Loading"
                width={80}
                height={80}
                className="animate-pulse drop-shadow-lg"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* School Information Card */}
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#641BC4] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                      School Information
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-600 mt-1">
                      View your school basic information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {tenantInfo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        School Name
                      </Label>
                      <p className="text-base sm:text-lg font-bold text-slate-900">
                        {tenantInfo.name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <LinkIcon className="w-3 h-3" />
                        Subdomain
                      </Label>
                      <p className="text-base sm:text-lg font-bold text-slate-900">
                        {tenantInfo.subdomain || "N/A"}
                        {tenantInfo.subdomain && (
                          <span className="text-sm text-slate-500 font-normal ml-2">.pln.ng</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Address
                      </Label>
                      <p className="text-base sm:text-lg font-bold text-slate-900">
                        {tenantInfo.address || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        Phone Number
                      </Label>
                      <p className="text-base sm:text-lg font-bold text-slate-900">
                        {tenantInfo.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-slate-50/50 border border-slate-200 sm:col-span-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        Website
                      </Label>
                      <p className="text-base sm:text-lg font-bold text-slate-900">
                        {tenantInfo.website ? (
                          <a
                            href={tenantInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#641BC4] hover:text-[#8538E0] hover:underline flex items-center gap-2"
                          >
                            {tenantInfo.website}
                            <LinkIcon className="w-4 h-4" />
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                    {tenantInfo.settings && (
                      <>
                        <div className="space-y-2 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Timezone
                          </Label>
                          <p className="text-base sm:text-lg font-bold text-slate-900">
                            {tenantInfo.settings.timezone || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-2 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Grading Scale
                          </Label>
                          <p className="text-base sm:text-lg font-bold text-slate-900">
                            {tenantInfo.settings.gradingScale || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branding Card */}
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#641BC4] flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                      School Branding
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-600 mt-1">
                      Customize your school colors, logo, and motto
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleBrandingUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Logo URL
                    </Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={brandingData.logoUrl}
                      onChange={(e) =>
                        setBrandingData({ ...brandingData, logoUrl: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                      className="h-11 bg-slate-50/50 focus:bg-white border-slate-300"
                    />
                    {brandingData.logoUrl && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 mb-2">Logo Preview:</p>
                        <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-slate-200">
                          <img
                            src={brandingData.logoUrl}
                            alt="School logo preview"
                            className="max-h-24 w-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motto" className="text-sm font-semibold text-slate-700">
                      School Motto
                    </Label>
                    <Input
                      id="motto"
                      value={brandingData.motto}
                      onChange={(e) =>
                        setBrandingData({ ...brandingData, motto: e.target.value })
                      }
                      placeholder="Enter your school motto"
                      className="h-11 bg-slate-50/50 focus:bg-white border-slate-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-slate-700">
                      Color Scheme
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                        <Label htmlFor="primaryColor" className="text-xs font-semibold text-slate-600">
                          Primary Color
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={brandingData.primaryColor}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, primaryColor: e.target.value })
                            }
                            className="w-16 h-11 p-1 cursor-pointer rounded-lg border-2 border-slate-300"
                          />
                          <Input
                            type="text"
                            value={brandingData.primaryColor}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, primaryColor: e.target.value })
                            }
                            placeholder="#641BC4"
                            className="flex-1 h-11 bg-white border-slate-300"
                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                          />
                        </div>
                        <div
                          className="h-16 rounded-lg border-2 border-slate-300 shadow-sm transition-all"
                          style={{ backgroundColor: brandingData.primaryColor }}
                        />
                      </div>

                      <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                        <Label htmlFor="secondaryColor" className="text-xs font-semibold text-slate-600">
                          Secondary Color
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={brandingData.secondaryColor}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, secondaryColor: e.target.value })
                            }
                            className="w-16 h-11 p-1 cursor-pointer rounded-lg border-2 border-slate-300"
                          />
                          <Input
                            type="text"
                            value={brandingData.secondaryColor}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, secondaryColor: e.target.value })
                            }
                            placeholder="#9747FF"
                            className="flex-1 h-11 bg-white border-slate-300"
                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                          />
                        </div>
                        <div
                          className="h-16 rounded-lg border-2 border-slate-300 shadow-sm transition-all"
                          style={{ backgroundColor: brandingData.secondaryColor }}
                        />
                      </div>

                      <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 border border-slate-200 sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="accentColor" className="text-xs font-semibold text-slate-600">
                          Accent Color
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="accentColor"
                            type="color"
                            value={brandingData.accentColor}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, accentColor: e.target.value })
                            }
                            className="w-16 h-11 p-1 cursor-pointer rounded-lg border-2 border-slate-300"
                          />
                          <Input
                            type="text"
                            value={brandingData.accentColor}
                            onChange={(e) =>
                              setBrandingData({ ...brandingData, accentColor: e.target.value })
                            }
                            placeholder="#AD8ED6"
                            className="flex-1 h-11 bg-white border-slate-300"
                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                          />
                        </div>
                        <div
                          className="h-16 rounded-lg border-2 border-slate-300 shadow-sm transition-all"
                          style={{ backgroundColor: brandingData.accentColor }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7] text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : "Save Branding"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
