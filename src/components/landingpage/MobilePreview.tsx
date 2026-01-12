import { Search } from "lucide-react";
import Logo from "./Logo";

interface MobilePreviewProps {
  title: string;
  count: number;
  data: Array<{ id: string; name: string; class?: string; date?: string; email?: string }>;
  variant?: "students" | "teachers";
}

const MobilePreview = ({ title, count, data, variant = "students" }: MobilePreviewProps) => {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-2 w-52 border border-gray-200">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-1 text-[10px] text-gray-600">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 border border-gray-400 rounded-sm">
              <div className="w-2 h-1 bg-gray-400 rounded-sm m-0.5" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <div className="scale-75 origin-right">
            <Logo size="sm" />
          </div>
        </div>

        {/* Stats Card */}
        <div className="mx-3 mb-2 bg-hero/10 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-600">{title}</p>
              <p className="text-lg font-bold text-hero">{count}</p>
            </div>
            <div className="w-6 h-6 bg-hero/20 rounded-full flex items-center justify-center">
              <span className="text-hero text-xs">👤</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mx-3 mb-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1.5">
            <Search className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] text-gray-400">Search</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="mx-3 grid grid-cols-4 gap-1 text-[8px] text-gray-500 mb-1 px-1">
          <span>ID</span>
          <span>Name</span>
          <span>{variant === "students" ? "Class" : "Email"}</span>
          <span>{variant === "students" ? "DOB" : "Contact"}</span>
        </div>

        {/* Table Rows */}
        <div className="mx-3 bg-gray-50 rounded-lg overflow-hidden">
          {data.slice(0, 5).map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-1 text-[7px] text-gray-700 py-1.5 px-1 border-b border-gray-100 last:border-0"
            >
              <span className="text-hero font-medium">{row.id}</span>
              <span className="truncate">{row.name}</span>
              <span className="truncate">{variant === "students" ? row.class : row.email}</span>
              <span className="truncate">{row.date}</span>
            </div>
          ))}
        </div>

        {/* Bottom indicator */}
        <div className="flex justify-center py-2">
          <div className="w-20 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default MobilePreview;
