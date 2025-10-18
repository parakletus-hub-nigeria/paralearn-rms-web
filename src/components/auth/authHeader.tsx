"use client"
import Image from "next/image"
import logo from "../../images/IMG-20201027-WA0000_2-removebg-preview 1.png"
const AuthHeader = () => {
    return <div className="flex flex-row items-center justify-between bg-white w-[100%] ">
        <div className="w-[20%] flex items-center justify-evenly p-2">
            <Image src={logo} className="w-[80px]" alt="paralearn logo"/>
            <p className="text-black">PARA LEARN</p>
        </div>
        <div className="w-[20%] flex flex-row items-center space-x-[20px] ">
            <button className="px-[15px] py-[10px] text-[#641BC4] text-[18px] font-[550]">Sign in</button>
            <button className="px-[15px] py-[10px] text-[white] bg-[#641BC4] text-[18px] font-[550]">Get Started</button>
        </div>
    </div>
}

export default AuthHeader