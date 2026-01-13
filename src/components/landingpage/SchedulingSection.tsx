import MobilePreview from "./MobilePreview";

const SchedulingSection = () => {
  const studentsData = [
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 East", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
  ];

  const teachersData = [
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
  ];

  return (
    <section className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left - Mobile Previews */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="relative flex items-start gap-4">
              {/* Students Phone */}
              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <MobilePreview
                  title="Students"
                  count={58}
                  data={studentsData}
                  variant="students"
                />
              </div>

              {/* Teachers Phone - offset */}
              <div
                className="mt-8 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <MobilePreview
                  title="Teachers"
                  count={30}
                  data={teachersData}
                  variant="teachers"
                />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 text-center lg:text-right">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
              <span className="text-hero">Easy Scheduling &</span>
              <br />
              <span className="text-primary">Attendance Tracking</span>
            </h2>
            <p
              className="text-foreground/70 font-body text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:ml-auto lg:mr-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Schedule and reserve classrooms at one campus or multiple
              campuses. Keep detailed records of student attendance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchedulingSection;
