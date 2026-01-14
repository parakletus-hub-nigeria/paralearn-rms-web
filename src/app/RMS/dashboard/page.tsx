import { Header } from "@/components/RMS/header";
import SideBar from "@/components/RMS/sideBar";
import { CircleIcon, Plus } from "lucide-react";
import { GraduationCap, Users, Book, BookImage } from "lucide-react";
import { BsAlarmFill } from "react-icons/bs";

const DashboardComponent = () => {
  const vv = [
    {
      title: "Students",
      icon: GraduationCap,
      figure: "students",
      bg_color: "#F0E5FF",
      icon_color: "#9747FF",
    },
    {
      title: "Teachers",
      icon: Users,
      figure: "teachers",
      bg_color: "#DFF9D8",
      icon_color: "#3AC13A",
    },
    {
      title: "Subjects",
      icon: Book,
      figure: "Subjects",
      bg_color: "#DBE9FF",
      icon_color: "#2A64F6",
    },
    {
      title: "Assessments",
      icon: BookImage,
      figure: "assessments",
      bg_color: "#FFE9CC",
      icon_color: "#F28C1F",
    },
  ];

  const upcomingExams = [
    {
      id: 1,
      subject: "Biology",
      studentCount: 28,
      questionCount: 50,
      date: "01/08/22",
      time: "08:00 am",
    },
    {
      id: 2,
      subject: "Mathematics",
      studentCount: 28,
      questionCount: 50,
      date: "01/08/22",
      time: "08:00 am",
    },
    {
      id: 3,
      subject: "English",
      studentCount: 28,
      questionCount: 50,
      date: "01/08/22",
      time: "08:00 am",
    },
  ];

  const tableData = [
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Draft",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Draft",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 North",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 East",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Draft",
    },
  ];

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      <div className="flex flex-col md:flex-row items-center justify-evenly gap-4 md:gap-0 px-[20px] md:px-0">
        {vv.map((items, index) => (
          <div
            key={index}
            className="py-[20px] md:py-[30px] px-[20px] flex flex-row items-center rounded-lg w-full md:w-[23%] space-x-4"
            style={{ backgroundColor: items.bg_color }}
          >
            <items.icon
              className="rounded-[50%] p-[10px] text-white size-[30px] md:size-[40px]"
              style={{ backgroundColor: items.icon_color }}
            />
            <div>
              <p className="font-semibold text-sm md:text-base">
                {items.title}
              </p>
              <p className="text-gray-600 text-xs md:text-sm">{items.figure}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[20px] flex flex-col md:flex-row gap-4 md:gap-[40px] md:justify-end mr-[20px] px-[20px] md:px-0">
        <button className="flex flex-row items-center justify-evenly bg-[#9747FF] p-[6px] space-x-1 text-white rounded-[6px] cursor-pointer hover:opacity-90">
          <Plus className="text-white" />
          <p className="text-white text-sm md:text-base">Add Student</p>
        </button>
        <button className="flex flex-row items-center justify-evenly bg-white p-[6px] space-x-1 text-white rounded-[6px] border-[1px] border-[#9747FF] cursor-pointer hover:opacity-90">
          <Plus className="text-black" />
          <p className="text-black text-sm md:text-base">Add Teacher</p>
        </button>
      </div>
      <div className="flex flex-col lg:flex-row mt-[25px] justify-between gap-8 lg:gap-0 px-[20px]  lg:px-0">
        <div className="w-full lg:w-[40%] h-auto lg:h-[450px] flex flex-col justify-evenly ">
          <p className="text-base md:text-lg font-semibold">Upcoming Exams</p>
          {upcomingExams.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center rounded-[12px] overflow-hidden h-[120px]  border-[1px] border-gray-400 shadow-xl shadow-gray-400 my-2 md:my-0"
            >
              <div className="w-full md:w-[15%] bg-[#641BC4] h-[80px] md:h-[200px]"></div>
              <div className="w-full md:w-[85%] p-2">
                <p className="font-semibold text-sm md:text-base">
                  {item.subject}
                </p>
                <div className="flex flex-col md:flex-row items-start md:items-center space-x-0 md:space-x-[10px] justify-between gap-2 md:gap-0">
                  <div>
                    <p className="font-semibold text-xs md:text-sm">
                      {item.studentCount} Students
                    </p>
                    <p className="font-semibold text-xs md:text-sm">
                      {item.questionCount} Questions
                    </p>
                  </div>
                  <button className="p-[6px] text-white rounded-[6px] bg-[#641BC4] px-[19px] cursor-pointer hover:opacity-90 text-xs md:text-sm">
                    view
                  </button>
                </div>
                <div className="flex space-x-2 items-center text-xs md:text-sm">
                  <BsAlarmFill />
                  <p>{item.date}</p>
                  <p>{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-[58%] mt-[15px]">
          <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
            <p className="text-base md:text-lg font-semibold">Report Cards</p>
            <button className="flex flex-row items-center justify-evenly bg-[#9747FF] p-[6px] space-x-1 text-white rounded-[6px] cursor-pointer hover:opacity-90 text-sm md:text-base">
              <Plus className="text-white" />
              <p className="text-white">Generate Report Cards</p>
            </button>
          </div>

          <table
            className="w-[100%] my-[20px]"
            style={{ borderCollapse: "separate", borderSpacing: "0 12px" }}
          >
            <thead>
              <tr
                style={{ backgroundColor: "#AD8ED6", borderRadius: "6px" }}
                className=""
              >
                {tableData.length > 0 &&
                  Object.keys(tableData[0]).map((key, idx) => (
                    <th
                      key={key}
                      className="p-2 text-white text-[12px]"
                      style={{
                        borderRadius:
                          idx === 0
                            ? "6px 0 0 6px"
                            : idx === Object.keys(tableData[0]).length - 1
                            ? "0 6px 6px 0"
                            : "0",
                      }}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "white" : "#EDEAFB",
                  }}
                  className=""
                >
                  {Object.values(row).map((value, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="p-2 text-[12px]"
                      style={{
                        color: value == "Published" ? "green" : "black",
                      }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SideBar>
      <DashboardComponent />
    </SideBar>
  );
};

export default Dashboard;
