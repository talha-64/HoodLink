/* eslint-disable no-unused-vars */
import React from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/context/AuthContext";

function ChatList({ conversation, onSelect, isActive }) {
  const { token, logout } = useAuth();

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

  const otherUserId =
    conversation.user1_id === userId
      ? conversation.user2_id
      : conversation.user1_id;

  const otherUserName =
    conversation.user1_id === userId
      ? conversation.user2_name
      : conversation.user1_name;

  const otherUserPic =
    conversation.user1_id === userId
      ? conversation.u2_pic
      : conversation.u1_pic;

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
    <div
      onClick={onSelect}
      className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer transition ${
        isActive ? "bg-gray-700" : ""
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold mr-3">
        {conversation?.u1_pic || conversation?.u2_pic ? (
          <img
            src={`${import.meta.env.VITE_API_URL}${otherUserPic}`}
            alt="User Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white text-sm">
            ?
          </div>
        )}
      </div>

      {/* Content - takes remaining space */}
      <div className="flex-1 min-w-0">
        {/* Name and Time row */}
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium text-white truncate">{otherUserName}</p>
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
            {timeAgo(conversation?.last_message_time) ?? ""}
          </span>
        </div>
        {/* Message row */}
        <p className="text-sm text-gray-400 truncate">
          {conversation.last_message}
        </p>
      </div>
    </div>
  );
}

export default ChatList;
