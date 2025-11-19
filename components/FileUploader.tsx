import React, { useRef } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <UploadCloud className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Billing CSV</h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Click to browse or drag and drop your CSV file here to start the analysis.
      </p>
      <div className="mt-4 flex items-center text-xs text-gray-400">
        <FileText className="w-4 h-4 mr-1" />
        <span>Supports .csv files</span>
      </div>
    </div>
  );
};