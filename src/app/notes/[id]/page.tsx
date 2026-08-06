"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";

const ReaderLayout = dynamic(() => import("@/components/pdf/ReaderLayout"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#13151C] text-gray-400 select-none">
      <svg className="animate-spin h-10 w-10 text-[#00A16C]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="mt-4 text-xs font-semibold animate-pulse text-gray-500 tracking-wider">Streaming Secure Document...</span>
    </div>
  ),
});

interface NoteDetails {
  id: string;
  title: string;
  description: string;
  subjectName?: string;
  subject?: string;
}

export default function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: noteId } = use(params);
  const router = useRouter();
  const { user, loading, initialized } = useAuth();
  
  const [noteMeta, setNoteMeta] = useState<NoteDetails | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Security screenshot prevention states
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    if (initialized && !loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Set the relative streaming URL directly
      setPdfUrl(`/api/notes/${noteId}/view`);
      setViewerLoading(false);

      // 2. Fetch metadata from general note list
      const loadMetadata = async () => {
        try {
          const res = await api.get("/notes");
          if (res.ok) {
            const list = await res.json();
            const note = list.find((n: NoteDetails) => n.id === noteId);
            if (note) {
              setNoteMeta(note);
            }
          }
        } catch (e) {
          // ignore metadata load error
        }
      };

      loadMetadata();
    }

    return () => {};
  }, [user, loading, initialized, noteId, router]);

  // Window Focus / Blur & Visibility Change interception to block screenshots
  useEffect(() => {
    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsBlurred(true);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial check in case window starts blurred
    if (typeof document !== "undefined" && !document.hasFocus()) {
      setIsBlurred(true);
    }

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (loading || !initialized || (viewerLoading && !error)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#13151C] text-gray-400 select-none">
        <svg className="animate-spin h-10 w-10 text-[#00A16C]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-xs font-semibold animate-pulse text-gray-500 tracking-wider">Streaming Secure Document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#13151C] text-gray-300 p-8 select-none">
        <div className="bg-[#181C24] border border-[#262B36] p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="font-bold text-lg text-white">Document Unavailable</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{error}</p>
          <Button variant="primary" size="sm" onClick={() => router.push("/notes")}>
            Return to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ReaderLayout
      noteId={noteId}
      pdfUrl={pdfUrl || ""}
      documentTitle={noteMeta?.title || "Study Note"}
      subjectBadge={noteMeta?.subjectName || noteMeta?.subject}
      isBlurred={isBlurred}
      user={user}
      onBack={() => router.push("/notes")}
    />
  );
}
