"use client";

import { publicApi } from "@/api/publicApi";
import { userApi, userFetch } from "@/api/userApi";
import { adminApi } from "@/api/adminApi";
import { tokenStore } from "@/api/tokenStore";

// Re-export specific clients for first-class consumption
export { publicApi, userApi, adminApi, tokenStore };

export const setTokens = (accessToken: string, refreshToken: string, role?: string | null) => {
  tokenStore.setTokens(accessToken, refreshToken, role);
};

export const clearTokens = () => {
  tokenStore.clearTokens();
};

export const customFetch = userFetch;

/**
 * @deprecated Legacy generic API client. Use publicApi, userApi, or adminApi via feature services instead.
 */
export const api = {
  get: (path: string, options?: Record<string, unknown>) => userApi.get(path, options),
  post: (path: string, body?: unknown, options?: Record<string, unknown>) => userApi.post(path, body, options),
  put: (path: string, body?: unknown, options?: Record<string, unknown>) => userApi.put(path, body, options),
  delete: (path: string, options?: Record<string, unknown>) => userApi.delete(path, options),
};

