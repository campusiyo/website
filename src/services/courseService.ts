import { publicApi } from "@/api/publicApi";

export const courseService = {
  async list(): Promise<Response> {
    return publicApi.get("/courses");
  },

  async getById(id: string): Promise<Response> {
    return publicApi.get(`/courses/${id}`);
  },

  async getTop(): Promise<Response> {
    return publicApi.get("/courses/top");
  },
};
