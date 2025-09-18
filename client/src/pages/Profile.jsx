/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Edit, Lock, Trash2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import EventCard from "@/components/events/EventCard";
import EditProfileModal from "@/components/ui/EditProfileModal";
import DeleteAccountModal from "@/components/ui/DeleteAccountModal.jsx";
import UpdatePasswordModal from "@/components/ui/UpdatePasswordModal.jsx";

import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToastAction } from "@/components/ui/toast";

import { MessageCircle } from "lucide-react";

function Profile() {
  const { toast } = useToast();
  const { token, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [activeModal, setActiveModal] = useState(null);

  const [neighbors, setNeighbors] = useState([]);
  const [neighborsError, setNeighborsError] = useState("");
  const fileInputRef = React.useRef(null);
  const [newMessage, setNewMessage] = useState("");

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const handleProfileSubmit = async (formData) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedUser = res.data.user;

      if (updatedUser.neighborhood_id !== profile.user.neighborhood_id) {
        // Force logout immediately
        logout();
        // Optionally redirect to login page
        window.location.href = "/";
        return;
      }

      updateUser({
        full_name: res.data.user.full_name,
        profile_pic: res.data.user.profile_pic,
      });
      setRefresh((prev) => prev + 1);
      toast({
        title: "Personal Info",
        description: "Personal Info updated successfully",
        duration: 3000,
      });
    } catch (err) {
      throw err;
    }

    setActiveModal(false);
  };

  const handlePasswordSubmit = async (formData) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/password`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: "Update Password",
        description: "Password updated successfully",
        duration: 3000,
      });
    } catch (err) {
      throw err;
    }

    setActiveModal(false);
  };

  const handleAccountSubmit = async (password) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/user`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });
      logout();
    } catch (err) {
      throw err;
    }

    setActiveModal(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profilePhoto`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile((prev) => ({
        ...prev,
        user: { ...prev.user, profile_pic: res.data.user.profile_pic },
      }));
      updateUser({ profile_pic: res.data.user.profile_pic });

      toast({
        title: "Profile Photo",
        description: "Profile Photo updated successfully",
        duration: 3000,
      });
    } catch (err) {
      // console
    }
  };

  const sendMessage = async (neighborId) => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/send`,
        { receiverId: neighborId, messageText: newMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage("");
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
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
    const getProfile = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
        } else {
          setError(err.response?.data?.message || "Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      getProfile();
    }

    const getNeighbors = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/neighbors`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNeighbors(res.data.neighbors);
      } catch (err) {
        setNeighborsError(
          err.response?.data?.message || "Something went wrong"
        );
      }
    };
    getNeighbors();
  }, [token, refresh]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-neutral-900/95 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.08)] border border-neutral-800">
          <div className="animate-pulse flex items-start space-x-4">
            <div className="w-32 h-32 bg-neutral-700 rounded-2xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-neutral-700 rounded w-1/3"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={
                  profile?.user?.profile_pic
                    ? `${import.meta.env.VITE_API_URL}${
                        profile.user.profile_pic
                      }`
                    : `${
                        import.meta.env.VITE_API_URL
                      }/uploads/profile_pictures/default-avatar.webp`
                }
                alt="User Avatar"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-gray-700 shadow-md object-cover cursor-pointer"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
              />
              <div
                className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40 text-white text-sm rounded-2xl cursor-pointer"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
              >
                Change Photo
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              <h1 className="text-2xl font-bold text-white text-center sm:text-left mb-1">
                {profile?.user?.full_name || "Loading..."}
              </h1>
              <p className="text-blue-300 text-sm mb-2 text-center sm:text-left">
                {profile?.user?.neighborhood_name}
              </p>

              <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-300 mb-4">
                <CalendarDays size={16} className="text-gray-400" />
                <span>
                  Joined{" "}
                  {profile?.user?.created_at &&
                    new Date(profile.user.created_at).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  onClick={() => openModal("editProfile")}
                  className="flex items-center space-x-1 px-3 py-1 border border-gray-700 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => openModal("updatePassword")}
                  className="flex items-center space-x-1 px-3 py-1 border border-gray-700 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition"
                >
                  <Lock size={16} />
                  <span>Password</span>
                </button>
                <button
                  onClick={() => openModal("deleteAccount")}
                  className="flex items-center space-x-1 px-3 py-1 border border-gray-700 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-sm text-red-400 transition"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {profile?.totalPostsCount || 0}
              </div>
              <div className="text-sm text-gray-300">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {profile?.recentEventsCount || 0}
              </div>
              <div className="text-sm text-gray-300">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {profile?.user?.conversation_count || 0}
              </div>
              <div className="text-sm text-gray-300">Conversations</div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2 space-y-6 bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">My recent events</h3>
              <Link
                to={"/myevents"}
                className="text-blue-400 hover:text-blue-500 text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-700">
              {profile?.userEvents?.length > 0 ? (
                profile.userEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-900 rounded-xl p-4 shadow border border-gray-700"
                  >
                    <EventCard event={event} />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No upcoming events
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
              <h3 className="font-bold text-white mb-4">Contact</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <div className="text-gray-400 font-semibold">Email</div>
                  <div className="text-white">
                    {profile?.user?.email || "Not available"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 font-semibold">Phone</div>
                  <div className="text-white">
                    {profile?.user?.phone || "Not available"}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Activity */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
              <h3 className="font-bold text-white mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-sm">Posts</span>
                  <span className="font-semibold text-blue-400">
                    {profile?.recentMonthPostsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-sm">Events</span>
                  <span className="font-semibold text-green-400">
                    {profile?.recentEventsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-sm">Comments</span>
                  <span className="font-semibold text-orange-400">
                    {profile?.recentCommentsCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Neighbors */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-700">
              <h3 className="font-bold text-white mb-4">Neighbors</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {neighbors && neighbors.length > 0 ? (
                  neighbors.map((neighbor) => (
                    <Accordion
                      key={neighbor.id}
                      className="bg-gray-900 transition rounded-xl shadow-md border border-gray-700"
                      type="single"
                      collapsible
                    >
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="w-full p-2 hover:bg-gray-800 rounded-lg flex items-center justify-between">
                          {/* Left side: Profile info */}
                          <div className="flex items-center space-x-3 w-full">
                            <img
                              src={
                                neighbor.profile_pic
                                  ? `${import.meta.env.VITE_API_URL}${
                                      neighbor.profile_pic
                                    }`
                                  : `/uploads/profile_pictures/default-avatar.webp`
                              }
                              alt="Profile"
                              className="w-8 h-8 rounded-full border border-gray-600 object-cover"
                            />
                            <div className="text-white text-sm font-medium truncate">
                              {neighbor.full_name || "User"}
                            </div>
                          </div>

                          <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500 " />
                        </AccordionTrigger>

                        <AccordionContent>
                          <div>
                            <label
                              htmlFor="message"
                              className="block text-gray-300 mb-1 text-sm"
                            >
                              Message
                            </label>
                            <input
                              type="text"
                              id="message"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Event your message"
                            />
                          </div>
                          <button
                            type="submit"
                            onClick={() => sendMessage(neighbor.id)}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition text-sm"
                          >
                            Send
                          </button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">
                    No neighbors found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditProfileModal
          isOpen={activeModal === "editProfile"}
          onClose={closeModal}
          onSubmit={handleProfileSubmit}
          userData={profile?.user}
        />
        <UpdatePasswordModal
          isOpen={activeModal === "updatePassword"}
          onClose={closeModal}
          onSubmit={handlePasswordSubmit}
        />
        <DeleteAccountModal
          isOpen={activeModal === "deleteAccount"}
          onClose={closeModal}
          onSubmit={handleAccountSubmit}
        />
      </div>
    </div>
  );
}

export default Profile;
