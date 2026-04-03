"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { Header } from "@/components/RMS/header";
import { ComingSoon } from "@/components/common/ComingSoon";

export const SettingsPage = () => {
  const { tenantInfo } = useSelector((state: RootState) => state.user);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />
      <div className="flex-1 relative">
        <ComingSoon featureName="Settings" />
      </div>
    </div>
  );
};
