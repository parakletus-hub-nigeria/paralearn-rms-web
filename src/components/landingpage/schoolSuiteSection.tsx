const SchoolSuiteSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
          <span className="text-hero">All-In-One</span>{" "}
          <span className="text-primary">School Suite</span>
        </h2>
        <p
          className="text-foreground/80 font-body text-base md:text-lg leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          From managing online courses to tracking student progress and boosting
          engagement, Paralearn LMS equips educators and institutions with all
          the tools they need in one powerful, easy-to-use platform.
        </p>
      </div>
    </section>
  );
};

export default SchoolSuiteSection;
