/* eslint-disable no-unused-vars */
import { React, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Trash, Pencil } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import EditPostForm from "./EditPostForm";

function PostCard({ post, allowControls, onReload }) {
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    existingImages: post?.images || [],
    images: [],
  });

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

  const hasImages = post?.images && post.images.length > 0;

  return (
    <div className="space-y-3 rounded-lg p-3 bg-gray-900" key={post?.id}>
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

      {/* Footer */}
      <div className="flex items-center text-xs text-neutral-500 space-x-4">
        <button className="flex items-center space-x-1 hover:text-white transition-colors">
          <span>💬</span>
          <span>{post?.comment_count || 0}</span>
        </button>
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
