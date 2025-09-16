/* eslint-disable no-unused-vars */
import { React, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash } from "lucide-react";

function CommentCard({ comment, allowControls, onReload }) {
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Handle delete
  const handleDeleteComment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/post/comments/${comment.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: res.data.message,
        duration: 3000,
      });
      onReload();
    } catch (err) {
      if (err?.status === 401) {
        logout();
      } else {
        if (err && err) {
          setError(err.data.error || err.message);
          toast({
            variant: "destructive",
            title: err.data.error || err.message,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
            duration: 3000,
          });
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    }
  };

  // Handle Edit Comment
  // const handleValueChange

  const handleCommentChange = (e) => {
    e.preventDefault();
    const content = e.target.value;
    setNewComment(content);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/post/comments/${comment.id}`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: res.data.message,
        duration: 3000,
      });
      setNewComment("");
      onReload();
      setIsVisible((prev) => !prev);
    } catch (err) {
      if (err?.status === 401) {
        logout();
      } else {
        if (err && err) {
          setError(err.data.error || err.message);
          toast({
            variant: "destructive",
            title: err.data.error || err.message,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
            duration: 3000,
          });
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    }
  };

  return (
    <article className="mt-2 mb-2 w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/10">
      <div className="flex gap-4">
        {/* Avatar */}
        <img
          src={`${import.meta.env.VITE_API_URL}${comment?.profile_pic}`}
          alt={comment?.full_name}
          className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
        />

        {/* Comment Content */}
        <div className="flex-1 space-y-1">
          {/* Top Row: Name + Action Buttons */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-100">
              {comment.full_name}
            </h4>

            {allowControls ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVisible((prev) => !prev)}
                  className="flex items-center justify-center rounded-md hover:bg-white/10 transition p-1"
                  aria-label="Edit Comment"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={handleDeleteComment}
                  className="flex items-center justify-center rounded-md hover:bg-white/10 transition p-1"
                  aria-label="Delete Comment"
                >
                  <Trash size={18} color="#ff0000" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Comment Text */}
          <p className="text-sm text-gray-300 leading-relaxed">
            {comment?.content}
          </p>
        </div>
      </div>

      {/* Comment Form (moved outside and below the comment block) */}
      {isVisible ? (
        <form
          className="flex gap-2 mt-3"
          onSubmit={(e) => handleCommentSubmit(e)}
        >
          <input
            type="text"
            id="title"
            name="content"
            value={newComment}
            onChange={handleCommentChange}
            required
            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your comment ....."
          />
          <button
            type="submit"
            className="w-1/3 md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold md:py-2 px-4 rounded transition"
          >
            Post
          </button>
        </form>
      ) : null}
    </article>
  );
}

export default CommentCard;
