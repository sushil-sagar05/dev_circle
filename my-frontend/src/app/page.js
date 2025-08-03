"use client";
import HomeFeed from "@/components/HomeFeed";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
export default function Home() {
  const { currentUser, loading } = useAuth();
  const [personalized, setPersonalized] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/signup"); 
    }
  }, [loading, currentUser, router]);

  if (loading || !currentUser) {
    return <div className="flex-1 p-4">Loading...</div>;
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
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${personalized ? "bg-blue-600 text-white" : "bg-gray-300"}`}
            onClick={() => setPersonalized(true)}
          >
            Following
          </button>
          <button
            className={`px-4 py-2 rounded ${!personalized ? "bg-blue-600 text-white" : "bg-gray-300"}`}
            onClick={() => setPersonalized(false)}
          >
            Explore
          </button>
        </div>

        <HomeFeed personalized={personalized} />
      </div>
    </main>
  );
}
