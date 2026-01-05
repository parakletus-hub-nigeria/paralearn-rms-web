import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

type contentType = {
    email:string,
    firstName:string,
    lastName:string,
    class:string,
    dateOfBirth:string,
    gender:string,
    guardianContact:string,
    validationStatus?:boolean
}

const Step_Three = ({validatedFileContent,setValidatedFileContent,step,setStep,ValidNumber,setValidNumber} : {validatedFileContent: contentType[], setValidatedFileContent: React.Dispatch<React.SetStateAction<any>>, step: number, setStep: React.Dispatch<React.SetStateAction<number>>, ValidNumber:number, setValidNumber:React.Dispatch<React.SetStateAction<number>>}) => {

    const invalidCount = validatedFileContent.length - ValidNumber;
    const invalidPercentage = ((invalidCount / validatedFileContent.length) * 100).toFixed(2);

    const handleBack = () => setStep(Math.max(1, step - 1));
    const handleSubmit = () => {
        // Replace with real submit logic; keep minimal for now
        // e.g., call API to import validatedFileContent
        // For now, just move to a hypothetical next step or log
        console.log('Submitting', validatedFileContent.filter(r => r.validationStatus));
        alert('Submit triggered');
    }

  return <div className="w-full mx-auto p-3 sm:p-4 md:p-6 space-y-6 font-sans flex flex-col items-center">

     <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 flex flex-col items-center text-center w-full sm:w-4/5 md:w-3/5 lg:w-2/5">
        <div className="flex items-center gap-3 mb-1 flex-wrap justify-center">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center  text-sm">
            3
          </div>
          <h2 className="text-base sm:text-lg  text-gray-900">Review Upload Summary</h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          Please review the details below before confirming your upload
        </p>
     </div>

     <div className="flex items-center justify-between w-full">
        <div className="flex flex-row-reverse items-center justify-between p-4 sm:p-6 bg-[#DFF9D8] space-x-3 sm:space-x-5 rounded-xl w-[40%]">
            <p className="text-[#065F46] text-lg sm:text-2xl md:text-3xl">{ValidNumber}</p>
            <div className="flex flex-col mr-4">
                <p className="text-xs sm:text-sm text-[#666666]">Valid Records (Will be imported)</p>
                <p className="text-xs sm:text-sm text-[#065F46] font-semibold">These Records meet the requirements</p>
            </div>
        </div>
        <div className="flex flex-row-reverse items-center justify-evenly p-4 sm:p-6 bg-[#FDDADA] space-x-3 sm:space-x-5 rounded-xl w-[40%]">
            <p className="text-[#E60023] text-lg sm:text-2xl md:text-3xl ">{invalidCount}</p>
            <div className="flex flex-col mr-5">
                <p className="text-xs sm:text-sm text-[#666666] ">Invalid Records (Will be skipped)</p>
                <p className="text-xs sm:text-sm text-[#E60023] font-semibold">These records have validation errors</p>
            </div>
        </div>
     </div>

    <div className="flex items-center justify-between w-full">
     <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 flex flex-row items-center justify-between w-[40%]">
        <div className="flex flex-col  gap-3 mb-1 ">
          <p className="text-xs sm:text-sm text-gray-900">Total Records</p>
          <h2 className="text-xs sm:text-sm text-gray-900">In your Uploaded file</h2>
        </div>
        <p className=" text-lg sm:text-2xl md:text-3xl text-gray-600">
          {validatedFileContent.length} 
        </p>
     </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-[#FFFBEB] rounded-xl  shadow-sm border border-red-100 w-[40%]">
                <AlertCircle className="w-12 h-12" />
          <div className="flex flex-col items-start justify-center space-y-1 sm:space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-[#973C53]">Note:</p>
            <p className="text-xs sm:text-sm text-[#973C53]">{invalidCount} record(s) have validation errors and will be skipped during upload. Only the {ValidNumber} records will be imported.</p>
          </div>
        </div>
    </div>

       <div className="w-full sm:w-4/5 md:w-3/5 lg:w-3/5 mx-auto flex items-center justify-between gap-3">
        <button onClick={handleBack} type="button" className="px-4 py-2 rounded bg-gray-200 cursor-pointer text-gray-800 flex space-x-[10px]"><ArrowLeft/> <p>Back</p></button>
        <div className="flex gap-3">
          <button onClick={handleSubmit} className="px-4 py-2 rounded  cursor-pointer flex space-x-[10px] bg-[#641BC4] text-white">Submit </button>
        
        </div>
      </div>

  </div>
}

export default Step_Three;
