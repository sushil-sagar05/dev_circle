"use client";
import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Edit, Trash2, ArrowLeft } from "lucide-react"; 
import { CommentCard } from "@/components/CommentCard";
import { format, formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PostPage({ params }) {
  const router = useRouter();
  const { id: postId } = params; // Fixed line
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data } = await axios.get(`/posts/${postId}`);
        setPost(data);
        setEditText(data.text);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    try {
      setPostingComment(true);
      const { data } = await axios.post(`/posts/comment/${post._id}`, {
        text: newComment.trim(),
      });
      setPost({ ...post, comments: [...post.comments, data] });
      setNewComment("");
        toast.success("Comment posted!");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    const userId = currentUser?._id;
    const hasLiked = post.likes?.some((id) => id === userId);
    let updatedLikes;
    if (hasLiked) {
      updatedLikes = post.likes.filter((id) => id !== userId);
    } else {
      updatedLikes = [...(post.likes || []), userId];
    }
    setPost({ ...post, likes: updatedLikes });

    try {
      await axios.patch(`/posts/like/${post._id}`);
    } catch (err) {
      toast.error("Failed to update like status.");
      setPost(post);
    }
  };

  const handleDeletePost = async () => {
    const prevPost = post;
    try {
      setPost(null);
      await axios.delete(`/posts/${post._id}`);
      toast.success("Deleted Successfully!");
      router.push("/");
    } catch (err) {
      setPost(prevPost);
      toast.error("Failed to delete post.");
    }
  };

  const handleEditPost = async (newText) => {
    if (!newText.trim()) return;
    try {
      const { data } = await axios.patch(`/posts/edit/${post._id}`, {
        text: newText,
      });
      setPost(data.post);
      toast.success("Post updated!");
    } catch (err) {
      console.error("Failed to edit post:", err);
      toast.error("Failed to update post.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await axios.delete(`/posts/comment/${post._id}`, {
        data: { commentId },
      });
      setPost(data.post);
      toast.success("Comment deleted!");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment.");
    }
  };

  const handleEditComment = async (commentId, newText) => {
    if (!newText.trim()) return;
    try {
      const { data } = await axios.patch(`/posts/comment/${post._id}/edit`, {
        commentId,
        text: newText,
      });
      setPost(data.post);
      toast.success("Comment updated!");
    } catch (err) {
      console.error("Failed to edit comment:", err);
      toast.error("Failed to update comment.");
    }
  };

  if (loading) return <p className="text-center text-gray-500 p-6">Loading post...</p>;
  if (!post) return <p className="text-center text-gray-500 p-6">Post not found.</p>;
  if (error) return <p className="text-center text-red-600 p-6">{error}</p>;

  const isPostAuthor = currentUser?._id === post.author?._id?.toString();
  const trimmedBio =
    post.author?.bio?.length > 100
      ? post.author.bio.slice(0, 97) + "..."
      : post.author?.bio || "No bio";
  const userLiked = post.likes?.some((userId) => userId === currentUser?._id);

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 sm:px-0 space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="relative space-y-3 p-6 rounded-lg border bg-white shadow-sm">
        {isPostAuthor && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}

        <Link
          href={`/user/${post.author?._id}`}
          className="text-lg font-semibold text-blue-600 hover:underline"
        >
          {post.author?.fullname || "Unknown User"}
        </Link>
        <p className="text-sm text-gray-500">{trimmedBio}</p>
        <p className="text-base text-gray-800 whitespace-pre-wrap">{post.text}</p>
        <p className="text-xs text-gray-400">
          Posted on {format(new Date(post.createdAt), "MMMM d, yyyy, h:mm a")} •{" "}
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeletePost();
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4 border-y py-3 px-1 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-1 ${
            userLiked ? "text-pink-600 font-semibold" : "text-gray-600"
          }`}
        >
          {userLiked ? "♥️" : "♡"} Like ({post.likes?.length || 0})
        </Button>
        <Button variant="ghost" size="sm">
          💬 Comment ({post.comments?.length || 0})
        </Button>
      </div>

      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          disabled={postingComment}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={postingComment}>
            {postingComment ? "Posting..." : "Reply"}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {post.comments?.length > 0 ? (
          post.comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              currentUserId={currentUser?._id}
              onEdit={(text) => handleEditComment(comment._id, text)}
              onDelete={() => handleDeleteComment(comment._id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm">No comments yet</p>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Update your post content.</DialogDescription>
          </DialogHeader>
          <Textarea
            className="w-full mt-4"
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (editText.trim() !== post.text) {
                  handleEditPost(editText.trim());
                }
                setEditDialogOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
