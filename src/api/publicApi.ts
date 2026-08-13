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

export async function publicFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.json);
    delete options.json;
  }

  options.headers = headers;
  return fetch(url, options);
}

export const publicApi = {
  get: (path: string, options?: FetchOptions): Promise<Response> =>
    publicFetch(path, { ...options, method: "GET" }),

  post: (path: string, body?: unknown, options?: FetchOptions): Promise<Response> => {
    const opt: FetchOptions = { ...options, method: "POST" };
    if (body !== undefined) {
      if (body instanceof FormData) {
        opt.body = body;
      } else {
        opt.json = body;
      }
    }
    return publicFetch(path, opt);
  },
};
