"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "@/api/tokenStore";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";
import { dashboardService } from "@/services/dashboardService";
import { RoleType } from "@/constants/roles";

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string;
  role: RoleType;
  course?: string | null;
  semester?: number | null;
  designation?: string | null;
  profilePictureUrl?: string | null;
  hasNoProfile?: boolean;
}

export type AuthStatus =
  | { state: "UNKNOWN" }
  | { state: "REFRESHING" }
  | { state: "AUTHENTICATED"; user: UserProfile }
  | { state: "UNAUTHENTICATED" }
  | { state: "EXPIRED" };

interface AuthContextType {
  authStatus: AuthStatus;
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, role: RoleType) => Promise<UserProfile>;
  googleLogin: (idToken: string) => Promise<UserProfile>;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ state: "UNKNOWN" });
  const router = useRouter();

  const user = authStatus.state === "AUTHENTICATED" ? authStatus.user : null;
  const loading = authStatus.state === "UNKNOWN" || authStatus.state === "REFRESHING";
  const initialized = authStatus.state !== "UNKNOWN";

  const fetchProfile = async (): Promise<UserProfile | null> => {
    try {
      const res = await profileService.getProfile();
      if (res.ok) {
        const profile: UserProfile = await res.json();
        tokenStore.setRole(profile.role);
        setAuthStatus({ state: "AUTHENTICATED", user: profile });
        return profile;
      } else if (res.status === 404) {
        return null;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const token = tokenStore.getAccessToken();
        if (token) {
          const profile = await fetchProfile();
          if (!profile) {
            try {
              const dashRes = await dashboardService.getDashboard();
              if (dashRes.ok) {
                const dashData = await dashRes.json();
                const fallbackProfile: UserProfile = {
                  id: dashData.userId,
                  fullName: dashData.fullName || "New User",
                  email: "",
                  role: dashData.role as RoleType,
                  hasNoProfile: true,
                };
                tokenStore.setRole(fallbackProfile.role);
                setAuthStatus({ state: "AUTHENTICATED", user: fallbackProfile });
              } else {
                setAuthStatus({ state: "UNAUTHENTICATED" });
              }
            } catch {
              setAuthStatus({ state: "UNAUTHENTICATED" });
            }
          }
        } else {
          setAuthStatus({ state: "UNAUTHENTICATED" });
        }
      } else {
        setAuthStatus({ state: "UNAUTHENTICATED" });
      }
    };

    initAuth();
  }, []);

  const handleAuthSuccess = async (authData: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: RoleType;
  }): Promise<UserProfile> => {
    const { accessToken, refreshToken, userId, email, role } = authData;
    tokenStore.setTokens(accessToken, refreshToken, role);

    try {
      const profileRes = await profileService.getProfile();
      if (profileRes.ok) {
        const profile: UserProfile = await profileRes.json();
        tokenStore.setRole(profile.role);
        setAuthStatus({ state: "AUTHENTICATED", user: profile });
        return profile;
      } else if (profileRes.status === 404) {
        const freshUser: UserProfile = {
          id: userId,
          fullName: "New User",
          email: email,
          role: role,
          hasNoProfile: true,
        };
        tokenStore.setRole(role);
        setAuthStatus({ state: "AUTHENTICATED", user: freshUser });
        return freshUser;
      }
    } catch (err) {
      console.error("Error retrieving profile during auth:", err);
    }

    const fallbackUser: UserProfile = {
      id: userId,
      fullName: null,
      email: email,
      role: role,
    };
    tokenStore.setRole(role);
    setAuthStatus({ state: "AUTHENTICATED", user: fallbackUser });
    return fallbackUser;
  };

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setAuthStatus({ state: "REFRESHING" });
    try {
      const res = await authService.login(email, password);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }
      const data = await res.json();
      return await handleAuthSuccess(data);
    } catch (err) {
      setAuthStatus({ state: "UNAUTHENTICATED" });
      throw err;
    }
  };

  const register = async (email: string, password: string, role: RoleType): Promise<UserProfile> => {
    setAuthStatus({ state: "REFRESHING" });
    try {
      const res = await authService.register(email, password, role);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Registration failed");
      }
      const data = await res.json();
      return await handleAuthSuccess(data);
    } catch (err) {
      setAuthStatus({ state: "UNAUTHENTICATED" });
      throw err;
    }
  };

  const googleLogin = async (idToken: string): Promise<UserProfile> => {
    setAuthStatus({ state: "REFRESHING" });
    try {
      const res = await authService.googleLogin(idToken);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Google Login failed");
      }
      const data = await res.json();
      return await handleAuthSuccess(data);
    } catch (err) {
      setAuthStatus({ state: "UNAUTHENTICATED" });
      throw err;
    }
  };

  const logout = () => {
    tokenStore.clearTokens();
    setAuthStatus({ state: "UNAUTHENTICATED" });
    router.push("/login");
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    return await fetchProfile();
  };

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await profileService.updateProfile(profileData as Record<string, unknown>);
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update profile");
    }
    const updatedProfile: UserProfile = await res.json();
    tokenStore.setRole(updatedProfile.role);
    setAuthStatus({ state: "AUTHENTICATED", user: updatedProfile });
    return updatedProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        loading,
        initialized,
        login,
        register,
        googleLogin,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
