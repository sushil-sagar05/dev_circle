"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import axios from "@/lib/axios"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Edit,
  Trash2,
  Repeat2,
  MessageSquare,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

export function PostCard({
  post,
  showActions = false,
  onEdit,
  onDelete,
  onRepost,
  currentUserId,
}) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [localPost, setLocalPost] = useState(post);

  const isRepost = !!localPost.repostOf;
  const originalPost = isRepost ? localPost.repostOf : localPost;

  const hasLiked = localPost.likes?.some(
    (like) => like === currentUserId || like._id === currentUserId
  );

  const youRepostedThis = localPost.reposts?.some(
    (rep) => rep.user?.toString() === currentUserId
  );
  const handleClick = (e) => {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.closest("button") ||
      e.target.tagName === "A" ||
      e.target.closest("a")
    )
      return;
    router.push(`/posts/${localPost._id}`);
  };
  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await axios.patch(`/posts/like/${localPost._id}`);
      setLocalPost((prev) => ({
        ...prev,
        likes: data.post.likes,  
      }));
      toast.success("Post liked!");
    } catch (err) {
      console.error("Failed to like/unlike:", err);
      toast.error("Failed to like/unlike post");
    }
  };
  const trimmedBio = (bio) =>
    bio?.length > 100 ? bio.slice(0, 97) + "..." : bio || "No bio";
  return (
    <div
      onClick={handleClick}
      className="border border-gray-200 rounded-xl p-5 mb-6 cursor-pointer hover:shadow-md transition-shadow bg-white relative group"
    >
      {isRepost && (
        <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
          <Repeat2 className="h-4 w-4" />
          <span>
            Reposted by{" "}
            <Link
              href={`/user/${localPost.author?._id || ""}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-blue-600 hover:underline"
            >
              {localPost.author?.fullname || "Unknown User"}
            </Link>
          </span>
        </div>
      )}
      {!isRepost && youRepostedThis && (
        <div className="text-xs text-blue-600/90 mb-2 flex items-center gap-2">
          <Repeat2 className="h-4 w-4" />
          <span>You reposted</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Link
            href={`/user/${originalPost.author?._id || ""}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-base text-blue-600 hover:underline"
          >
            {originalPost.author?.fullname || "Unknown User"}
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            {trimmedBio(originalPost.author?.bio)}
          </p>
        </div>
        {!isRepost && showActions && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="p-1 h-7 w-7 hover:bg-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Edit Post</DialogTitle>
                  <DialogDescription>Make changes and save.</DialogDescription>
                </DialogHeader>
                <textarea
                  className="w-full border rounded p-2 mt-2"
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
                      if (
                        editText.trim() !== "" &&
                        editText.trim() !== originalPost.text
                      ) {
                        onEdit(editText.trim());
                      }
                      setEditDialogOpen(false);
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="p-1 h-7 w-7 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this post?")) onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )}
      </div>
      <p className="whitespace-pre-line text-gray-800 text-sm mb-5 leading-relaxed">
        {originalPost.text}
      </p>

      <p className="text-xs text-gray-400 pb-2">
        Posted on {format(new Date(localPost.createdAt), "MMMM d, yyyy, h:mm a")} •{" "}
        {formatDistanceToNow(new Date(localPost.createdAt), { addSuffix: true })}
      </p>
      <div className="flex gap-1 text-sm border-t pt-2 text-gray-600">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`px-2 py-1 font-normal hover:text-pink-600 ${
            hasLiked ? "text-pink-600 font-semibold" : ""
          }`}
        >
          <Heart
            className="w-4 h-4 mr-1.5"
            fill={hasLiked ? "currentColor" : "none"}
            stroke="currentColor"
          />
          {localPost.likes?.length || 0}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hover:text-blue-600 px-2 py-1 font-normal"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" />
          {localPost.comments?.length || 0}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRepost(isRepost ? post.repostOf?._id : post._id);
          }}
          className={`hover:text-green-600 px-2 py-1 font-normal ${
            youRepostedThis ? "text-green-600 font-medium" : ""
          }`}
        >
          <Repeat2
            className="w-4 h-4 mr-1.5"
            fill={youRepostedThis ? "currentColor" : "none"}
            stroke="currentColor"
          />
          {localPost.reposts?.length || 0}
        </Button>
      </div>
    </div>
  );
}
