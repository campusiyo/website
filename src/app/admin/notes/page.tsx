"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { noteService } from "@/services/noteService";
import { adminService } from "@/services/adminService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Trash2, BookOpen, AlertCircle, CheckCircle2, Search, Eye } from "lucide-react";

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  viewCount: number;
}

export default function NotesManagementPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const res = await noteService.list();
      if (res.ok) {
        const data = await res.json();
        setNotes(data || []);
      } else {
        setError("Failed to retrieve notes catalog.");
      }
    } catch (err) {
      setError("Gateway communication failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Auto-dismiss alert notifications after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDelete = async (note: Note) => {
    if (!confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
      return;
    }
    setError(null);
    setSuccess(null);

    try {
      const res = await adminService.deleteNote(note.id);
      if (res.status === 204 || res.ok) {
        setSuccess(`Note "${note.title}" deleted successfully.`);
        await fetchNotes();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to delete note.");
      }
    } catch (err) {
      setError("Connection failure during delete request.");
    }
  };

  const [apiNotes, setApiNotes] = useState<Note[]>([]);
  const [didYouMean, setDidYouMean] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setApiNotes([]);
      setDidYouMean(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await noteService.search(searchQuery);
        if (res.ok) {
          const data = await res.json();
          setApiNotes(data.notes || []);
          setDidYouMean(data.didYouMean || false);
        } else {
          setApiNotes([]);
          setDidYouMean(false);
        }
      } catch (err) {
        console.error("Search API error:", err);
        setApiNotes([]);
        setDidYouMean(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const filteredNotes = isSearching ? apiNotes : notes;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading study notes database...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          


          <div className="border-b border-border-light pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                <BookOpen className="h-8 w-8 text-primary" />
                Manage Study Notes
              </h1>
              <p className="text-secondary-gray mt-1">
                Oversee published PDF materials and remove outdated notes from the student catalog
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/admin/upload")}
              className="cursor-pointer"
            >
              Upload New Note
            </Button>
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

          {/* Search bar */}
          <div className="bg-card-bg border border-border-light rounded-2xl p-4 shadow-sm flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-gray" />
              <input
                type="text"
                placeholder="Search notes by title, description or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border-light rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {didYouMean && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20 text-left flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="h-4 w-4" />
              <span>Showing results for fuzzy search. (No exact match was found).</span>
            </div>
          )}

          {/* Notes Table */}
          <div className="bg-card-bg border border-border-light rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light/80 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-foreground">Registered Notes</h3>
              <span className="text-xs text-secondary-gray bg-card-bg border border-border-light px-2.5 py-1 rounded-full font-medium">
                {filteredNotes.length} matching entries
              </span>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="text-center py-16 p-6">
                <BookOpen className="h-10 w-10 text-secondary-gray/35 mx-auto mb-3" />
                <p className="font-semibold text-foreground">No notes found</p>
                <p className="text-xs text-secondary-gray mt-1">Try modifying your search keywords or upload a new study note.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-border-light text-xs font-semibold text-secondary-gray uppercase bg-gray-50/20">
                      <th className="px-6 py-3.5 w-[25%]">Title</th>
                      <th className="px-6 py-3.5 w-[18%]">Subject</th>
                      <th className="px-6 py-3.5 w-[32%]">Description</th>
                      <th className="px-6 py-3.5 w-[15%] text-center">Views</th>
                      <th className="px-6 py-3.5 w-[10%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/70 text-sm">
                    {filteredNotes.map((note) => (
                      <tr key={note.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[200px]" title={note.title}>
                          {note.title}
                        </td>
                        <td className="px-6 py-4 text-xs truncate max-w-[140px]" title={note.subject || "General"}>
                          <span className="inline-flex px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {note.subject || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-secondary-gray truncate max-w-[240px]" title={note.description}>
                          {note.description || "—"}
                        </td>
                        <td className="px-6 py-4 text-xs text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] text-foreground font-semibold bg-gray-100 border border-gray-200 dark:bg-hover-card-bg dark:border-border-light px-2.5 py-0.5 rounded-md">
                            <Eye className="h-3 w-3 text-secondary-gray" />
                            {note.viewCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(note)}
                            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 hover:text-red-600 transition-all text-secondary-gray cursor-pointer inline-flex items-center gap-1.5"
                            title="Delete note"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
