"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Layers, AlertCircle, CheckCircle2, FileText } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  subjectCode: string;
  description: string;
  semester?: number;
  courseId?: string;
}

export default function SubjectsCrudPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState<string>("");
  const [semester, setSemester] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSubjects = async () => {
    try {
      // 1. Fetch courses directory
      const courseRes = await api.get("/admin/courses");
      let loadedCourses = [];
      if (courseRes.ok) {
        loadedCourses = await courseRes.json();
        setCoursesList(loadedCourses);
      }

      // 2. Fetch subjects list
      const res = await api.get("/notes/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      } else {
        setError("Failed to retrieve subjects directory.");
      }

      // Default course selection
      if (loadedCourses.length > 0 && !course) {
        setCourse(loadedCourses[0].id);
      }
    } catch (err) {
      setError("Gateway communication failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const getCourseName = (courseIdOrName: string) => {
    if (!courseIdOrName) return "—";
    const found = coursesList.find((c) => c.id === courseIdOrName);
    return found ? found.name : courseIdOrName;
  };

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

  const handleResetForm = () => {
    setName("");
    setSubjectCode("");
    setDescription("");
    if (coursesList.length > 0) {
      setCourse(coursesList[0].id);
    } else {
      setCourse("");
    }
    setSemester(1);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFormLoading(true);

    if (!name.trim()) {
      setError("Subject Name is required.");
      setFormLoading(false);
      return;
    }

    if (!subjectCode.trim()) {
      setError("Subject Code is required.");
      setFormLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      setFormLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      subjectCode: subjectCode.trim(),
      description: description.trim(),
      courseId: course,
      semester: semester ? Number(semester) : undefined,
    };

    try {
      if (editingId) {
        // Update subject
        const res = await api.put(`/notes/subjects/${editingId}`, payload);
        if (res.ok) {
          setSuccess(`Subject "${name}" updated successfully.`);
          handleResetForm();
          await fetchSubjects();
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to update subject.");
        }
      } else {
        // Create subject
        const res = await api.post("/notes/subjects", payload);
        if (res.ok) {
          setSuccess(`Subject "${name}" created successfully.`);
          handleResetForm();
          await fetchSubjects();
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to create subject.");
        }
      }
    } catch (err) {
      setError("Failed to reach server.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (subject: Subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setSubjectCode(subject.subjectCode || "");
    setDescription(subject.description || "");
    setCourse(subject.courseId || "");
    setSemester(subject.semester || 1);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteClick = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete the subject "${subject.name}"? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await api.delete(`/notes/subjects/${subject.id}`);
      if (res.status === 204 || res.ok) {
        setSuccess(`Subject "${subject.name}" deleted successfully.`);
        await fetchSubjects();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to delete subject.");
      }
    } catch (err) {
      setError("Connection failed during delete request.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading subject records...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          


          <div className="border-b border-border-light pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="h-8 w-8 text-primary" />
              Academic Subjects Board
            </h1>
            <p className="text-secondary-gray mt-1">
              Add and configure subjects to organize study notes for students
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create/Edit Form (Left/Top side) */}
            <div className="lg:col-span-4 bg-card-bg border border-border-light rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {editingId ? "Edit Subject Details" : "Create New Subject"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Subject Name"
                  id="name"
                  name="name"
                  placeholder="e.g. Data Structures"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Subject Code"
                  id="subjectCode"
                  name="subjectCode"
                  placeholder="e.g. CS-301"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-foreground/80">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe syllabus covered in this subject..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground placeholder:text-foreground/45 transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="course" className="text-sm font-medium text-foreground/80">
                    Degree Course
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-sm"
                  >
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="semester" className="text-sm font-medium text-foreground/80">
                    Syllabus Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-border-light/50 flex gap-2">
                  <Button variant="primary" type="submit" className="flex-grow justify-center py-2 text-sm" isLoading={formLoading}>
                    {editingId ? "Update Subject" : "Create Subject"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={handleResetForm} className="px-3 py-2 text-sm cursor-pointer">
                    Clear
                  </Button>
                </div>
              </form>
            </div>

            {/* Subjects Table (Right/Bottom side) */}
            <div className="lg:col-span-8 bg-card-bg border border-border-light rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light/80 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-foreground">Registered Subjects</h3>
                <span className="text-xs text-secondary-gray bg-card-bg border border-border-light px-2.5 py-1 rounded-full font-medium">
                  {subjects.length} total entries
                </span>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-16 p-6">
                  <Layers className="h-10 w-10 text-secondary-gray/35 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">No subjects found</p>
                  <p className="text-xs text-secondary-gray mt-1">Fill in the editor panel to add your first subject mapping.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-border-light text-xs font-semibold text-secondary-gray uppercase bg-gray-50/20">
                        <th className="px-6 py-3.5 w-[22%]">Name</th>
                        <th className="px-6 py-3.5 w-[13%]">Code</th>
                        <th className="px-6 py-3.5 w-[23%]">Description</th>
                        <th className="px-6 py-3.5 w-[20%]">Course</th>
                        <th className="px-6 py-3.5 w-[12%] text-center">Semester</th>
                        <th className="px-6 py-3.5 w-[10%] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/70 text-sm">
                      {subjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[160px]" title={sub.name}>
                            {sub.name}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-primary dark:text-accent-green uppercase">{sub.subjectCode || "—"}</td>
                          <td className="px-6 py-4 text-xs text-secondary-gray truncate max-w-[160px]" title={sub.description}>
                            {sub.description || "—"}
                          </td>
                          <td className="px-6 py-4 text-secondary-gray truncate max-w-[150px]" title={getCourseName(sub.courseId || "")}>
                            {getCourseName(sub.courseId || "")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-foreground border border-gray-200 dark:bg-hover-card-bg dark:border-border-light">
                              Sem {sub.semester || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleEditClick(sub)}
                                className="p-1.5 rounded-lg border border-border-light hover:bg-gray-50 hover:text-primary transition-all text-secondary-gray cursor-pointer"
                                title="Edit subject"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(sub)}
                                className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 hover:text-red-600 transition-all text-secondary-gray cursor-pointer"
                                title="Delete subject"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
