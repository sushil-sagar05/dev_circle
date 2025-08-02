"use client";
import { use, useState, useEffect, useMemo } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { PostDialog } from "@/components/PostDialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
export default function UserProfile({ params }) {
  const userId = useMemo(() => {
    return typeof params === "object" && "id" in params ? params.id : null;
    }, [params]);
  const { currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [newBio, setNewBio] = useState("");
  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: user }, { data: userPosts }] = await Promise.all([
          axios.get(`/user/user/${userId}`),
          axios.get(`/posts/user/${userId}`),
        ]);
        setProfileUser(user);
        setPosts(userPosts);
        setNewBio(user.bio || "");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);
  const isCurrentUser = currentUser?._id === profileUser?._id;
  const handleDeletePost = async (postId) => {
    const prevPosts = posts;
    try {
      setPosts(posts.filter((p) => p._id !== postId));
      await axios.delete(`/posts/${postId}`);
    } catch {
      setPosts(prevPosts);
    }
  };
  const handleEditPost = async (postId, newText) => {
    if (!newText.trim()) return;
    try {
      const { data } = await axios.patch(`/posts/edit/${postId}`, { text: newText });
      setPosts(posts.map((p) => (p._id === postId ? data.post : p)));
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };
  const handleRepost = async (postId) => {
    try {
      const { data } = await axios.patch(`/posts/repost/${postId}`);
      if (data.message === "Repost removed") {
        if (data.repost && data.repost._id) {
          setPosts((prev) => prev.filter((p) => p._id !== data.repost._id));
        } else {
          setPosts((prev) =>
            prev.filter(
              (p) =>
                !(p.repostOf === postId && p.author._id === currentUser._id)
            )
          );
        }
      } else if (data.message === "Reposted" && data.repost) {
        setPosts((prev) => {
          if (prev.find((p) => p._id === data.repost._id)) return prev;
          return [...prev, data.repost];
        });
      }
    } catch (err) {
      console.error("Failed to repost", err);
    }
  };

  const handleSaveBio = async () => {
    const prevBio = profileUser?.bio;
    try {
      setProfileUser({ ...profileUser, bio: newBio });
      const { data } = await axios.patch("/user/profile/bio", { bio: newBio });
      setProfileUser(data.UpdatedUser);
      setBioDialogOpen(false);
    } catch {
      setProfileUser((prev) => ({ ...prev, bio: prevBio }));
      setNewBio(prevBio || "");
    }
  };

  if (loading)
    return <p className="text-center text-gray-500 p-6">Loading profile...</p>;
  if (error) return <p className="text-center text-red-600 p-6">{error}</p>;
  if (!profileUser)
    return <p className="text-center text-gray-500 p-6">User not found.</p>;

  const trimmedBio =
    profileUser.bio?.length > 100
      ? profileUser.bio.slice(0, 97) + "..."
      : profileUser.bio || "No bio yet.";

  const sortedPosts = posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-2xl mx-auto p-4 sm:pt-20 space-y-6">
      <div className="flex items-center gap-5 pb-4 border-b">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
          {profileUser.fullname?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profileUser.fullname}</h1>
          <p className="text-sm text-muted-foreground">
            {profileUser.email?.toLowerCase() || "user"} · {posts.length} posts
          </p>
          <div className="mt-2 text-gray-700 text-sm flex items-center gap-2">
            <span>{trimmedBio}</span>
            {isCurrentUser && (
              <Dialog open={bioDialogOpen} onOpenChange={setBioDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                    {profileUser.bio ? "Edit Bio" : "Add Bio"}
                  </Button>
                </DialogTrigger>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                  <DialogHeader>
                    <DialogTitle>
                      {profileUser.bio ? "Update Bio" : "Add a Bio"}
                    </DialogTitle>
                  </DialogHeader>
                  <textarea
                    className="w-full border rounded p-2 mt-3"
                    rows={3}
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    autoFocus
                  />
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveBio}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-3">Posts</h2>
        {sortedPosts.length > 0 ? (
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                showActions={
                  isCurrentUser &&
                  !post.repostOf &&
                  post.author._id === currentUser._id
                }
                onDelete={() => handleDeletePost(post._id)}
                onEdit={(newText) => handleEditPost(post._id, newText)}
                onRepost={handleRepost}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-4">No posts yet.</p>
        )}
      </section>

      {isCurrentUser && (
        <div className="fixed bottom-6 right-6">
          <PostDialog />
        </div>
      )}
    </div>
  );
}
