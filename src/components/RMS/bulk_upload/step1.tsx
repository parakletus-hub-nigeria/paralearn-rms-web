'use client';
import React, { useState } from 'react';
import { Upload, Download, FileUp, ArrowRight } from 'lucide-react';
import Papaparse from 'papaparse';
import * as XLSX from 'xlsx';

const Step_One = ({fileContent,setFileContent,step,setStep} : {fileContent: any, setFileContent: React.Dispatch<React.SetStateAction<any>>, step: number, setStep: React.Dispatch<React.SetStateAction<number>>}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [loading,setLoading] = useState(false);
  const [unpacked,SetUnpacked] = useState(false);

  const handleDragOver = (e:any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e:any) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
    console.log(e.dataTransfer.files);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e:any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        setLoading(true)
        const file = files[0];
        const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papaparse.parse(file, {
        header: true, // IMPORTANT: Tries to match headers to keys
        skipEmptyLines: true,
        complete: (results) => {
          // results.data is your Array of Objects
          console.log("CSV Data:", results.data); 
          setFileContent(results.data as any);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        }
      });
    }
    else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const data = e.target?.result;
        // Read the binary data
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first sheet name
        const sheetName = workbook.SheetNames[0];
        // Get the actual sheet
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON (Array of Objects)
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        console.log("Excel Data:", jsonData);
        setFileContent(jsonData as any);
        console.log(fileContent);
      };
      reader.readAsBinaryString(file);}

    }
    setLoading(false);
    SetUnpacked(true)
  };


  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 font-sans">
      
      {/* 1. Header Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-lg font-bold text-gray-900">Upload File</h2>
        </div>
        <p className="text-sm text-gray-600">
          Upload student and teacher data in bulk
        </p>
      </div>

    <div 
      className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors
        ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-purple-300 bg-white'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 5. The Hidden Input Field */}
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".csv, .xlsx, .xls" // Limits selection to these types
      />

      <div className="mb-4 text-gray-600">
        <Upload size={40} strokeWidth={1.5} />
      </div>
      
      <p className="font-semibold text-gray-900 mb-1">
        Drag and drop your file here
      </p>
      <p className="text-sm text-gray-500 mb-6">
        CSV or Excel format (.csv, .xlsx, .xls)
      </p>
      
      {/* 6. Button triggers the Ref */}
      <button 
        onClick={onButtonClick}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
        type="button"
        disabled={loading}
      >
        Select Files
      </button>
    </div>

      {/* 3. Need Help / Template Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="font-bold text-gray-900 text-sm mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Download our template to see the exact format and required columns for your upload.
        </p>
        
        <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors">
          <Download size={18} />
          Download
        </button>
      </div>
        <div className="w-[100%] flex justify-evenly">
      <button onClick={() => {setStep(step + 1)}} disabled={!unpacked} style={!unpacked? {backgroundColor:"#a166f0"} : {backgroundColor:"#641BC4"}} className="w-[35%] rounded-[12px] bg-[#641BC4] font-semibold text-white h-[52px] flex flex-row items-center justify-center cursor-pointer">Next <ArrowRight className='mx-[10px]'/></button>
        </div>

    </div>
  );
};

export default Step_One;