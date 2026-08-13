// Framework-independent token store for API clients
let accessToken: string | null = null;
let refreshToken: string | null = null;
let userRole: string | null = null;

const ACCESS_TOKEN_KEY = "campusiyo_access_token";
const REFRESH_TOKEN_KEY = "campusiyo_refresh_token";
const USER_ROLE_KEY = "campusiyo_user_role";

export const tokenStore = {
  getAccessToken(): string | null {
    if (!accessToken && typeof window !== "undefined") {
      accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return accessToken;
  },

  getRefreshToken(): string | null {
    if (!refreshToken && typeof window !== "undefined") {
      refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return refreshToken;
  },

  getUserRole(): string | null {
    if (!userRole && typeof window !== "undefined") {
      userRole = localStorage.getItem(USER_ROLE_KEY);
    }
    return userRole;
  },

  setTokens(newAccessToken: string, newRefreshToken: string, role?: string | null): void {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    if (role !== undefined) {
      userRole = role;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      if (role !== undefined && role !== null) {
        localStorage.setItem(USER_ROLE_KEY, role);
      } else if (role === null) {
        localStorage.removeItem(USER_ROLE_KEY);
      }
      document.cookie = `campusiyo_logged_in=true; path=/; max-age=${30 * 24 * 60 * 60}`;
    }
  },

  setRole(role: string | null): void {
    userRole = role;
    if (typeof window !== "undefined") {
      if (role) {
        localStorage.setItem(USER_ROLE_KEY, role);
      } else {
        localStorage.removeItem(USER_ROLE_KEY);
      }
    }
  },

  clearTokens(): void {
    accessToken = null;
    refreshToken = null;
    userRole = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_ROLE_KEY);
      document.cookie = "campusiyo_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  hydrate(): void {
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      userRole = localStorage.getItem(USER_ROLE_KEY);
    }
  },
};

// Perform initial hydration if running in browser environment
if (typeof window !== "undefined") {
  tokenStore.hydrate();
}
