'use client'
import { useState } from "react"
import AuthHeader from "@/components/auth/authHeader"
import ProgressBar from "@/components/auth/progressBar"
import { PageOne, PageThree, PageTwo } from "@/components/auth/authPAges"

const Signup = () => {
    const [step,setStep] = useState(1)
    const [formData,setFormData] = useState({
        schoolName:"",
        subdomain:"",
        adminEmail:"",
        password:"",
        phoneNumber:"",
        schoolAddress:"",
        agreement:false
    })
   function changeData(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    const newValue = (type === 'checkbox') ? checked : value;
    
    console.log(newValue);

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
}
    return  <div className="flex flex-col items-center">

        <AuthHeader/>
        <p className="text-[30px] font-bold bg-white text-center text-black">School Registration</p>
        <ProgressBar step={step}/>

        {step == 1 && <PageOne data={formData} changeData={changeData} step={step} setStep={setStep}/>}
        {step == 2 && <PageTwo data={formData} changeData={changeData} step={step} setStep={setStep}/>}
        {step == 3 && <PageThree data={formData} changeData={changeData} step={step} setStep={setStep}/>}
    </div>
}

export default Signup