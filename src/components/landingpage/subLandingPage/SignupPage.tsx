"use client";

import { useState } from "react";
import AuthHeader from "@/components/auth/authHeader";
import ProgressBar from "@/components/auth/progressBar";
import { PageOne, PageThree, PageTwo } from "@/components/auth/authPAges";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: "",
    subdomain: "",
    adminEmail: "",
    password: "",
    phoneNumber: "",
    schoolAddress: "",
    agreement: false,
  });
  const [isSubdomainManuallyEdited, setIsSubdomainManuallyEdited] = useState(false);

  function changeData(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: newValue,
      };

      if (name === "subdomain") {
        setIsSubdomainManuallyEdited(true);
      }

      if (name === "schoolName" && value && !isSubdomainManuallyEdited) {
        const words = value.trim().split(/\s+/);
        const subdomain = words
          .map((word) => word.charAt(0).toUpperCase())
          .join("")
          .toLowerCase();
        updatedData.subdomain = subdomain;
      }

      return updatedData;
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-50 via-white to-purple-50/30 pb-12">
      <AuthHeader />
      <div className="w-[95%] sm:w-[45%] max-w-xl mt-6 sm:mt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center">
            School Registration
          </h1>
          <p className="text-slate-500 text-sm sm:text-base text-center mt-1">
            Get your school set up in a few steps
          </p>
        </div>
        <ProgressBar step={step} />

        {step == 1 && (
          <PageOne
            data={formData}
            changeData={changeData}
            step={step}
            setStep={setStep}
          />
        )}
        {step == 2 && (
          <PageTwo
            data={formData}
            changeData={changeData}
            step={step}
            setStep={setStep}
          />
        )}
        {step == 3 && (
          <PageThree
            data={formData}
            changeData={changeData}
            step={step}
            setStep={setStep}
          />
        )}
      </div>
    </div>
  );
}
