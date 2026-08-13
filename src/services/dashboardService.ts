import { userApi } from "@/api/userApi";

export const dashboardService = {
  async getDashboard(): Promise<Response> {
    return userApi.get("/users/dashboard");
  },
};
