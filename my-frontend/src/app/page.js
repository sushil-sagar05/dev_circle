"use client";
import HomeFeed from "@/components/HomeFeed";
import { useAuth } from "@/lib/useAuth";
export default function Home() {
  const { loading } = useAuth();

  if (loading) {
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
        <HomeFeed />
      </div>
    </main>
  );
}
