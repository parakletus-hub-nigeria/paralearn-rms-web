import { apiFetch } from "@/lib/interceptor";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type contentType = {
    email:string,
    firstName:string,
    lastName:string,
    roles: any
    class:string,
    dateOfBirth:string,
    Gender:string,
    guardianContact:string,
    validationStatus?:boolean
}

const formatDate = (date:any)  => {
  // ... inside your for...of loop ...

    // 1. Convert "15/08/1985" -> Date Object
    let formattedDate = date

    // Check if it is the Slash format (DD/MM/YYYY)
    if (typeof formattedDate === 'string' && formattedDate.includes('/')) {
        const [day, month, year] = formattedDate.split('/');
        // Reassemble as YYYY-MM-DD so JavaScript can understand it
        formattedDate = new Date(`${year}-${month}-${day}`);
    } 
    // Handle Excel numbers if necessary
    else if (typeof formattedDate === 'number') {
        formattedDate = new Date((formattedDate - 25569) * 86400 * 1000);
    }
    // Fallback for standard strings
    else {
        formattedDate = new Date(formattedDate);
    }

    return formattedDate
}

const Step_Three = ({validatedFileContent,setValidatedFileContent,step,setStep,ValidNumber,setValidNumber} : {validatedFileContent: contentType[], setValidatedFileContent: React.Dispatch<React.SetStateAction<any>>, step: number, setStep: React.Dispatch<React.SetStateAction<number>>, ValidNumber:number, setValidNumber:React.Dispatch<React.SetStateAction<number>>}) => {

    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);

    const invalidCount = validatedFileContent.length - ValidNumber;
    const invalidPercentage = ((invalidCount / validatedFileContent.length) * 100).toFixed(2);

    const handleBack = () => setStep(Math.max(1, step - 1));

    const handleResetToStep1 = () => {
        setShowSuccessDialog(false);
        setStep(1);
        setValidatedFileContent([]);
        setValidNumber(0);
        setUploadCount(0);
    };

    // 1. Mark the parent function as async so we can await the loop
const handleSubmit = async () => {

  let successCount = 0;

  // 2. Use 'for...of' instead of 'forEach'
  for (const record of validatedFileContent) {
    
    // Check validation status (Use 'continue' instead of 'return' inside a loop)
    if (!record.validationStatus) continue;

    // 3. CLEAN UP: Avoid code duplication. 
    // Since student and teacher logic is identical, handle them dynamically.
    const role = record.roles; // "student" or "teacher"
    
    if (role !== "student" && role !== "teacher") continue; // Skip invalid roles

    try {
      const newRecord = {
        email: record.email,
        firstName: record.firstName,
        lastName: record.lastName,
        roles: [role], 
        dateOfBirth:formatDate(record.dateOfBirth), 
        
        gender: record.Gender 
      };

      const bulkUploadRes = await apiFetch('/api/proxy/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });

      const res = await bulkUploadRes.json();

      if (!bulkUploadRes.ok) {
        throw new Error(res.message || `Failed to upload ${role} record`);
      }

      console.log(res);
      toast.success(`Successfully uploaded record for ${record.email}`);
      successCount++;

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Couldn't upload data for ${record.email}`);
    }
  }
  
  // Now this line will actually wait for all uploads to finish!
  setUploadCount(successCount);
  setShowSuccessDialog(true);
};

  return <div className="w-full mx-auto p-3 sm:p-4 md:p-6 space-y-6 font-sans flex flex-col items-center">
    <ToastContainer/>
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

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[95%] sm:max-w-[500px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>Upload Complete!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-gray-700 mb-2">Your bulk upload has been completed successfully.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-2xl font-bold text-green-600">{uploadCount}</p>
                <p className="text-sm text-gray-600">Records uploaded successfully</p>
              </div>
              <p className="text-xs text-gray-500">The uploaded students and teachers have been added to your system.</p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button
                onClick={handleResetToStep1}
                style={{ backgroundColor: "#641BC4" }}
                className="text-white px-6"
              >
                Back to Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

  </div>
}

export default Step_Three;
