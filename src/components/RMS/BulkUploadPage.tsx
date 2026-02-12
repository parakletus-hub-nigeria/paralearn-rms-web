"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import ProgressBar from "@/components/auth/progressBar";
import { Header } from "@/components/RMS/header";
import Step_One from "@/components/RMS/bulk_upload/step1";
import Step_Two from "@/components/RMS/bulk_upload/step2";
import Step_Three from "@/components/RMS/bulk_upload/step3";
import { validateUserRow } from "@/lib/validateRows";

type contentType = {
  email: string;
  firstName: string;
  lastName: string;
  roles: any;
  class: string;
  dateOfBirth: string;
  Gender: string;
  guardianContact: string;
  validationStatus?: boolean;
};

export const BulkUploadPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const [step, setStep] = useState(1);
  const [fileContent, setFileContent] = useState([]);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [validatedFileContent, setValidatedFileContent] = useState(
    [] as contentType[]
  );
  const [ValidNumber, setValidNumber] = useState(0);
  const [uploadType, setUploadType] = useState<"student" | "teacher">(
    "student"
  );

  useEffect(() => {
    dispatch(getTenantInfo());
  }, [dispatch]);

  useEffect(() => {
    let Valid = 0;
    let ValidArray = [] as contentType[];

    if (fileContent.length > 0) {
      fileContent.forEach((Content: contentType, index) => {
        const { isValid } = validateUserRow(Content, index);
        console.log(isValid);
        if (isValid) {
          ValidArray.push({ ...Content, validationStatus: true });
          Valid += 1;
        } else if (!isValid) {
          ValidArray.push({ ...Content, validationStatus: false });
        }
      });
      setValidNumber(Valid);
      setValidatedFileContent(ValidArray);
    }
  }, [fileContent]);

  return (
    <div className="w-full min-h-screen pb-8">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />
      
      <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Bulk User Upload
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Upload multiple {uploadType}s at once using a CSV or Excel file
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto">
          <ProgressBar step={step} />
        </div>

        {/* Upload Type Toggle */}
        <div className="max-w-xl mx-auto">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className="text-sm sm:text-base font-semibold text-slate-700 whitespace-nowrap">
                Upload Type:
              </span>
              <div className="flex bg-white rounded-lg p-1 border-2 border-purple-200 shadow-sm w-full sm:w-auto">
                <button
                  onClick={() => setUploadType("student")}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    uploadType === "student"
                      ? "bg-[#641BC4] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => setUploadType("teacher")}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    uploadType === "teacher"
                      ? "bg-[#641BC4] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Teachers
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step Components */}
        <div className="w-full">
          {step == 1 && (
            <Step_One
              fileContent={fileContent}
              setFileContent={setFileContent}
              step={step}
              setStep={setStep}
              uploadType={uploadType}
              setOriginalFile={setOriginalFile}
            />
          )}
          {step == 2 && validatedFileContent.length > 0 && (
            <Step_Two
              validatedFileContent={validatedFileContent}
              setValidatedFileContent={setValidatedFileContent}
              step={step}
              setStep={setStep}
              ValidNumber={ValidNumber}
              setValidNumber={setValidNumber}
              uploadType={uploadType}
            />
          )}
          {step == 3 && validatedFileContent.length > 0 && (
            <Step_Three
              validatedFileContent={validatedFileContent}
              setValidatedFileContent={setValidatedFileContent}
              step={step}
              setStep={setStep}
              ValidNumber={ValidNumber}
              setValidNumber={setValidNumber}
              uploadType={uploadType}
              originalFile={originalFile}
            />
          )}
        </div>
      </div>
    </div>
  );
};
