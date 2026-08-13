import { userApi } from "@/api/userApi";

export const profileService = {
  async getProfile(): Promise<Response> {
    return userApi.get("/users/profile");
  },

  async updateProfile(profileData: Record<string, unknown>): Promise<Response> {
    return userApi.put("/users/profile", profileData);
  },
};
