/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { React, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ArrowLeft } from "lucide-react";

function ChatBox({ details, onMessageSent, onBack }) {
  const { token, logout } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [newMessage, setNewMessage] = useState("");

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

  const getConversationsMessages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chat/${details.id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessagesList(res.data.messages);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = "/";
      } else {
        if (err.response && err.response.data) {
          setError(err.response.data.error || err.response.data.message);
          toast({
            variant: "destructive",
            title: err.response.data.error || err.response.data.message,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
            duration: 3000,
          });
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    }
  };

  useEffect(() => {
    getConversationsMessages();
  }, [details.id, token]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // prevent empty messages
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/send`,
        { receiverId: details.userId, messageText: newMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage("");
      getConversationsMessages();
      if (onMessageSent) onMessageSent();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = "/";
      } else {
        if (err.response && err.response.data) {
          setError(err.response.data.error || err.response.data.message);
          toast({
            variant: "destructive",
            title: err.response.data.error || err.response.data.message,
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
        <div className="flex items-center space-x-3">
          {/* Back button only on mobile */}
          {onBack && (
            <button
              className="md:hidden mr-2 text-gray-400 hover:text-white"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
            {details?.pic ? (
              <img
                src={`${details.pic}`}
                alt="User Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-white text-sm">
                ?
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{details?.name}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messagesList.length > 0 ? (
          messagesList.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1 ${
                msg.sender_id === userId ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-md ${
                  msg.sender_id === userId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.message_text}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No messages yet</p>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          onClick={sendMessage}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
