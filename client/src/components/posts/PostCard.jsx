import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function PostCard({ post }) {
  const formatCategory = (category) => {
    if (!category) return "No Category";
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const hasImages = post?.images && post.images.length > 0;

  return (
    <div className="space-y-3 rounded-lg  p-3" key={post?.id}>
      {/* Header Row */}
      <div className="flex items-center justify-between">
        {/* Left side: Avatar + Author */}
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
          <p className="text-sm font-medium text-white">
            {post?.author || "Not available"}
          </p>
        </div>

        {/* Right side: Category tag */}
        <span className="text-xs font-medium text-white bg-zinc-800 px-3 py-1 rounded-md">
          {formatCategory(post?.category)}
        </span>
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
    </div>
  );
}

export default PostCard;
