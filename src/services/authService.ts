import { publicApi } from "@/api/publicApi";
import { RoleType } from "@/constants/roles";

export const authService = {
  async login(email: string, password: string): Promise<Response> {
    return publicApi.post("/auth/login", { email, password });
  },

  async register(email: string, password: string, role: RoleType): Promise<Response> {
    return publicApi.post("/auth/register", { email, password, role });
  },

  async googleLogin(idToken: string): Promise<Response> {
    return publicApi.post("/auth/google", { idToken });
  },

  async refresh(refreshToken: string): Promise<Response> {
    return publicApi.post("/auth/refresh", { refreshToken });
  },
};
