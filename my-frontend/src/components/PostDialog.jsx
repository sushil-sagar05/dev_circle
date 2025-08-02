"use client";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
export function PostDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setPosting(true);
      const { data } = await axios.post("/posts", { text });
      setOpen(false);
      setText("");
      router.refresh();
    } catch (err) {
      console.error("Failed to post:", err);
    } finally {
      setPosting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button  className="w-full" variant="outline">Post</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Textarea
            placeholder="What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full"
          />
          <DialogFooter>
            <Button
              type="submit"
              disabled={posting}
            >
              {posting ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
