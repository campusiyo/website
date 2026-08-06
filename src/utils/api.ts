"use client";

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    // Client-side: route requests through Next.js proxy rewrites starting with /api
    return "/api";
  }
  // Server-side: hit the backend directly
  return "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

// Memory storage for tokens during execution
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

// Initialize tokens from localStorage (client-side only)
const getTokens = () => {
  if (typeof window !== "undefined") {
    _accessToken = localStorage.getItem("campusiyo_access_token");
    _refreshToken = localStorage.getItem("campusiyo_refresh_token");
  }
  return { accessToken: _accessToken, refreshToken: _refreshToken };
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
  if (typeof window !== "undefined") {
    localStorage.setItem("campusiyo_access_token", accessToken);
    localStorage.setItem("campusiyo_refresh_token", refreshToken);
    // Also set a cookie so the server knows if the user is logged in
    document.cookie = `campusiyo_logged_in=true; path=/; max-age=${30 * 24 * 60 * 60}`;
  }
};

export const clearTokens = () => {
  _accessToken = null;
  _refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("campusiyo_access_token");
    localStorage.removeItem("campusiyo_refresh_token");
    document.cookie = "campusiyo_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

// Queue for pending requests while refreshing token
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => {
    if (token) {
      callback(token);
    }
  });
  refreshQueue = [];
};

interface FetchOptions extends RequestInit {
  json?: any;
}

export async function customFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const { accessToken } = getTokens();

  // Clone headers
  const headers = new Headers(options.headers || {});

  // Add Auth token if available
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Handle json payload shortcut
  if (options.json) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.json);
    delete options.json;
  }

  options.headers = headers;

  const response = await fetch(url, options);

  // If 401 and we have a refresh token, and this is not an auth request, try to refresh
  const PUBLIC_ROUTES = ["/", "/about", "/contact", "/privacy", "/terms", "/features", "/coming-soon"];

  if (response.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/register") && !path.includes("/auth/refresh")) {
    const { refreshToken } = getTokens();
    if (!refreshToken) {
      clearTokens();
      return response;
    }

    if (isRefreshing) {
      // Queue this request
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
        const newRefresh = refreshData.refreshToken || refreshToken; // fallback to existing if not returned

        setTokens(newAccess, newRefresh);
        processQueue(newAccess);
        isRefreshing = false;

        // Retry original request
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set("Authorization", `Bearer ${newAccess}`);
        options.headers = retryHeaders;
        return fetch(url, options);
      } else {
        // Refresh token expired or invalid
        clearTokens();
        processQueue(null);
        isRefreshing = false;
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          const isPublic = PUBLIC_ROUTES.includes(window.location.pathname);
          const isModalRoute = ["/courses", "/subjects"].includes(window.location.pathname);
          if (!isPublic && !isModalRoute) {
            window.location.href = "/login?expired=true";
          }
        }
        return response;
      }
    } catch (err) {
      processQueue(null);
      isRefreshing = false;
      return response;
    }
  }

  return response;
}

// REST wrapper methods
export const api = {
  get: (path: string, options?: FetchOptions) => customFetch(path, { ...options, method: "GET" }),
  post: (path: string, body?: any, options?: FetchOptions) => {
    const opt: FetchOptions = { ...options, method: "POST" };
    if (body) {
      if (body instanceof FormData) {
        opt.body = body;
      } else {
        opt.json = body;
      }
    }
    return customFetch(path, opt);
  },
  put: (path: string, body?: any, options?: FetchOptions) => {
    const opt: FetchOptions = { ...options, method: "PUT" };
    if (body) {
      if (body instanceof FormData) {
        opt.body = body;
      } else {
        opt.json = body;
      }
    }
    return customFetch(path, opt);
  },
  delete: (path: string, options?: FetchOptions) => customFetch(path, { ...options, method: "DELETE" }),
};
