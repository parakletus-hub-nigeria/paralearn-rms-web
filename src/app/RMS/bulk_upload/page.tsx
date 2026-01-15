"use client";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/auth/progressBar";
import { Header } from "@/components/RMS/header";
import SideBar from "@/components/RMS/sideBar";
import Step_One from "@/components/RMS/bulk_upload/step1";
import Step_Two from "@/components/RMS/bulk_upload/step2";
import Step_Three from "@/components/RMS/bulk_upload/step3";
import { validateUserRow } from "@/lib/validateRows";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

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

const BulkUserUploadPage = () => {
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
    <div>
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />
      <div className="items-center flex flex-col mb-[40px]">
        <p>Bulk User Upload Page</p>
        <ProgressBar step={step} />

        {/* Upload Type Toggle */}
        <div className="w-full max-w-xl mx-auto mb-6 mt-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Upload Type:
            </span>
            <div className="flex bg-white rounded-lg p-1 border border-purple-200">
              <button
                onClick={() => setUploadType("student")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  uploadType === "student"
                    ? "bg-[#641BC4] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setUploadType("teacher")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  uploadType === "teacher"
                    ? "bg-[#641BC4] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Teachers
              </button>
            </div>
          </div>
        </div>

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
  );
};

const BulkUploadRender = () => {
  return (
    <ProtectedRoute>
      <SideBar>
        <BulkUserUploadPage />
      </SideBar>
    </ProtectedRoute>
  );
};

export default BulkUploadRender;
