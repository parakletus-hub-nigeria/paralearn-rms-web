'use client'
import { useEffect, useState } from "react"
import ProgressBar from "@/components/auth/progressBar"
import { Header } from "@/components/RMS/header";
import SideBar from "@/components/RMS/sideBar";
import Step_One from "@/components/RMS/bulk_upload/step1";
import Step_Two from "@/components/RMS/bulk_upload/step2";
import Step_Three from "@/components/RMS/bulk_upload/step3";
import { validateUserRow } from "@/lib/validateRows";

type contentType = {
    email:string,
    firstName:string,
    lastName:string,
    roles:any,
    class:string,
    dateOfBirth:string,
    Gender:string,
    guardianContact:string,
    validationStatus?:boolean
}

const BulkUserUploadPage = () => {
  const [step, setStep] = useState(1);
  const [fileContent, setFileContent] = useState([] );
  const [validatedFileContent, setValidatedFileContent] = useState([] as contentType[]);
  const [ValidNumber,setValidNumber] = useState(0);

    useEffect(() => {
     let Valid = 0
    let ValidArray = [] as contentType[]
    
        if(fileContent.length > 0){
        fileContent.forEach((Content : contentType, index) => {
        const {isValid} = validateUserRow(Content, index);
        console.log(isValid)
        if(isValid){
            ValidArray.push({...Content,validationStatus:true})
            Valid += 1
        }    
        else if(!isValid){
            ValidArray.push({...Content,validationStatus:false})
        }
    })  
        setValidNumber(Valid); 
        setValidatedFileContent(ValidArray);
    }
    },[fileContent])

  return <div >
    <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp"/>
    <div className="items-center flex flex-col mb-[40px]">
    <p>Bulk User Upload Page</p>
    <ProgressBar step={step} />

    {step == 1 && <Step_One fileContent={fileContent} setFileContent={setFileContent} step={step} setStep={setStep}/>}
    {step == 2 && validatedFileContent.length > 0 && <Step_Two validatedFileContent={validatedFileContent} setValidatedFileContent={setValidatedFileContent} step={step} setStep={setStep} ValidNumber={ValidNumber} setValidNumber={setValidNumber}/>}
    {step == 3 && validatedFileContent.length > 0 && <Step_Three validatedFileContent={validatedFileContent} setValidatedFileContent={setValidatedFileContent} step={step} setStep={setStep} ValidNumber={ValidNumber} setValidNumber={setValidNumber}/>}
    </div>
  </div>;
}

const BulkUploadRender = () => {
    return <SideBar><BulkUserUploadPage/></SideBar>
}

export default BulkUploadRender;

