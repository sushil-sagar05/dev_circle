"use client";
import { useEffect } from "react";
import HomeFeed from "@/components/HomeFeed";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
export default function Home() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/signup");
    }
  }, [loading, currentUser, router]);

  if (loading) {
    return <div className="flex-1 p-4">Loading...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{
        backgroundColor: "#fafafa",
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 0.4px, transparent 0.6px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 0.4px, transparent 0.6px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        <HomeFeed />
      </div>
    </main>
  );
}
