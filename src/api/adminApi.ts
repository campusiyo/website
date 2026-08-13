import { userApi, FetchOptions } from "./userApi";
import { tokenStore } from "./tokenStore";
import { Role } from "@/constants/roles";

const verifyAdminRole = (): void => {
  const role = tokenStore.getUserRole();
  if (role !== Role.ADMIN) {
    throw new Error("403 Forbidden: Client side pre-flight authorization check failed. ADMIN role required.");
  }
};

export const adminApi = {
  get: (path: string, options?: FetchOptions): Promise<Response> => {
    verifyAdminRole();
    return userApi.get(path, options);
  },

  post: (path: string, body?: unknown, options?: FetchOptions): Promise<Response> => {
    verifyAdminRole();
    return userApi.post(path, body, options);
  },

  put: (path: string, body?: unknown, options?: FetchOptions): Promise<Response> => {
    verifyAdminRole();
    return userApi.put(path, body, options);
  },

  delete: (path: string, options?: FetchOptions): Promise<Response> => {
    verifyAdminRole();
    return userApi.delete(path, options);
  },
};
