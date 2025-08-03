"use client";

import { useMemo, useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { PostDialog } from "@/components/PostDialog";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function UserProfile({ params }) {
  const userId = useMemo(() => (
    typeof params === "object" && "id" in params ? params.id : null
  ), [params]);
  const { currentUser } = useAuth();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [{ data: user }, { data: userPosts }] = await Promise.all([
          axios.get(`/user/user/${userId}`),
          axios.get(`/posts/user/${userId}`),
        ]);
        if (!ignore) {
          setProfileUser(user);
          setPosts(userPosts);
          setNewBio(user.bio || "");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchData();
    return () => { ignore = true };
  }, [userId]);
useEffect(() => {
  if (
    currentUser?.following &&
    profileUser &&
    currentUser._id !== profileUser._id
  ) {
    axios.get("/user/following")
      .then((res) => {
        const followedIds = Array.isArray(res.data.following)
          ? res.data.following.map((u) => u._id)
          : [];
        setIsFollowing(followedIds.includes(profileUser._id));
      })
      .catch(() => {
        setIsFollowing(false);
      });
  }
}, [currentUser, profileUser]);


  const handleFollowToggle = async () => {
    if (!profileUser || !currentUser) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.patch(`/user/unfollow/${profileUser._id}`);
        setIsFollowing(false);
        toast.success(`Unfollowed ${profileUser.fullname}`);
      } else {
        await axios.patch(`/user/follow/${profileUser._id}`);
        setIsFollowing(true);
        toast.success(`Followed ${profileUser.fullname}`);
      }
    } catch(err) {
      let msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to update follow status";
    toast.error(msg);
    } finally {
      setFollowLoading(false);
    }
  };
  const handleSaveBio = async () => {
    const prevBio = profileUser?.bio;
    try {
      setProfileUser((p) => ({ ...p, bio: newBio }));
      const { data } = await axios.patch("/user/profile/bio", { bio: newBio });
      setProfileUser(data.UpdatedUser);
      setBioDialogOpen(false);
      toast.success("Bio updated successfully!");
    } catch {
      setProfileUser((p) => ({ ...p, bio: prevBio }));
      setNewBio(prevBio || "");
      toast.error("Failed to update bio.");
    }
  };
  const isCurrentUser = currentUser?._id === profileUser?._id;

  const handleDeletePost = async (postId) => {
    const prevPosts = posts;
    try {
      setPosts(posts.filter((p) => p._id !== postId));
      await axios.delete(`/posts/${postId}`);
      toast.success("Post deleted.");
    } catch {
      setPosts(prevPosts);
      toast.error("Failed to delete post.");
    }
  };

  const handleEditPost = async (postId, newText) => {
    if (!newText.trim()) return;
    try {
      const { data } = await axios.patch(`/posts/edit/${postId}`, { text: newText });
      setPosts(posts.map((p) => (p._id === postId ? data.post : p)));
      toast.success("Post updated.");
    } catch {
      toast.error("Failed to update post.");
    }
  };

  const handleRepost = async (postId) => {
    try {
      const { data } = await axios.patch(`/posts/repost/${postId}`);
      if (data.message === "Repost removed") {
        toast.success("Repost removed.");
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
        toast.success("Post reposted.");
        setPosts((prev) => {
          if (prev.find((p) => p._id === data.repost._id)) return prev;
          return [...prev, data.repost];
        });
      }
    } catch {
      toast.error("Failed to repost.");
    }
  };

  const trimmedBio = profileUser?.bio
    ? profileUser.bio.length > 120
      ? profileUser.bio.slice(0, 117) + "..."
      : profileUser.bio
    : "No bio yet.";

  const sortedPosts = posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (loading) return (
    <div className="max-w-2xl mx-auto mt-24 p-8 text-center text-gray-500">
      Loading profile...
    </div>
  );
  if (error) return (
    <div className="max-w-2xl mx-auto mt-24 p-8 text-center text-red-600">
      {error}
    </div>
  );
  if (!profileUser) return (
    <div className="max-w-2xl mx-auto mt-24 p-8 text-center text-gray-500">
      User not found.
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto sm:pt-20 p-4 space-y-8">
         <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
      <section className="flex gap-5 items-start border-b pb-7">
        <div className="
          w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-blue-400
          flex items-center justify-center text-3xl font-bold shadow
        ">
          {profileUser.fullname?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold">{profileUser.fullname}</h1>
            <span className="text-xs sm:text-sm px-2 py-1 bg-gray-100 rounded text-gray-500/80">
              {profileUser.email?.toLowerCase() || "@" + profileUser.fullname?.toLowerCase().replace(/\s+/g, "") }
            </span>
            {!isCurrentUser && (
              <Button
                size="sm"
                disabled={followLoading}
                variant={isFollowing ? "secondary" : "default"}
                onClick={handleFollowToggle}
                className={`ml-auto font-semibold ${isFollowing ? "bg-gray-100 text-black hover:bg-gray-200" : ""}`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-gray-700 text-base">
            <span>{trimmedBio}</span>
            {isCurrentUser && (
              <Dialog open={bioDialogOpen} onOpenChange={setBioDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="link"
                    className="text-blue-600 font-semibold ml-1 pl-0 h-auto"
                  >
                    {profileUser.bio ? "Edit Bio" : "Add Bio"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {profileUser.bio ? "Update Bio" : "Add Your Bio"}
                    </DialogTitle>
                  </DialogHeader>
                  <textarea
                    className="w-full border rounded p-2 mt-3 resize-none"
                    rows={4}
                    maxLength={200}
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    autoFocus
                  />
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveBio} type="button">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Posts: {posts.length}
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4">Posts</h2>
        {sortedPosts.length > 0 ? (
          <div className="space-y-5">
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
                onEdit={(text) => handleEditPost(post._id, text)}
                onRepost={handleRepost}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        ) : (
          <p className="mt-7 text-center text-gray-400 text-base">No posts yet.</p>
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
