import SideBar from "@/components/RMS/sideBar";
import { CircleIcon, Plus } from "lucide-react";
import { GraduationCap,Users,Book,BookImage } from "lucide-react";



const DashboardComponent = () => {

    const vv = [
        {
            title:"Students",
            icon:GraduationCap,
            figure:"students",
            bg_color: "#F0E5FF",
            icon_color: "#9747FF"
        },
        {
            title:"Teachers",
            icon:Users,
            figure:"teachers",
            bg_color: "#DFF9D8",
            icon_color: "#3AC13A"
        },
        {
            title:"Subjects",
            icon:Book,
            figure:"Subjects",
            bg_color: "#DBE9FF",
            icon_color: "#2A64F6"
        },
        {
            title:"Assessments",
            icon:BookImage,
            figure:"assessments",
            bg_color: "#FFE9CC",
            icon_color: "#F28C1F"
        }
    ]

    return (
        <div className="w-[100%]">
            <div className="flex flex-rown items-center justify-between mx-[20px] mb-[20px]">
                <p>Good day Admin!</p>
                {/* school logo */}
                <CircleIcon className="size-[40px]"/>
            </div>

            <div className="flex flex-row items-center justify-evenly ">
                {
                    vv.map((items, index) => (
                        <div key={index} className="py-[30px] px-[20px] flex flex-row items-center rounded-lg w-[23%] space-x-4" style={{ backgroundColor: items.bg_color }}>
                            <items.icon className="rounded-[50%] p-[10px] text-white size-[40px]" style={{ backgroundColor: items.icon_color }} />
                            <div>
                                <p className="font-semibold">{items.title}</p>
                                <p className="text-gray-600">{items.figure}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="mt-[20px] space-x-[40px] flex flex-row justify-end mr-[20px]">
                <button className="flex flex-row items-center justify-evenly bg-[#9747FF] p-[6px] space-x-1 text-white rounded-[6px]">
                    <Plus className="text-white"/>
                    <p className="text-white">Add Student</p>
                </button>
                <button className="flex flex-row items-center justify-evenly bg-white p-[6px] space-x-1 text-white rounded-[6px] border-[1px] border-[#9747FF]">
                    <Plus className="text-black"/>
                    <p className="text-black">Add Teacher</p>
                </button>
            </div>
        </div>
    )
}

const Dashboard = () => {
    return (
        <SideBar>
            <DashboardComponent/>
        </SideBar>
    )
}

export default Dashboard