export default function ProgressBar({step} : {step:any}){
    if(step == 1){
    return <div className="w-[45%] mt-[10px]">
        <div className="flex items-center justify-between px-[10px] my-[5px]">
            <div>
                step 1 of 3
            </div>
            <div>
                30% complete
            </div>
        </div>

        <div className="w-[100%] bg-gray-300 rounded-[2px] h-[10px]">
            <div className="w-[30%] bg-[#641BC4] h-[100%] rounded-[2px] "></div>
        </div>
    </div>
    }

    if(step == 2){
    return <div className="w-[45%] mt-[10px]">
        <div className="flex items-center justify-between px-[10px] my-[5px]">
            <div>
                step 2 of 3
            </div>
            <div>
                60% complete
            </div>
        </div>

        <div className="w-[100%] bg-gray-300 rounded-[2px] h-[10px]">
            <div className="w-[60%] bg-[#641BC4] h-[100%] rounded-[2px] "></div>
        </div>
    </div>
    }

    if(step == 3){
    return <div className="w-[45%] mt-[10px]">
        <div className="flex items-center justify-between px-[10px] my-[5px]">
            <div>
                step 3 of 3
            </div>
            <div>
                100% complete
            </div>
        </div>

        <div className="w-[100%] bg-gray-300 rounded-[2px] h-[10px]">
            <div className="w-[100%] bg-[#641BC4] h-[100%] rounded-[2px] "></div>
        </div>
    </div>
    }
}