import { userApi } from "@/api/userApi";
import { publicApi } from "@/api/publicApi";

export const subjectService = {
  async list(): Promise<Response> {
    return userApi.get("/notes/subjects");
  },

  async listSubjects(): Promise<Response> {
    return userApi.get("/notes/subjects/subjects");
  },

  async getByCourseSemester(courseId: string, semester: number): Promise<Response> {
    return userApi.get(`/notes/subjects/subjects?courseId=${encodeURIComponent(courseId)}&semester=${semester}`);
  },

  async popular(): Promise<Response> {
    return publicApi.get("/notes/subjects/popular");
  },
};
