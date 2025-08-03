"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/lib/useAuth";
import { toast } from "sonner";

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?._id;
  const fetchPosts = async (pageNumber = 1) => {
  try {
    setLoading(true);
    const { data } = await axios.get(`/posts?page=${pageNumber}&limit=5`);
    if (pageNumber === 1) setPosts(data.posts);
    else setPosts((prev) => [...prev, ...data.posts]);
    setHasMore(pageNumber < data.totalPages);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to fetch posts");
  } finally {
    setLoading(false);
  }
};
    const loadMorePosts = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };
  useEffect(() => {
    fetchPosts();
  }, []);
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
    if (!newText?.trim()) return;
    try {
      const { data } = await axios.patch(`/posts/edit/${postId}`, { text: newText });
      setPosts(posts.map((p) => (p._id === postId ? data.post : p)));
      toast.success("Post updated.");
    } catch (err) {
      console.error("Failed to edit post:", err);
      toast.error("Failed to update post.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setPosting(true);
      const { data } = await axios.post("/posts", { text: newPost.trim() });
      setPosts((prev) => [data, ...prev]);
      setNewPost("");
       toast.success("Post published!");
    } catch {
      toast.error("Failed to publish post.");
    } finally {
      setPosting(false);
    }
  };

  const handleRepost = async (postId) => {
    try {
      const { data } = await axios.patch(`/posts/repost/${postId}`);
      if (data.message === "Reposted" && data.repost) {
        const repostObj = {
          ...data.repost,
          author: { _id: data.repost.author },
        };
        setPosts((prev) => {
          if (prev.find((p) => p._id === repostObj._id)) return prev;
          return [repostObj, ...prev];
        });
        toast.success("Post reposted.");
      } else if (data.message === "Repost removed") {
        setPosts((prev) =>
          prev.filter(
            (p) =>
              !(p.repostOf === postId && p.author._id === currentUserId)
          )
        );
        toast.success("Repost removed.");
      }
    } catch (err) {
      console.error("Failed to repost", err);
      toast.error("Failed to repost.");
    }
  };

  const sorted = posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isCurrentUserOriginal = (post) =>
    currentUserId && !post.repostOf && post.author._id === currentUserId;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-0 mt-12 space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Dev Circle</h1>
        <p className="text-sm text-gray-500">Share and discover developer thoughts</p>
      </header>
      <Card className="p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's happening?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            disabled={posting}
            className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={posting}>
              {posting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </div>
        </form>
      </Card>
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Explore</h2>
        {loading && <p className="text-center text-gray-500">Loading posts...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && sorted.length === 0 && (
          <p className="text-center text-gray-500">No posts yet. Be the first to post!</p>
        )}
        <ScrollArea className="space-y-6">
          {sorted.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              showActions={isCurrentUserOriginal(post)}
              onEdit={(text) => handleEditPost(post._id, text)}
              onDelete={() => handleDeletePost(post._id)}
              onRepost={handleRepost}
              currentUserId={currentUserId}
            />
          ))}
        </ScrollArea>
        {hasMore && !loading && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={loadMorePosts}>
              Load More
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
