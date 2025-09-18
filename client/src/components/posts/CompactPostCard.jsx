import React, { useState, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";

function CompactPostCard({ post }) {
  const [expanded, setExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [height, setHeight] = useState("140px");
  const contentRef = useRef(null);
  const expandedHeightRef = useRef(null);

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

  const hasImages = post?.images && post.images.length > 0;

  const handleToggle = () => {
    if (!expanded) {
      setExpanded(true);
      setIsTransitioning(true);

      requestAnimationFrame(() => {
        if (contentRef.current) {
          const newHeight = contentRef.current.scrollHeight;
          expandedHeightRef.current = newHeight;
          setHeight(`${newHeight}px`);

          setTimeout(() => {
            setHeight("auto"); // 🔧 Let it grow naturally after transition
            setIsTransitioning(false);
          }, 700);
        }
      });
    } else {
      setIsTransitioning(true);
      setHeight(`${expandedHeightRef.current}px`);

      requestAnimationFrame(() => {
        setTimeout(() => {
          setHeight("140px");
        }, 10);
      });

      setTimeout(() => {
        setExpanded(false);
        setIsTransitioning(false);
      }, 800);
    }
  };

  return (
    <div
      className={`shadow-sm transition-all duration-700 ease-in-out ${
        height !== "auto" ? "overflow-hidden" : ""
      }`}
      style={{ height }}
    >
      <div
        ref={contentRef}
        className={`p-2 ${
          expanded || isTransitioning ? "space-y-4" : "space-y-2"
        }`}
      >
        {expanded || (isTransitioning && !expanded) ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700">
                  {post?.profile_pic ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${post.profile_pic}`}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white text-xs">
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
              <span className="text-xs font-medium text-blue-300 bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-700 shadow-sm">
                {formatCategory(post?.category)}
              </span>
            </div>

            {/* Images */}
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

            {post?.title && (
              <h3 className="text-sm font-semibold text-neutral-200">
                {post.title}
              </h3>
            )}

            {post?.content && (
              <p className="text-sm text-neutral-300 leading-relaxed">
                {post.content}
              </p>
            )}
          </div>
        ) : (
          // ---------------- COMPACT VIEW ----------------
          <div className="flex items-center space-x-3">
            {/* Left: Thumbnail */}
            <div className="w-24 h-24 rounded-md overflow-hidden border border-neutral-700 flex-shrink-0">
              {hasImages ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${post.images[0]}`}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white text-sm">
                  📷
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-neutral-700">
                    {post?.profile_pic ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${
                          post.profile_pic
                        }`}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white text-[10px]">
                        ?
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white truncate max-w-[100px]">
                      {post?.author || "Not available"}
                    </p>
                    {/* ✅ Show relative created_at */}
                    <p className="text-[10px] text-neutral-500">
                      {timeAgo(post?.created_at)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-300 bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-700 shadow-sm">
                  {formatCategory(post?.category)}
                </span>
              </div>

              {post?.title && (
                <h3 className="text-sm font-semibold text-neutral-200 truncate">
                  {post.title}
                </h3>
              )}

              {post?.content && (
                <p className="text-xs text-neutral-400 leading-snug line-clamp-2">
                  {post.content}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
          <button className="flex items-center space-x-1 hover:text-white transition-colors">
            <span>💬</span>
            <Link to={"/feed"}>
              {(post?.comment_count ?? 0) + " "}
              {post?.comment_count > 1 ? "Comments" : "Comment"}
            </Link>
          </button>

          <button
            onClick={handleToggle}
            className="text-blue-400 hover:underline transition-colors"
            disabled={isTransitioning}
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompactPostCard;
