import { Header } from "@/components/RMS/header"
import SideBar from "@/components/RMS/sideBar"
import { Users2, Search, MoreVertical } from "lucide-react"


const UserComponent = () => {
    const vv = [
        {
            title: "Students",
            count: 58,
            bg_color: "#9747FF"
        },
        {
            title: "Teachers",
            count: 14,
            bg_color: "#9747FF4D"
        }
    ]

const tableData = [
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
  {
    id: "1234@stu.myschool.pl.ng",
    name: "John Doe",
    class: "1 South",
    dateOfBirth: "01/01/2001",
    guardianContact: "+234567890456",
  },
];
    return (
        <div className="w-full">
            <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp"/>
            <div className="flex items-center justify-between">
                {vv.map((item,index) => (
                    <div className="py-[30px] px-[20px] text-white flex justify-between items-center w-[30%] rounded-[6px]" style={{backgroundColor:item.bg_color}}>
                        <div className="">
                            <p>{item.title}</p>
                            <p>{item.count}</p>
                        </div>
                        <Users2/>
                    </div>
                ))}
            </div>
            <div className="flex flex-row justify-between items-center mt-[25px]">
                <div className="flex flex-row items-center border-[1px] border-gray-300 rounded-[6px] w-[50%] px-[15px] py-[10px] gap-2">
                    <Search className="size-[20px] text-gray-500"/>
                    <input type="text" placeholder="Search" className="w-full border-none outline-none bg-transparent text-sm"/>
                </div>
                <button className="cursor-pointer hover:opacity-80">
                    <MoreVertical className="size-[24px] text-gray-600"/>
                </button>
            </div>

             <table className="w-[100%] my-[20px]" style={{ borderCollapse: "separate", borderSpacing: "0 12px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#AD8ED6", borderRadius: "6px" }} className="">
                                {tableData.length > 0 && Object.keys(tableData[0]).map((key, idx) => (
                                    <th key={key} className="p-2 text-white text-[12px]" style={{ borderRadius: idx === 0 ? "6px 0 0 6px" : idx === Object.keys(tableData[0]).length - 1 ? "0 6px 6px 0" : "0" }}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "white" : "#EDEAFB" }} className="">
                                    {Object.values(row).map((value, cellIndex) => (
                                        <td key={cellIndex} className="p-2 text-[12px]" style={{color: value == 'Published' ? "green" : "black"}}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
            </table>
        </div>
    )
}

const Users = () => {
    return (
        <SideBar><UserComponent/></SideBar>
    )
}

export default Users