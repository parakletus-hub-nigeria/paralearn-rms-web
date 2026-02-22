"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { Header } from "@/components/RMS/header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Upload, School, Palette } from "lucide-react";
import Image from "next/image";
import { updateSchoolBranding, getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Label } from "@/components/ui/label";

export default function BrandingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tenantInfo, loading } = useSelector((s: RootState) => s.user);
  
  const [formData, setFormData] = useState({
    schoolName: "",
    motto: "",
    address: "",
    phoneNumber: "",
    website: "",
    logoUrl: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    dispatch(getTenantInfo());
  }, [dispatch]);

  useEffect(() => {
    if (tenantInfo) {
      setFormData({
        schoolName: tenantInfo.name || "",
        motto: tenantInfo.motto || "",
        address: tenantInfo.address || "",
        phoneNumber: tenantInfo.phoneNumber || "",
        website: tenantInfo.website || "",
        logoUrl: tenantInfo.logoUrl || "",
        primaryColor: tenantInfo.primaryColor || "",
        secondaryColor: tenantInfo.secondaryColor || "",
        accentColor: tenantInfo.accentColor || "",
      });
      if (tenantInfo.logoUrl) {
        setLogoPreview(tenantInfo.logoUrl);
      }
    }
  }, [tenantInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: any = {
        schoolName: formData.schoolName,
        motto: formData.motto,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        website: formData.website,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
      };

      if (logoPreview && logoPreview.startsWith("data:")) {
          payload.logoUrl = logoPreview;
      }

      await dispatch(updateSchoolBranding(payload)).unwrap();
      toast.success("School branding updated successfully");
      dispatch(getTenantInfo()); // Refresh data
    } catch (e: any) {
      toast.error(e || "Failed to update branding");
    }
  };

  return (
    <div className="w-full">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      <section className="mb-10 text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">School Branding</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Customize your school's identity, logo, and colors.
        </p>
      </section>

      <Card className="p-6 md:p-8 rounded-2xl border-slate-100 bg-white shadow-sm max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-purple-600" />
                School Information
            </h3>
            <div className="space-y-4">
                <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="e.g. Bright Future Academy"
                    className="bg-white"
                />
                </div>
                <div className="space-y-2">
                <Label>Motto</Label>
                <Input
                    name="motto"
                    value={formData.motto}
                    onChange={handleInputChange}
                    placeholder="e.g. Knowledge is Power"
                    className="bg-white"
                />
                </div>
                <div className="space-y-2">
                <Label>Address</Label>
                <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="School Address"
                    className="bg-white"
                />
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+234..."
                    className="bg-white"
                />
                </div>
                <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="bg-white"
                    />
                </div>
                </div>
            </div>
            </div>

            <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Branding & Logo
            </h3>
            
            <div className="mb-6">
                <Label className="mb-2 block">School Logo</Label>
                <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white overflow-hidden relative">
                    {logoPreview ? (
                    <Image src={logoPreview} alt="Logo Preview" fill className="object-contain p-2" />
                    ) : (
                    <Upload className="w-8 h-8 text-slate-300" />
                    )}
                </div>
                <div className="flex-1">
                    <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="bg-white cursor-pointer"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                    Recommended: Square image, PNG or JPG (max 2MB)
                    </p>
                </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                        <Input
                        type="color"
                        name="primaryColor"
                        value={formData.primaryColor || "#641BC4"}
                        onChange={handleInputChange}
                        className="w-12 h-10 p-1 bg-white"
                        />
                        <Input
                        name="primaryColor"
                        value={formData.primaryColor}
                        onChange={handleInputChange}
                        placeholder="#641BC4"
                        className="bg-white"
                        />
                    </div>
                    </div>
                    <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                        <Input
                        type="color"
                        name="secondaryColor"
                        value={formData.secondaryColor || "#8538E0"}
                        onChange={handleInputChange}
                        className="w-12 h-10 p-1 bg-white"
                        />
                        <Input
                        name="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={handleInputChange}
                        placeholder="#8538E0"
                        className="bg-white"
                        />
                    </div>
                    </div>
                    <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                        <Input
                        type="color"
                        name="accentColor"
                        value={formData.accentColor || "#F28C1F"}
                        onChange={handleInputChange}
                        className="w-12 h-10 p-1 bg-white"
                        />
                        <Input
                        name="accentColor"
                        value={formData.accentColor}
                        onChange={handleInputChange}
                        placeholder="#F28C1F"
                        className="bg-white"
                        />
                    </div>
                    </div>
                </div>
            </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end pt-6 border-t border-slate-200">
            <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 px-8 rounded-xl"
            >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Branding"}
            </Button>
        </div>
        </Card>
    </div>
  );
}
