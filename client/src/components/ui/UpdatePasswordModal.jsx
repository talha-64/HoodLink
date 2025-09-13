import React, { useState } from "react";
import { CircleX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const UpdatePasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const { toast } = useToast();

  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      toast({
        variant: "destructive",
        title: `${err.response?.data?.message || "Something went wrong"}`,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
        duration: 3000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ease-out opacity-0 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-md border border-gray-700 w-full max-w-md p-6 transform transition-all duration-300 ease-out scale-95 animate-scaleIn">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <CircleX />
          </button>
        </div>

        {/* Modal Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-2">{error}</p>}

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Old Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-400 hover:bg-blue-500 text-white transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
