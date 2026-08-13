import { adminApi } from "@/api/adminApi";

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<Response> {
    return adminApi.get("/admin/dashboard/stats");
  },

  // Categories
  async getCategories(): Promise<Response> {
    return adminApi.get("/admin/categories");
  },

  async createCategory(data: Record<string, unknown>): Promise<Response> {
    return adminApi.post("/admin/categories", data);
  },

  async updateCategory(id: string, data: Record<string, unknown>): Promise<Response> {
    return adminApi.put(`/admin/categories/${id}`, data);
  },

  async deleteCategory(id: string): Promise<Response> {
    return adminApi.delete(`/admin/categories/${id}`);
  },

  // Courses
  async getCourses(): Promise<Response> {
    return adminApi.get("/admin/courses");
  },

  async createCourse(data: Record<string, unknown>): Promise<Response> {
    return adminApi.post("/admin/courses", data);
  },

  async updateCourse(id: string, data: Record<string, unknown>): Promise<Response> {
    return adminApi.put(`/admin/courses/${id}`, data);
  },

  async deleteCourse(id: string): Promise<Response> {
    return adminApi.delete(`/admin/courses/${id}`);
  },

  // Notes management
  async createNote(formData: FormData): Promise<Response> {
    return adminApi.post("/notes", formData);
  },

  async deleteNote(id: string): Promise<Response> {
    return adminApi.delete(`/notes/${id}`);
  },

  // Subjects management
  async createSubject(data: Record<string, unknown>): Promise<Response> {
    return adminApi.post("/notes/subjects", data);
  },

  async updateSubject(id: string, data: Record<string, unknown>): Promise<Response> {
    return adminApi.put(`/notes/subjects/${id}`, data);
  },

  async deleteSubject(id: string): Promise<Response> {
    return adminApi.delete(`/notes/subjects/${id}`);
  },
};
