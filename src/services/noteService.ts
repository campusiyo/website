import { userApi } from "@/api/userApi";

export const noteService = {
  async list(): Promise<Response> {
    return userApi.get("/notes");
  },

  async search(query: string): Promise<Response> {
    return userApi.get(`/notes/search?q=${encodeURIComponent(query)}`);
  },

  async getById(id: string): Promise<Response> {
    return userApi.get(`/notes/${id}`);
  },

  async download(id: string): Promise<Response> {
    return userApi.get(`/notes/${id}/download`);
  },

  getStreamUrl(id: string): string {
    return `/api/notes/${id}/view`;
  },
};
