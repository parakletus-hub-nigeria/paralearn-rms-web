import DashboardPreview from "./DashboardPreview";

const ManagementSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-gradient-to-r from-hero/10 via-primary/5 to-hero/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground animate-fade-in">
              Admissions, Staff & Student Management
            </h2>
            <p className="text-foreground/70 font-body text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Simple and secure control of your organization's financial and legal transactions. Send customized invoices and contracts
            </p>
          </div>

          {/* Right Dashboard Preview */}
          <div className="flex-1 flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManagementSection;
