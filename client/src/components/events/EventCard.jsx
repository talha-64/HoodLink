import React from "react";

function EventCard({ event }) {
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return "No Date";
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
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

  return (
    <div key={event?.id} className="space-y-3">
      {/* Header: Avatar + Organizer + Posted time */}
      <div className="flex items-center gap-3">
        <img
          src={`${import.meta.env.VITE_API_URL}${event?.profile_pic}`}
          alt="Organizer Avatar"
          className="w-12 h-12 rounded-full border border-neutral-700 shadow-[0_0_6px_rgba(255,255,255,0.15)] object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-white">
            {event?.organizer || "Unknown Organizer"}
          </p>
          <p className="text-sm text-neutral-500">
            {timeAgo(event?.created_at)}
          </p>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg mb-0 font-bold text-neutral-100 tracking-wide">
        {event?.title}
      </h3>

      {/* Description */}
      {event?.description && (
        <p className="text-sm text-neutral-300 mb-3 leading-relaxed">
          {event.description}
        </p>
      )}
      {/* Meta Info (Date + Location row) */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-blue-300 bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-700 shadow-sm">
          ⏰ {formatDate(event?.event_date ? new Date(event.event_date) : null)}
        </span>
        {event?.location && (
          <span className="text-xs font-medium text-green-300 bg-green-900/40 px-3 py-1 rounded-lg border border-green-700 shadow-sm flex items-center gap-1">
            📍 {event.location}
          </span>
        )}
      </div>
    </div>
  );
}

export default EventCard;
