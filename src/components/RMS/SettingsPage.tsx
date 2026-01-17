"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { getTenantInfo, updateSchoolBranding } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Settings, Save, Palette, Building2 } from "lucide-react";

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
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />
      
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-[#641BC4]" />
          <h1 className="text-3xl font-bold text-gray-900">School Settings</h1>
        </div>

        {loading && !tenantInfo ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* School Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#641BC4]" />
                  <CardTitle>School Information</CardTitle>
                </div>
                <CardDescription>
                  View your school's basic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tenantInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-gray-500">School Name</Label>
                      <p className="text-lg font-semibold mt-1">{tenantInfo.name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Subdomain</Label>
                      <p className="text-lg font-semibold mt-1">{tenantInfo.subdomain || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Address</Label>
                      <p className="text-lg font-semibold mt-1">{tenantInfo.address || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Phone Number</Label>
                      <p className="text-lg font-semibold mt-1">{tenantInfo.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Website</Label>
                      <p className="text-lg font-semibold mt-1">
                        {tenantInfo.website ? (
                          <a
                            href={tenantInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#641BC4] hover:underline"
                          >
                            {tenantInfo.website}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                    {tenantInfo.settings && (
                      <>
                        <div>
                          <Label className="text-sm text-gray-500">Timezone</Label>
                          <p className="text-lg font-semibold mt-1">
                            {tenantInfo.settings.timezone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Grading Scale</Label>
                          <p className="text-lg font-semibold mt-1">
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
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#641BC4]" />
                  <CardTitle>School Branding</CardTitle>
                </div>
                <CardDescription>
                  Customize your school's colors, logo, and motto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBrandingUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={brandingData.logoUrl}
                      onChange={(e) =>
                        setBrandingData({ ...brandingData, logoUrl: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                    />
                    {brandingData.logoUrl && (
                      <div className="mt-2">
                        <img
                          src={brandingData.logoUrl}
                          alt="School logo preview"
                          className="h-20 w-auto object-contain border rounded p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motto">School Motto</Label>
                    <Input
                      id="motto"
                      value={brandingData.motto}
                      onChange={(e) =>
                        setBrandingData({ ...brandingData, motto: e.target.value })
                      }
                      placeholder="Enter your school motto"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={brandingData.primaryColor}
                          onChange={(e) =>
                            setBrandingData({ ...brandingData, primaryColor: e.target.value })
                          }
                          className="w-20 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={brandingData.primaryColor}
                          onChange={(e) =>
                            setBrandingData({ ...brandingData, primaryColor: e.target.value })
                          }
                          placeholder="#641BC4"
                          className="flex-1"
                        />
                      </div>
                      <div
                        className="h-12 rounded-md border"
                        style={{ backgroundColor: brandingData.primaryColor }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={brandingData.secondaryColor}
                          onChange={(e) =>
                            setBrandingData({ ...brandingData, secondaryColor: e.target.value })
                          }
                          className="w-20 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={brandingData.secondaryColor}
                          onChange={(e) =>
                            setBrandingData({ ...brandingData, secondaryColor: e.target.value })
                          }
                          placeholder="#9747FF"
                          className="flex-1"
                        />
                      </div>
                      <div
                        className="h-12 rounded-md border"
                        style={{ backgroundColor: brandingData.secondaryColor }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={brandingData.accentColor}
                          onChange={(e) =>
                            setBrandingData({ ...brandingData, accentColor: e.target.value })
                          }
                          className="w-20 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={brandingData.accentColor}
                          onChange={(e) =>
                            setBrandingData({ ...brandingData, accentColor: e.target.value })
                          }
                          placeholder="#AD8ED6"
                          className="flex-1"
                        />
                      </div>
                      <div
                        className="h-12 rounded-md border"
                        style={{ backgroundColor: brandingData.accentColor }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#641BC4] hover:bg-[#5a16b0]"
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
