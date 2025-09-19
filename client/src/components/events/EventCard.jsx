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
import EditEventForm from "./EditEventForm";

function EventCard({ event, allowControls, onReload }) {
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    event_Date: "",
    Location: "",
  });

  //Date Format
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

  // Handle Delete
  const handleDelete = async (e, id) => {
    e.preventDefault();
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`,
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
        window.location.href = "/";
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

  // Handle Edit
  const manageEdit = (event) => {
    setIsEditing((prev) => !prev);
    setFormData({
      Title: event?.title,
      Description: event?.description,
      event_Date: "",
      Location: event?.location,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: res.data.message,
        duration: 3000,
      });
      setFormData({
        Title: "",
        Description: "",
        event_Date: "",
        Location: "",
      });
      onReload();
    } catch (err) {
      if (err?.status === 401) {
        logout();
        window.location.href = "/";
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
    <div key={event?.id} className="space-y-3">
      {/* Header: Avatar + Organizer + Posted time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`${event?.profile_pic}`}
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
        {allowControls ? (
          <div className="flex items-center gap-4 mr-4">
            <button onClick={(e) => handleDelete(e, event.id)}>
              <Trash size={20} color="#ea3e3e" />
            </button>
            <button onClick={() => manageEdit(event)}>
              <Pencil size={20} />
            </button>
          </div>
        ) : null}
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

      {/* Edit Form Accordion */}
      {allowControls ? (
        <Accordion
          className="bg-gray-900 transition rounded-2xl shadow-md"
          type="single"
          value={isEditing ? "edit" : null}
          collapsible
        >
          <AccordionItem value="edit">
            <AccordionContent>
              <EditEventForm
                formData={formData}
                handleChange={handleChange}
                handleEditSubmit={handleEditSubmit}
                eventId={event?.id}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
}

export default EventCard;
