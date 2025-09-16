/* eslint-disable no-unused-vars */
import { React, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Trash, Pencil, Plus, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import EditPostForm from "./EditPostForm";
import CommentCard from "../comments/CommentCard";

function PostCard({ post, allowControls, onReload }) {
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [postId, setPostId] = useState(post.id);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    existingImages: post?.images || [],
    images: [],
  });
  const [newComment, setNewComment] = useState("");

  const formatCategory = (category) => {
    if (!category) return "No Category";
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1)
      return interval + (interval === 1 ? " year ago" : " years ago");

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1)
      return interval + (interval === 1 ? " month ago" : " months ago");

    interval = Math.floor(seconds / 86400);
    if (interval >= 1)
      return interval + (interval === 1 ? " day ago" : " days ago");

    interval = Math.floor(seconds / 3600);
    if (interval >= 1)
      return interval + (interval === 1 ? " hour ago" : " hours ago");

    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return interval + (interval === 1 ? " minute ago" : " minutes ago");

    return "Just now";
  };

  // Handle Delete
  const handleDelete = async (e, id) => {
    e.preventDefault();
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/post/${id}`,
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

  // Manage Edit
  const manageEdit = (post) => {
    setIsEditing((prev) => !prev);
    setFormData({
      title: post?.title,
      content: post?.content,
      category: post?.category,
      existingImages: post?.images || [],
      images: [],
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("content", formData.content);
      form.append("category", formData.category);
      if (formData.images.length > 0) {
        formData.images.forEach((img) => form.append("images", img));
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/post/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
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
        setError(err.response?.data?.error || err.message);
        toast({
          variant: "destructive",
          title: err.response?.data?.error || err.message,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
          duration: 3000,
        });
      }
    }
  };

  //fetch comments

  const handleAccordionChange = async (value) => {
    if (value === `post-${post.id}`) {
      fetchComments(post.id);
    }
  };

  const triggerReload = () => {
    fetchComments(postId);
  };

  const fetchComments = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/${id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data.comments);
    } catch (err) {
      if (err?.response?.status === 401) {
        logout();
      } else {
        const message =
          err?.response?.data?.error || err.message || "Something went wrong.";
        setError(message);
        toast({
          variant: "destructive",
          title: message,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
          duration: 3000,
        });
      }
    }
  };

  const handleCommentChange = (e, value) => {
    e.preventDefault();
    const content = e.target.value;
    setNewComment(content);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/post/${postId}/comments`,
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
      setCommentCount((prev) => parseInt(prev) + 1);
      fetchComments(post.id);
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

  // getting user if for comment controls

  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.id || decoded.user_id;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const userId = getUserIdFromToken(token);

  const hasImages = post?.images && post.images.length > 0;

  return (
    <div className="space-y-3 rounded-lg p-1 bg-gray-900" key={post?.id}>
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700">
            {post?.profile_pic ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${post.profile_pic}`}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white text-sm">
                ?
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {post?.author || "Not available"}
            </p>
            <p className="text-[11px] text-neutral-500">
              {timeAgo(post?.created_at)}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-300 bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-700 shadow-sm">
            {formatCategory(post?.category)}
          </span>
          {allowControls && (
            <div className="flex items-center gap-3">
              <button onClick={(e) => handleDelete(e, post.id)}>
                <Trash size={18} color="#ea3e3e" />
              </button>
              <button onClick={() => manageEdit(post)}>
                <Pencil size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Images */}
      {hasImages && (
        <div className="relative">
          {post.images.length > 1 ? (
            <Carousel>
              <CarouselContent>
                {post.images.map((image, idx) => (
                  <CarouselItem key={idx}>
                    <img
                      src={`${import.meta.env.VITE_API_URL}${image}`}
                      alt={`Post image ${idx + 1}`}
                      className="w-full max-h-80 min-h-64 object-cover rounded-lg border border-neutral-700"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center" />
            </Carousel>
          ) : (
            <img
              src={`${import.meta.env.VITE_API_URL}${post.images[0]}`}
              alt="Post"
              className="w-full max-h-80 min-h-64 object-cover rounded-lg border border-neutral-700"
            />
          )}
        </div>
      )}

      {/* Title */}
      {post?.title && (
        <h3 className="text-sm font-semibold text-neutral-200">{post.title}</h3>
      )}

      {/* Content */}
      {post?.content && (
        <p className="text-sm text-neutral-300 leading-relaxed">
          {post.content}
        </p>
      )}

      <div className="flex w-full">
        <Accordion
          type="single"
          collapsible
          onValueChange={(value) => handleAccordionChange(value)}
          className="w-full"
        >
          <AccordionItem value={`post-${post.id}`}>
            {/* Custom trigger styling to remove default chevron */}
            <AccordionTrigger className="w-full px-4 rounded-lg bg-gray-800 hover:bg-gray-800 transition flex items-center justify-between p-1 [&>svg]:hidden no-underline hover:no-underline focus:no-underline">
              <div className="flex items-center gap-3 p-0">
                <span className="flex items-center gap-2 text-lg font-medium text-gray-200 bg-gray-900 rounded-md p-2">
                  <MessageCircle size={22} /> {commentCount || 0}
                </span>
                <span className="text-md font-semibold text-gray-100">
                  Create or View comment
                </span>
              </div>
              <div>
                <Plus size={35} className="mr-1" />
              </div>
            </AccordionTrigger>

            <AccordionContent className="mt-3 px-0 text-sm text-gray-300">
              <form
                className="flex gap-2"
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
              <div className="mt-4 max-h-52 overflow-scroll scrollbar-none">
                {comments?.length > 0
                  ? comments.map((comment) => (
                      <CommentCard
                        key={comment.id}
                        comment={comment}
                        allowControls={comment.user_id == userId ? true : false}
                        onReload={triggerReload}
                      />
                    ))
                  : "No comments to show"}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Edit Form Accordion */}
      {allowControls && (
        <Accordion
          className="bg-gray-800 transition rounded-2xl shadow-md"
          type="single"
          value={isEditing ? "edit" : null}
          collapsible
        >
          <AccordionItem value="edit">
            <AccordionContent>
              <EditPostForm
                formData={formData}
                handleChange={handleChange}
                handleEditSubmit={handleEditSubmit}
                postId={post?.id}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

export default PostCard;
