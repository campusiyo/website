"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Edit2, Trash2, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  totalSemesters: number;
  subjectCount?: number;
}

export default function CoursesCrudPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [totalSemesters, setTotalSemesters] = useState<number>(8);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filter state
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("all");

  const fetchData = async () => {
    try {
      // 1. Fetch categories
      const catRes = await adminService.getCategories();
      let loadedCategories: Category[] = [];
      if (catRes.ok) {
        loadedCategories = await catRes.json();
        setCategories(loadedCategories);
        if (loadedCategories.length > 0) {
          setCategoryId(loadedCategories[0].id); // default category selection
        }
      }

      // 2. Fetch courses
      const courseRes = await adminService.getCourses();
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourses(courseData);
      } else {
        setError("Failed to retrieve courses directory.");
      }
    } catch (err) {
      setError("Gateway communication failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleResetForm = () => {
    setName("");
    setDescription("");
    setTotalSemesters(8);
    setEditingId(null);
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFormLoading(true);

    if (!name.trim()) {
      setError("Course Name is required.");
      setFormLoading(false);
      return;
    }

    if (!categoryId) {
      setError("Please select a parent Category.");
      setFormLoading(false);
      return;
    }

    if (!totalSemesters || totalSemesters < 1 || totalSemesters > 12) {
      setError("Total Semesters must be between 1 and 12.");
      setFormLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId: categoryId,
      description: description.trim() || undefined,
      totalSemesters: Number(totalSemesters),
    };

    try {
      if (editingId) {
        // Update course
        const res = await adminService.updateCourse(editingId, payload);
        if (res.ok) {
          setSuccess(`Course "${name}" updated successfully.`);
          handleResetForm();
          await fetchData();
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to update course.");
        }
      } else {
        // Create course
        const res = await adminService.createCourse(payload);
        if (res.ok) {
          setSuccess(`Course "${name}" created successfully.`);
          handleResetForm();
          await fetchData();
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to create course.");
        }
      }
    } catch (err) {
      setError("Failed to reach server.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (course: Course) => {
    setEditingId(course.id);
    setName(course.name);
    setCategoryId(course.categoryId);
    setDescription(course.description || "");
    setTotalSemesters(course.totalSemesters || 8);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteClick = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete the course "${course.name}"? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await adminService.deleteCourse(course.id);
      if (res.status === 204 || res.ok) {
        setSuccess(`Course "${course.name}" deleted successfully.`);
        await fetchData();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to delete course.");
      }
    } catch (err) {
      setError("Connection failed during delete request.");
    }
  };

  const filteredCourses = selectedFilterCategory === "all"
    ? courses
    : courses.filter((c) => c.categoryId === selectedFilterCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading course records...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          


          <div className="border-b border-border-light pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <BookOpen className="h-8 w-8 text-primary" />
              Manage Degree Courses
            </h1>
            <p className="text-secondary-gray mt-1">
              Configure curriculum course entries and link them to subject categories
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
                {editingId ? "Edit Course Details" : "Create New Course"}
              </h2>

              {categories.length === 0 ? (
                <div className="p-4 border border-red-100 bg-red-50/50 rounded-xl text-sm text-red-655 space-y-2">
                  <p className="font-semibold">No Categories Available</p>
                  <p className="text-xs">You must create at least one category before setting up courses.</p>
                  <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => router.push("/admin/categories")}>
                    Manage Categories
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Course Name"
                    id="name"
                    name="name"
                    placeholder="e.g. B.Tech Computer Science"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="categoryId" className="text-sm font-medium text-foreground/80">
                      Parent Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="totalSemesters" className="text-sm font-medium text-foreground/80">
                      Total Semesters
                    </label>
                    <select
                      id="totalSemesters"
                      name="totalSemesters"
                      value={totalSemesters}
                      onChange={(e) => setTotalSemesters(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
                        <option key={sem} value={sem}>
                          {sem} {sem === 1 ? "Semester" : "Semesters"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-sm font-medium text-foreground/80">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Brief summary of degrees or streams included..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground placeholder:text-foreground/45 transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                    />
                  </div>

                  <div className="pt-4 border-t border-border-light/50 flex gap-2">
                    <Button variant="primary" type="submit" className="flex-grow justify-center py-2 text-sm" isLoading={formLoading}>
                      {editingId ? "Update Course" : "Create Course"}
                    </Button>
                    <Button variant="secondary" type="button" onClick={handleResetForm} className="px-3 py-2 text-sm cursor-pointer">
                      Clear
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Courses Table (Right/Bottom side) */}
            <div className="lg:col-span-8 bg-card-bg border border-border-light rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light/80 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-bold text-foreground">Registered Courses</h3>
                
                {/* Category Filtering Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary-gray whitespace-nowrap font-medium">Filter Category:</span>
                  <select
                    value={selectedFilterCategory}
                    onChange={(e) => setSelectedFilterCategory(e.target.value)}
                    className="px-3 py-1 bg-card-bg border border-border-light rounded-lg text-xs text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-primary/25"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-16 p-6">
                  <BookOpen className="h-10 w-10 text-secondary-gray/35 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">No courses found</p>
                  <p className="text-xs text-secondary-gray mt-1">Configure your categories and add your first course entry to start.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-border-light text-xs font-semibold text-secondary-gray uppercase bg-gray-50/20">
                        <th className="px-6 py-3.5 w-[20%]">Name</th>
                        <th className="px-6 py-3.5 w-[25%]">Category</th>
                        <th className="px-6 py-3.5 w-[12%] text-center">Semesters</th>
                        <th className="px-6 py-3.5 w-[13%] text-center">Subjects</th>
                        <th className="px-6 py-3.5 w-[20%]">Description</th>
                        <th className="px-6 py-3.5 w-[10%] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/70 text-sm">
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[160px]" title={course.name}>
                            {course.name}
                          </td>
                          <td className="px-6 py-4 text-xs truncate max-w-[180px]" title={course.categoryName || "Uncategorized"}>
                            <span className="inline-flex px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                              {course.categoryName || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-foreground text-center">{course.totalSemesters || "—"}</td>
                          <td className="px-6 py-4 text-xs text-center">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              {course.subjectCount !== undefined ? course.subjectCount : 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-secondary-gray truncate max-w-[160px]" title={course.description}>
                            {course.description || "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleEditClick(course)}
                                className="p-1.5 rounded-lg border border-border-light hover:bg-gray-50 hover:text-primary transition-all text-secondary-gray cursor-pointer"
                                title="Edit course"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(course)}
                                className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 hover:text-red-600 transition-all text-secondary-gray cursor-pointer"
                                title="Delete course"
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
