"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Please upload .xlsx or .xls files only", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      toast.loading("Uploading file...", { id: "upload" });
      const res = await axios.post(
        "http://localhost:8000/upload-excel/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(res.data.message, {
        id: "upload",
        duration: 4000,
        position: "top-center",
        style: {
          background: "#f0fdf4",
          color: "#15803d",
          border: "1px solid #15803d",
        },
      });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to upload file. Please try again.", {
        id: "upload",
        duration: 4000,
        position: "top-center",
        style: {
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #dc2626",
        },
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full bg-white flex  p-6">
      <Toaster />
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="flex items-center gap-3 mb-6">
          <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Excel File Uploader
          </h2>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400"
          } ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={uploading ? undefined : handleClick}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
            ref={fileInputRef}
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-4">
            <Upload
              className={`h-12 w-12 ${
                dragActive ? "text-indigo-500" : "text-gray-400"
              } transition-colors duration-300`}
            />
            <p className="text-gray-600 font-medium">
              {dragActive
                ? "Drop your Excel file here"
                : "Drag & drop your Excel file or click to browse"}
            </p>
            <p className="text-sm text-gray-400">(.xlsx or .xls files only)</p>
            {uploading && (
              <div className="flex items-center gap-2 mt-4">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                <span className="text-indigo-600 font-medium">
                  Uploading...
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleClick}
            disabled={uploading}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
              uploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}>
            <Upload className="h-5 w-5 mr-2" />
            Select File
          </button>
        </div>
      </div>
    </div>
  );
}
