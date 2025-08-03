import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Trash2, Edit, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
export function CommentCard({ comment, currentUserId, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const isAuthor = currentUserId === comment.user?._id.toString();
  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    await onEdit(editText);
    setIsEditing(false);
    setIsEditModalOpen(false);
  };
  return (
    <div className="border-t border-gray-200 pt-2 mt-2 relative group">
      <p className="font-semibold text-sm">{comment.user?.fullname || "Unknown"}</p>
      <p className="text-xs text-gray-600 mb-1">
        {comment.user?.bio?.slice(0, 60) + (comment.user?.bio?.length > 60 ? "..." : "") || "No bio"}
      </p>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full border rounded p-2"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleEditSubmit}>
              Save
            </Button>
          </div>
        </div>
      ) : (<>
        <p className="mb-2">{comment.text}</p>
        <p className="text-xs text-gray-400">
  {comment.createdAt && !isNaN(new Date(comment.createdAt)) ? (
    <>
      Posted on {format(new Date(comment.createdAt), "MMMM d, yyyy, h:mm a")} •{" "}
      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
    </>
  ) : (
    "Date not available"
  )}
</p>
        </> 
    )}
      {isAuthor && !isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-7"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <h3>Edit your comment</h3>
              </DialogHeader>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full border rounded p-2"
                rows={3}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={isEditing}
                >
                  {isEditing ? <Loader2 className="animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-7"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <h3>Delete comment</h3>
                <p>Are you sure you want to delete this comment?</p>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {}}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onDelete()}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="animate-spin" /> : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
