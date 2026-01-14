import { Users, FileText, Settings, LayoutDashboard, GraduationCap, Upload } from "lucide-react";
import Logo from "./Logo";

const DashboardPreview = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Users, label: "Users" },
    { icon: GraduationCap, label: "Report Cards" },
    { icon: Upload, label: "Bulk Upload" },
    { icon: Users, label: "Profile" },
    { icon: Settings, label: "Settings" },
  ];

  const stats = [
    { label: "Students", value: "500", color: "bg-hero/20 text-hero" },
    { label: "Teachers", value: "125", color: "bg-green-100 text-green-600" },
    { label: "Assessments", value: "29", color: "bg-amber-100 text-amber-600" },
  ];

  const events = [
    { title: "All Hands", time: "10:00am", color: "bg-hero" },
    { title: "Interview", time: "11:30am", color: "bg-green-500" },
    { title: "Quarterly Review", time: "2:00pm", color: "bg-amber-500" },
    { title: "SIS Webinar", time: "4:00pm", color: "bg-blue-500" },
  ];

  return (
    <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
      {/* Dashboard Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Logo size="sm" />
        </div>
        
        <div className="flex">
          {/* Sidebar */}
          <div className="w-32 bg-gray-50 border-r border-gray-100 py-3">
            {sidebarItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-2 text-xs ${
                  item.active
                    ? "text-hero bg-hero/10 border-r-2 border-hero"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-3 h-3" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4">
            <p className="text-xs text-gray-600 mb-3">Good morning Admin!</p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className={`${stat.color} rounded-lg p-2 text-center`}>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-[10px] opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Events */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-800 mb-2">Upcoming Events</h4>
              <div className="space-y-1.5">
                {events.map((event, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${event.color}`} />
                    <span className="text-[10px] text-gray-700">{event.title}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{event.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Cards Preview */}
            <div>
              <h4 className="text-xs font-semibold text-gray-800 mb-2">Report Cards</h4>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="grid grid-cols-4 gap-1 text-[8px] text-gray-500 mb-1">
                  <span>S.N</span>
                  <span>Name</span>
                  <span>Class</span>
                  <span>Status</span>
                </div>
                {[1, 2, 3].map((row) => (
                  <div key={row} className="grid grid-cols-4 gap-1 text-[8px] text-gray-700 py-1 border-t border-gray-200">
                    <span>{row}</span>
                    <span>Student {row}</span>
                    <span>Grade {row + 5}</span>
                    <span className="text-green-600">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
