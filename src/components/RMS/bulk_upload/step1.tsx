"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Upload, Download, FileUp, ArrowRight } from "lucide-react";
import Papaparse from "papaparse";
import * as XLSX from "xlsx";
import logo from "../../../../public/mainLogo.svg";

const Step_One = ({
  fileContent,
  setFileContent,
  step,
  setStep,
  uploadType,
  setOriginalFile,
}: {
  fileContent: any;
  setFileContent: React.Dispatch<React.SetStateAction<any>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  uploadType: "student" | "teacher";
  setOriginalFile: React.Dispatch<React.SetStateAction<File | null>>;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [unpacked, SetUnpacked] = useState(false);

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name.toLowerCase();
      
      // Check if file type is valid
      if (
        fileName.endsWith(".csv") ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls")
      ) {
        // Create a synthetic event to reuse handleFileSelect logic
        const syntheticEvent = {
          target: { files: [file] },
        };
        handleFileSelect(syntheticEvent);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      const file = files[0];
      const fileName = file.name.toLowerCase();

      // Store the original file for later upload
      setOriginalFile(file);

      if (fileName.endsWith(".csv")) {
        Papaparse.parse(file, {
          header: true, // IMPORTANT: Tries to match headers to keys
          skipEmptyLines: true,
          complete: (results) => {
            // results.data is your Array of Objects
            console.log("CSV Data:", results.data);
            setFileContent(results.data as any);
            setLoading(false);
            SetUnpacked(true);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setLoading(false);
          },
        });
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const data = e.target?.result;
          // Read the binary data
          const workbook = XLSX.read(data, { type: "binary" });

          // Get the first sheet name
          const sheetName = workbook.SheetNames[0];
          // Get the actual sheet
          const sheet = workbook.Sheets[sheetName];

          // Convert sheet to JSON (Array of Objects)
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          console.log("Excel Data:", jsonData);
          setFileContent(jsonData as any);
          console.log(fileContent);
          setLoading(false);
          SetUnpacked(true);
        };
        reader.readAsBinaryString(file);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* Upload File Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#641BC4] to-[#8538E0] text-white flex items-center justify-center font-bold text-base shadow-md">
              1
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Upload File
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Upload {uploadType} data in bulk
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all duration-300 min-h-[280px] sm:min-h-[320px]
            ${
              isDragging
                ? "border-[#641BC4] bg-purple-50 scale-[1.02]"
                : "border-purple-300 bg-slate-50/50 hover:border-purple-400 hover:bg-purple-50/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv, .xlsx, .xls"
            />

            {loading ? (
              <div className="flex items-center justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <Image
                    src={logo}
                    alt="Loading"
                    width={80}
                    height={80}
                    className="animate-pulse drop-shadow-lg"
                    priority
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 text-purple-600">
                  <Upload size={48} strokeWidth={1.5} className="sm:w-14 sm:h-14" />
                </div>

                <p className="text-base sm:text-lg font-semibold text-slate-900 mb-2 text-center">
                  Drag and drop your file here
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mb-8 text-center max-w-sm">
                  CSV or Excel format (.csv, .xlsx, .xls)
                </p>

                <button
                  onClick={onButtonClick}
                  className="bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={loading}
                >
                  Select Files
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Need Help Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Download our template to see the exact format and required columns
              for your upload.
            </p>

            <button className="w-full sm:w-auto border-2 border-slate-300 hover:border-[#641BC4] hover:bg-purple-50 text-slate-700 hover:text-[#641BC4] py-2.5 px-6 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              <Download size={18} />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => {
            setStep(step + 1);
          }}
          disabled={!unpacked || loading}
          className={`w-full sm:w-auto min-w-[200px] rounded-xl font-semibold text-white h-12 sm:h-14 flex flex-row items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg ${
            !unpacked || loading
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7]"
          }`}
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Step_One;
