import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

type contentType = {
    email:string,
    firstName:string,
    lastName:string,
    class:string,
    dateOfBirth:string,
    Gender:string,
    guardianContact:string,
    validationStatus?:boolean
}

const Step_Two = ({validatedFileContent,setValidatedFileContent,step,setStep,ValidNumber,setValidNumber} : {validatedFileContent: contentType[], setValidatedFileContent: React.Dispatch<React.SetStateAction<any>>, step: number, setStep: React.Dispatch<React.SetStateAction<number>>, ValidNumber:number, setValidNumber:React.Dispatch<React.SetStateAction<number>>}) => {

    const invalidCount = validatedFileContent.length - ValidNumber;
    const invalidPercentage = ((invalidCount / validatedFileContent.length) * 100).toFixed(2);

    // Filter out columns we don't want to show in the table or cards
    const visibleKeys: Array<keyof contentType> = validatedFileContent.length > 0
      ? (Object.keys(validatedFileContent[0]) as Array<keyof contentType>).filter(k => k !== 'validationStatus' && !/^_\d+$/.test(String(k)))
      : [];

    const handleBack = () => setStep(Math.max(1, step - 1));
    const handleNext = () => setStep(step + 1);

  return <div className="w-full mx-auto p-3 sm:p-4 md:p-6 space-y-6 font-sans flex flex-col items-center">

     <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 flex flex-col items-center text-center w-full sm:w-4/5 md:w-3/5 lg:w-2/5">
        <div className="flex items-center gap-3 mb-1 flex-wrap justify-center">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center  text-sm">
            2
          </div>
          <h2 className="text-base sm:text-lg  text-gray-900">Validate Data</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          Upload student and teacher data in bulk
        </p>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full sm:w-4/5 md:w-3/5 lg:w-3/5">
        <div className="flex flex-row items-center justify-evenly p-4 sm:p-6 bg-[#DFF9D8] space-x-3 sm:space-x-5 rounded-xl">
            <p className="text-[#065F46] text-lg sm:text-2xl md:text-3xl">{ValidNumber}</p>
            <div className="flex flex-col">
                <p className="text-xs sm:text-sm text-[#666666]">Valid Records</p>
                <p className="text-xs sm:text-sm text-[#065F46] font-semibold">{(ValidNumber/validatedFileContent?.length) * 100}% of total</p>
            </div>
        </div>
        <div className="flex flex-row items-center justify-evenly p-4 sm:p-6 bg-[#FDDADA] space-x-3 sm:space-x-5 rounded-xl">
            <p className="text-[#E60023] text-lg sm:text-2xl md:text-3xl ">{invalidCount}</p>
            <div className="flex flex-col">
                <p className="text-xs sm:text-sm text-[#666666]">Invalid Records</p>
                <p className="text-xs sm:text-sm text-[#E60023] font-semibold">{invalidPercentage}% of total</p>
            </div>
        </div>
     </div>

    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-[#FFFBEB] rounded-xl w-full sm:w-4/5 md:w-3/5 lg:w-3/5 shadow-sm border border-red-100">
                <AlertCircle className="w-12 h-12" />
          <div className="flex flex-col items-start justify-center space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-base font-semibold text-[#973C53]">Note:</p>
            <p className="text-xs sm:text-sm text-[#973C53]">{invalidCount} record(s) have validation errors and will be skipped during upload. Only the {ValidNumber} records will be imported.</p>
          </div>
    </div>

    <div className="w-full mx-auto my-4 sm:my-6 px-2 sm:px-0 overflow-hidden">
         <div className="hidden sm:block">
           <table className="w-full text-sm table-fixed" style={{ tableLayout: "fixed", borderCollapse: "separate", borderSpacing: "0 12px" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#AD8ED6", borderRadius: "6px" }} className="">
                                        {visibleKeys.map((key, idx) => (
                                            <th key={key} className="p-3 text-white text-xs sm:text-sm break-all whitespace-normal overflow-hidden" style={{ borderRadius: idx === 0 ? "6px 0 0 6px" : idx === visibleKeys.length - 1 ? "0 6px 6px 0" : "0" }}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {validatedFileContent.map((row, index) => (
                                         <tr key={index} className={`${row.validationStatus === false ? "bg-[#FDDADA]" : index % 2 === 0 ? "bg-white" : "bg-[#EDEAFB]"}`}>
                                            {visibleKeys.map((key, cellIndex) => (
                                                <td key={cellIndex} className="p-3 text-xs sm:text-sm break-all whitespace-normal overflow-hidden" style={{color: row[key] == 'Published' ? "green" : "black"}}>{row[key]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                    </table>
         </div>

         <div className="sm:hidden space-y-4">
           {validatedFileContent.map((row, index) => (
             <div key={index} style={{ backgroundColor: row.validationStatus === false ? "#FDDADA" : index % 2 === 0 ? "white" : "#EDEAFB" }} className="border border-gray-200 rounded-lg p-4">
               {visibleKeys.map((key) => (
                 <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                   <span className="font-semibold text-gray-700 text-xs">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                   <span className="text-xs text-gray-900" style={{color: row[key] == 'Published' ? "green" : "black"}}>{row[key]}</span>
                 </div>
               ))}
             </div>
           ))}
         </div>
    </div>


      <div className="w-full sm:w-4/5 md:w-3/5 lg:w-3/5 mx-auto flex items-center justify-between gap-3">
        <button onClick={handleBack} type="button" className="px-4 py-2 rounded bg-gray-200 cursor-pointer text-gray-800 flex space-x-[10px]"><ArrowLeft/> <p>Back</p></button>
        <div className="flex gap-3">
          <button onClick={handleNext} className="px-4 py-2 rounded  cursor-pointer flex space-x-[10px] bg-[#641BC4] text-white">Next <ArrowRight className='mx-[10px]'/></button>
        
        </div>
      </div>

    </div>
    
}

export default Step_Two;