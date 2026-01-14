const ToolsSection = () => {
  return (
    <section className="min-h-[600px] py-20 px-4 md:min-h-[700px]">
      <div className="px-6 md:px-12 container mx-auto py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          <div className="flex-1 space-y-6 max-w-lg order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight text-foreground">
              <span className="text-primary">Tools</span> For Teachers And
              Learners
            </h2>
            <p className="text-foreground/80 text-base md:text-lg leading-relaxed">
              Class offers a dynamic suite of teaching tools designed for
              real-time use during lessons. Educators can distribute assignments
              instantly, allowing students to complete and submit them
              seamlessly within the platform.
            </p>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end w-full order-1 lg:order-2">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="relative">
                <div className="absolute -bottom-2 left-4 right-0 h-4 bg-primary rounded-full"></div>
                <div
                  className="relative overflow-hidden rounded-[40px] rounded-tl-[80px] shadow-2xl"
                  style={{
                    borderRadius: "80px 40px 40px 40px",
                  }}
                >
                  <img
                    // src={studentImage}
                    alt="Student with books"
                    className="w-full h-[300px] md:h-[380px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
