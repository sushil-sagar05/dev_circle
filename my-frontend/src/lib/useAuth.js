"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    async function fetchAuth() {
      try {
        const { data } = await axios.get("/user/profile");
        setCurrentUser(data);
      } catch (err) {
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
  return { currentUser, loading, logout };
}
