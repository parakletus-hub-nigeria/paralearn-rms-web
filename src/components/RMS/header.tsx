import Image from "next/image"

export const Header = ({schoolLogo} : {schoolLogo :string}) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="flex flex-row items-center justify-between px-4 lg:px-0 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {getGreeting()}, Admin!
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Welcome back to your dashboard
                </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-slate-100 border border-slate-200 shadow-sm overflow-hidden">
                <Image
                    src={schoolLogo}
                    alt="School Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain p-1"
                />
            </div>
        </div>
    )
}
