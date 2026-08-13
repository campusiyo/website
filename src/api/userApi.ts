import { tokenStore } from "./tokenStore";

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    if (window.location.protocol.startsWith("http") && !window.location.hostname.includes("localhost")) {
      return "/api";
    }
    return "https://api.campusiyo.in";
  }
  return "https://api.campusiyo.in";
};

const API_BASE_URL = getApiBaseUrl();

export interface FetchOptions extends RequestInit {
  json?: unknown;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string | null): void => {
  refreshQueue.forEach((callback) => {
    if (token) {
      callback(token);
    }
  });
  refreshQueue = [];
};

export async function userFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const accessToken = tokenStore.getAccessToken();

  const headers = new Headers(options.headers || {});
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.json);
    delete options.json;
  }

  options.headers = headers;
  const response = await fetch(url, options);

  // If 401 and this is not an authentication endpoint, attempt token refresh
  if (
    response.status === 401 &&
    !path.includes("/auth/login") &&
    !path.includes("/auth/register") &&
    !path.includes("/auth/refresh")
  ) {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      tokenStore.clearTokens();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
      return response;
    }

    if (isRefreshing) {
      return new Promise<Response>((resolve) => {
        refreshQueue.push((newToken: string) => {
          const newHeaders = new Headers(options.headers);
          newHeaders.set("Authorization", `Bearer ${newToken}`);
          options.headers = newHeaders;
          resolve(fetch(url, options));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newAccess = refreshData.accessToken;
        const newRefresh = refreshData.refreshToken || refreshToken;

        tokenStore.setTokens(newAccess, newRefresh);
        processQueue(newAccess);
        isRefreshing = false;

        const retryHeaders = new Headers(options.headers);
        retryHeaders.set("Authorization", `Bearer ${newAccess}`);
        options.headers = retryHeaders;
        return fetch(url, options);
      } else {
        tokenStore.clearTokens();
        processQueue(null);
        isRefreshing = false;
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }
        return response;
      }
    } catch (err) {
      tokenStore.clearTokens();
      processQueue(null);
      isRefreshing = false;
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
      return response;
    }
  }

  return response;
}

export const userApi = {
  get: (path: string, options?: FetchOptions): Promise<Response> =>
    userFetch(path, { ...options, method: "GET" }),

  post: (path: string, body?: unknown, options?: FetchOptions): Promise<Response> => {
    const opt: FetchOptions = { ...options, method: "POST" };
    if (body !== undefined) {
      if (body instanceof FormData) {
        opt.body = body;
      } else {
        opt.json = body;
      }
    }
    return userFetch(path, opt);
  },

  put: (path: string, body?: unknown, options?: FetchOptions): Promise<Response> => {
    const opt: FetchOptions = { ...options, method: "PUT" };
    if (body !== undefined) {
      if (body instanceof FormData) {
        opt.body = body;
      } else {
        opt.json = body;
      }
    }
    return userFetch(path, opt);
  },

  delete: (path: string, options?: FetchOptions): Promise<Response> =>
    userFetch(path, { ...options, method: "DELETE" }),
};
