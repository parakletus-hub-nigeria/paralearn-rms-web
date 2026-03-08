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
import { ProductTour } from "@/components/common/ProductTour";

const brandingTourSteps = [
  {
    target: '.branding-school-info',
    content: "Update your school's name, motto, address, and contact details here. This information appears on report card headers and school-wide communications.",
    disableBeacon: true,
  },
  {
    target: '.branding-logo-upload',
    content: "Upload your school's official logo here. It will appear across the platform in the sidebar, report cards, and PDFs — making every document look professional.",
  },
  {
    target: '.branding-save-btn',
    content: "Once you've finished making changes, click 'Save Branding' to apply them instantly across the entire platform for all users.",
  },
];

import { ComingSoon } from "@/components/common/ComingSoon";

export default function BrandingPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);

  return (
    <div className="w-full">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />
      <ComingSoon featureName="School Branding" />
    </div>
  );
}
