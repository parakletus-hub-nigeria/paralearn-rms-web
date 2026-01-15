import DashboardPreview from "./DashboardPreview";

const ManagementSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest">
              Institutional Power
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight animate-fade-in">
              Admissions, Staff <br />
              <span className="text-hero italic">& Student Management</span>
            </h2>
            <p
              className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in font-medium"
              style={{ animationDelay: "0.1s" }}
            >
              Simple and secure control of your organization's financial and
              legal transactions. Send customized invoices and contracts with absolute confidence.
            </p>
            <div className="pt-4">
               <button className="group flex items-center gap-3 text-primary font-bold text-xl hover:gap-5 transition-all">
                  Manage everything
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                     <svg className="w-5 h-5 text-primary group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                     </svg>
                  </div>
               </button>
            </div>
          </div>

          {/* Right Dashboard Preview */}
          <div
            className="flex-1 w-full lg:max-w-[600px] animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
               <div className="relative transform group-hover:scale-[1.02] group-hover:-rotate-1 transition-all duration-700">
                  <DashboardPreview />
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default ManagementSection;
