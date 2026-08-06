"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/utils/api";

interface DownloadButtonProps {
  noteId: string;
  documentTitle: string;
  isDarkMode: boolean;
}

export default function DownloadButton({ noteId, documentTitle, isDarkMode }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await api.get(`/notes/${noteId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        // Strip special characters from title
        const safeTitle = documentTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        a.download = `${safeTitle || "note"}_watermarked.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download watermarked PDF. Please try again later.");
      }
    } catch (error) {
      console.error("Error downloading watermarked PDF:", error);
      alert("Error connecting to download service.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
      className={`h-10 gap-2 cursor-pointer transition-all duration-300 rounded-xl text-xs font-semibold px-4 focus:ring-2 focus:ring-[#00A16C]/40 ${
        isDarkMode 
          ? "text-white border-[#262B36] hover:bg-[#262B36] active:scale-98" 
          : "text-gray-700 border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-gray-900 active:scale-98"
      }`}
      title="Download watermarked PDF copy"
    >
      {downloading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="hidden sm:inline">Downloading...</span>
        </>
      ) : (
        <>
          <Download className="h-5 w-5" />
          <span className="hidden sm:inline">Download</span>
        </>
      )}
    </Button>
  );
}
