"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    async function fetchAuth() {
      try {
        const { data } = await axios.get("/user/profile");
        setCurrentUser(data);
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAuth();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/user/logout", {}, { withCredentials: true });
      setCurrentUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
