import Image from "next/image"
import { useSelector } from "react-redux"
import { RootState } from "@/reduxToolKit/store"

export const Header = ({ schoolLogo, schoolName, showGreeting = false }: { schoolLogo?: string; schoolName?: string; showGreeting?: boolean }) => {
    const { user } = useSelector((s: RootState) => s.user);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good morning";
        if (hour >= 12 && hour < 17) return "Good afternoon";
        if (hour >= 17 && hour < 21) return "Good evening";
        return "Good evening";
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 animate-load-fade-in pt-4 md:pt-0 gap-4 md:gap-0">
            <div className="text-center md:text-left order-2 md:order-1">
                {showGreeting && (
                    <>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-coolvetica tracking-tight leading-tight">
                            {getGreeting()}, <span className="text-[#641BC4]">{user?.firstName || "there"}!</span>
                        </h1>
                        <p className="text-[11px] sm:text-sm font-medium text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-1.5 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0" />
                            Welcome back to your dashboard
                        </p>
                    </>
                )}
            </div>
            <div className="relative group/logo order-1 md:order-2">
                <div className="absolute -inset-2 bg-gradient-to-br from-[#641BC4] to-[#8538E0] rounded-2xl blur-lg opacity-0 group-hover/logo:opacity-20 transition-opacity duration-500" />
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative z-10 p-2 group-hover/logo:border-purple-200 transition-colors duration-500">
                    {schoolLogo ? (
                        <Image
                            src={schoolLogo}
                            alt="School Logo"
                            width={64}
                            height={64}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover/logo:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-700 font-bold text-xl">
                            {getInitials(schoolName || "PL")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
