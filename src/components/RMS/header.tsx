import { CircleIcon } from "lucide-react"
import Image from "next/image"

export const Header = ({schoolLogo} : {schoolLogo :string}) => {
    return (
            <div className="flex flex-row items-center justify-between mx-[20px] mb-[20px]">
                <p className="text-sm md:text-base">Good day Admin!</p>
                {/* This is suppose to use the school logo url */}
                <img src={schoolLogo} alt="school Logo" className="w-[30px] md:w-[40px] "/>
            </div>
    )
}
