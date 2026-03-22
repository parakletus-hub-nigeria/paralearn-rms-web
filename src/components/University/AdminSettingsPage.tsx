"use client";

import { Header } from "@/components/RMS/header";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { Building2, Globe, Image as ImageIcon, Wrench } from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminSettingsPage() {
  const { tenantInfo, user } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const infoItems = [
    {
      icon: Building2,
      label: "University Name",
      value: tenantInfo?.name || "—",
    },
    {
      icon: Globe,
      label: "Subdomain",
      value: tenantInfo?.subdomain || tenantInfo?.slug || "—",
    },
    {
      icon: ImageIcon,
      label: "Logo URL",
      value: tenantInfo?.logoUrl || "—",
      isLogo: true,
    },
  ];

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="flex flex-col gap-6">
        {/* University Info Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col mb-6">
            <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
              University Settings
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              View your university information and branding details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {infoItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {item.label}
                  </p>
                  {item.isLogo && item.value && item.value !== "—" ? (
                    <div className="flex flex-col gap-2">
                      <img
                        src={item.value}
                        alt="University logo"
                        className="h-12 w-auto object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {item.value}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-800 font-semibold text-sm break-all">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Wrench className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Editable Settings
              </h2>
              <p className="text-slate-500 text-sm">
                Manage your university branding and configuration
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <Wrench
                className="h-8 w-8"
                style={{ color: `${primaryColor}80` }}
              />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-slate-400 text-sm text-center max-w-sm">
              Editable settings including university name, subdomain, and logo
              upload are being built and will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
