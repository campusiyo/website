"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { subjectService } from "@/services/subjectService";
import { adminService } from "@/services/adminService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2, FileUp } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  semester?: number;
  course?: string;
}

export default function NoteUploadPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectService.list();
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
          if (data.length > 0) {
            setSubjectId(data[0].id); // default selection
          }
        } else {
          setError("Failed to retrieve subject dropdown list.");
        }
      } catch (err) {
        setError("Gateway communication failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (!file) {
      setError("Please upload a PDF document.");
      return;
    }

    submittingRef.current = true;
    setUploading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("subjectId", subjectId);
    formData.append("file", file);

    try {
      const res = await adminService.createNote(formData);
      if (res.ok) {
        setSuccess("Study note PDF uploaded and published successfully.");
        setTitle("");
        setDescription("");
        setFile(null);
        // Redirect to student notes directory after 1.5s
        setTimeout(() => {
          router.push("/notes");
        }, 1500);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to upload file.");
      }
    } catch (err) {
      setError("Network connection failure while uploading document.");
    } finally {
      submittingRef.current = false;
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Initializing upload panel...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          


          <div className="border-b border-border-light pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <UploadCloud className="h-8 w-8 text-primary" />
              Publish Study Note
            </h1>
            <p className="text-secondary-gray mt-1">
              Upload PDF revisions, scanned lectures and guides mapped to subjects
            </p>
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex gap-3 text-sm items-start">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-green mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex gap-3 text-sm items-start">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-card-bg border border-border-light rounded-2xl shadow-xl overflow-hidden p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Note title */}
                <div className="space-y-4">
                  <Input
                    label="Note Title"
                    id="title"
                    name="title"
                    placeholder="e.g. Arrays and Linked Lists - Unit 1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  {/* Subject selector */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground/80">
                      Academic Subject mapping
                    </label>
                    {subjects.length === 0 ? (
                      <div className="p-3 border border-red-100 bg-red-50/50 rounded-lg text-xs text-red-600">
                        No subjects created yet. You must create a subject from the Admin panel before uploading notes.
                      </div>
                    ) : (
                      <select
                        id="subject"
                        name="subject"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} {sub.course ? `(${sub.course})` : ""} {sub.semester ? `- Sem ${sub.semester}` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-foreground/80">
                    Description & Guidelines
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe topics covered in this revision note (e.g. sorting algorithms, complexity analysis...)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground placeholder:text-foreground/45 transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none flex-grow"
                  />
                </div>

              </div>

              {/* PDF Document Upload Zone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Upload PDF File</label>
                
                {file ? (
                  <div className="border border-primary/20 bg-primary/[0.01] rounded-2xl p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate text-sm sm:text-base">{file.name}</p>
                        <p className="text-xs text-secondary-gray mt-0.5">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg border border-border-light text-secondary-gray hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                      dragActive
                        ? "border-primary bg-primary/[0.02]"
                        : "border-border-light hover:border-gray-300 bg-gray-50/10"
                    }`}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-secondary-gray shadow-inner">
                      <FileUp className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-semibold text-primary hover:text-primary-hover transition-colors">
                        Click to upload
                      </span>{" "}
                      <span className="text-secondary-gray">or drag and drop your file</span>
                      <p className="text-xs text-secondary-gray mt-1">PDF documents only (max. 25MB)</p>
                    </div>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-border-light/50 flex justify-end gap-3">
                <Button
                  variant="primary"
                  type="submit"
                  className="px-6 py-2.5 flex items-center gap-1.5 cursor-pointer"
                  isLoading={uploading}
                  disabled={subjects.length === 0}
                >
                  <UploadCloud className="h-5 w-5" />
                  <span>Publish Study Note</span>
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => router.push("/admin")}
                  className="px-5 py-2.5 cursor-pointer"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>

            </form>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
