"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured, type MockUser } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isMock: boolean;
  loginWithGoogle: () => Promise<void>;
  mockLogin: (name: string, email: string, avatarUrl?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMock, setIsMock] = useState(!isSupabaseConfigured);

  // Initialize and check current auth state
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          // Check real Supabase Auth
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
              avatarUrl: session.user.user_metadata?.avatar_url || "https://cdn.brawlapi.com/brawlers/borders/16000000.png",
            });
            setIsMock(false);
          } else {
            // Check local storage for mock session even if Supabase is present but user not signed in
            const localUser = localStorage.getItem("bf_mock_user");
            if (localUser) {
              setUser(JSON.parse(localUser));
              setIsMock(true);
            }
          }
        } else {
          // Supabase not configured: Check local storage for mock user
          const localUser = localStorage.getItem("bf_mock_user");
          if (localUser) {
            setUser(JSON.parse(localUser));
          }
          setIsMock(true);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to real Supabase auth changes if configured
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: any, session: any) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
              avatarUrl: session.user.user_metadata?.avatar_url || "https://cdn.brawlapi.com/brawlers/borders/16000000.png",
            });
            setIsMock(false);
          } else {
            // Only clear user if no mock user is in localStorage
            const localUser = localStorage.getItem("bf_mock_user");
            if (localUser) {
              setUser(JSON.parse(localUser));
              setIsMock(true);
            } else {
              setUser(null);
            }
          }
        }
      );
      return () => subscription.unsubscribe();
    }
  }, []);

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      // Real Supabase Auth Login
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/profile",
        },
      });
    } else {
      // Simulate Google OAuth
      // Generate a mock user
      const mockAvatars = [
        "16000000", // Shelly
        "16000004", // El Primo
        "16000010", // Leon
        "16000014", // Spike
        "16000024", // Mortis
        "16000030", // Crow
      ];
      const randomAvatar = mockAvatars[Math.floor(Math.random() * mockAvatars.length)];
      
      const newMockUser: AuthUser = {
        id: "mock-user-" + Math.floor(Math.random() * 1000000),
        email: "brawlers_champion@gmail.com",
        name: "BrawlStar_Champion",
        avatarUrl: `https://cdn.brawlapi.com/brawlers/borders/${randomAvatar}.png`,
      };

      // Save user to backend via API (so profiles DB mock knows about them)
      try {
        await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newMockUser.id,
            email: newMockUser.email,
            name: newMockUser.name,
            avatar_url: newMockUser.avatarUrl,
          }),
        });
      } catch (e) {
        console.error("Failed to register mock user profile:", e);
      }

      localStorage.setItem("bf_mock_user", JSON.stringify(newMockUser));
      setUser(newMockUser);
      setIsMock(true);
      
      // Redirect or show message
      alert("Simulating Google Authentication: Successfully logged in as " + newMockUser.name + "!");
    }
  };

  const mockLogin = async (name: string, email: string, avatarUrl?: string) => {
    const defaultAvatar = "https://cdn.brawlapi.com/brawlers/borders/16000000.png";
    const newMockUser: AuthUser = {
      id: "mock-user-" + Math.floor(Math.random() * 1000000),
      email: email || "player@brawlfield.com",
      name: name || "LeonPro",
      avatarUrl: avatarUrl || defaultAvatar,
    };

    // Save profile to backend mock JSON
    try {
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newMockUser.id,
          email: newMockUser.email,
          name: newMockUser.name,
          avatar_url: newMockUser.avatarUrl,
        }),
      });
    } catch (e) {
      console.error("Failed to register mock user profile:", e);
    }

    localStorage.setItem("bf_mock_user", JSON.stringify(newMockUser));
    setUser(newMockUser);
    setIsMock(true);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("bf_mock_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isMock,
        loginWithGoogle,
        mockLogin,
        logout,
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
