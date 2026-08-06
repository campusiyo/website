"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens, clearTokens } from "@/utils/api";

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string;
  role: "STUDENT" | "ADMIN";
  course?: string | null;
  semester?: number | null;
  designation?: string | null;
  profilePictureUrl?: string | null;
  hasNoProfile?: boolean; // flags that profile needs initialization
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, role: "STUDENT" | "ADMIN") => Promise<any>;
  googleLogin: (idToken: string) => Promise<any>;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const fetchProfile = async (): Promise<UserProfile | null> => {
    try {
      const res = await api.get("/users/profile");
      if (res.ok) {
        const profile: UserProfile = await res.json();
        setUser(profile);
        return profile;
      } else if (res.status === 404) {
        // Profile doesn't exist yet (fresh registration)
        // Let's get the user ID and role from what we can, but since this endpoint 404s,
        // we might not have details unless we fetch dashboard or check local tokens.
        // As a fallback, we let the dashboard route or login set the template.
        return null;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      return null;
    }
  };

  // On mount, check if tokens exist and fetch profile
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("campusiyo_access_token");
        if (token) {
          const profile = await fetchProfile();
          // If no profile (404), see if we can get dashboard info to create a basic state
          if (!profile) {
            try {
              const dashRes = await api.get("/users/dashboard");
              if (dashRes.ok) {
                const dashData = await dashRes.json();
                setUser({
                  id: dashData.userId,
                  fullName: dashData.fullName || "New User",
                  email: "",
                  role: dashData.role as "STUDENT" | "ADMIN",
                  hasNoProfile: true,
                });
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      }
      setLoading(false);
      setInitialized(true);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = async (authData: any) => {
    const { accessToken, refreshToken, userId, email, role } = authData;
    setTokens(accessToken, refreshToken);

    // Try to get profile
    try {
      const profileRes = await api.get("/users/profile");
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUser(profile);
        return profile;
      } else if (profileRes.status === 404) {
        // Fresh sign up without profile
        const freshUser: UserProfile = {
          id: userId,
          fullName: "New User",
          email: email,
          role: role as "STUDENT" | "ADMIN",
          hasNoProfile: true,
        };
        setUser(freshUser);
        return freshUser;
      }
    } catch (err) {
      console.error("Error retrieving profile during auth:", err);
    }

    // Default fallback if profile check fails
    const fallbackUser: UserProfile = {
      id: userId,
      fullName: null,
      email: email,
      role: role as "STUDENT" | "ADMIN",
    };
    setUser(fallbackUser);
    return fallbackUser;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }
      const data = await res.json();
      const userProfile = await handleAuthSuccess(data);
      return userProfile;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: "STUDENT" | "ADMIN") => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { email, password, role });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Registration failed");
      }
      const data = await res.json();
      const userProfile = await handleAuthSuccess(data);
      return userProfile;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      // By default Google sign-in creates a student role backend-side
      const res = await api.post("/auth/google", { idToken });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Google Login failed");
      }
      const data = await res.json();
      const userProfile = await handleAuthSuccess(data);
      return userProfile;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    router.push("/login");
  };

  const refreshProfile = async () => {
    return await fetchProfile();
  };

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await api.put("/users/profile", profileData);
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update profile");
    }
    const updatedProfile: UserProfile = await res.json();
    setUser(updatedProfile);
    return updatedProfile;
  };

  return (
    <AuthContext.Provider
      value={{
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
