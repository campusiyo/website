"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Edit2, Trash2, Tag, AlertCircle, CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export default function CategoriesCrudPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💻"); // default emoji icon
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        setError("Failed to retrieve categories directory.");
      }
    } catch (err) {
      setError("Gateway communication failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    setIcon("💻");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFormLoading(true);

    if (!name.trim()) {
      setError("Category Name is required.");
      setFormLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
    };

    try {
      if (editingId) {
        // Update category
        const res = await api.put(`/admin/categories/${editingId}`, payload);
        if (res.ok) {
          setSuccess(`Category "${name}" updated successfully.`);
          handleResetForm();
          await fetchCategories();
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to update category.");
        }
      } else {
        // Create category
        const res = await api.post("/admin/categories", payload);
        if (res.ok) {
          setSuccess(`Category "${name}" created successfully.`);
          handleResetForm();
          await fetchCategories();
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to create category.");
        }
      }
    } catch (err) {
      setError("Failed to reach server.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon || "💻");
    setError(null);
    setSuccess(null);
  };

  const handleDeleteClick = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"? All associated courses might lose their parent reference. This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await api.delete(`/admin/categories/${category.id}`);
      if (res.status === 204 || res.ok) {
        setSuccess(`Category "${category.name}" deleted successfully.`);
        await fetchCategories();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to delete category.");
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
        <span className="mt-4 text-secondary-gray font-medium text-sm animate-pulse">Loading category records...</span>
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
              <Tag className="h-8 w-8 text-primary" />
              Manage Subject Categories
            </h1>
            <p className="text-secondary-gray mt-1">
              Add, update, or remove primary branches of study notes (e.g. Engineering, Business, Pure Sciences)
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
                {editingId ? "Edit Category Details" : "Create New Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Category Name"
                  id="name"
                  name="name"
                  placeholder="e.g. Engineering & Tech"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-foreground/80">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Brief details about courses in this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground placeholder:text-foreground/45 transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="icon" className="text-sm font-medium text-foreground/80">
                    Visual Icon (Emoji / Symbol)
                  </label>
                  <select
                    id="icon"
                    name="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-light rounded-lg text-foreground transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-sm"
                  >
                    <option value="💻">💻 Engineering / Tech</option>
                    <option value="📈">📈 Business / Commerce</option>
                    <option value="🔬">🔬 Pure Sciences</option>
                    <option value="🎨">🎨 Arts & Humanities</option>
                    <option value="⚖️">⚖️ Legal / Law</option>
                    <option value="🏥">🏥 Medicine & Health</option>
                    <option value="📚">📚 General Library</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border-light/50 flex gap-2">
                  <Button variant="primary" type="submit" className="flex-grow justify-center py-2 text-sm" isLoading={formLoading}>
                    {editingId ? "Update Category" : "Create Category"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={handleResetForm} className="px-3 py-2 text-sm cursor-pointer">
                    Clear
                  </Button>
                </div>
              </form>
            </div>

            {/* Categories Table/Cards (Right/Bottom side) */}
            <div className="lg:col-span-8 bg-card-bg border border-border-light rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border-light/80 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-foreground">Registered Categories</h3>
                <span className="text-xs text-secondary-gray bg-card-bg border border-border-light px-2.5 py-1 rounded-full font-medium">
                  {categories.length} total categories
                </span>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-16 p-6">
                  <Tag className="h-10 w-10 text-secondary-gray/35 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">No categories found</p>
                  <p className="text-xs text-secondary-gray mt-1">Add your first notes category to begin.</p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="border border-border-light bg-background/50 hover:bg-hover-card-bg p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="h-12 w-12 rounded-xl bg-card-bg border border-border-light flex items-center justify-center text-2xl shrink-0">
                          {cat.icon || "💻"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors text-base">
                            {cat.name}
                          </h4>
                          <p className="text-xs text-secondary-gray mt-1 line-clamp-3 leading-relaxed">
                            {cat.description || "No description available for this catalog branch."}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-border-light/40 mt-1">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="px-2.5 py-1.5 rounded-lg border border-border-light hover:bg-card-bg hover:text-primary transition-all text-secondary-gray text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="px-2.5 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 hover:text-red-600 transition-all text-secondary-gray text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
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
