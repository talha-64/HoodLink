/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import {
  Home,
  Users,
  Calendar,
  MessageCircle,
  User,
  File,
  Plus,
  Menu,
  X,
  Edit,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAuth();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navLinks = [
    { name: "Home", path: "/home", icon: <Home size={18} /> },
    { name: "Feed", path: "/feed", icon: <Users size={18} /> },
    { name: "Events", path: "/events", icon: <Calendar size={18} /> },
    { name: "Chats", path: "/chats", icon: <MessageCircle size={18} /> },
    { name: "My Posts", path: "/allposts", icon: <File size={18} /> },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900/95 backdrop-blur-md text-white shadow-[0_0_15px_rgba(255,255,255,0.12)] px-6 py-3 flex justify-between items-center border-b border-neutral-800">
      {/* Logo / Brand */}
      <Link
        to="/home"
        className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-800/70 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)] transition"
      >
        <Home size={20} className="text-blue-400" />
        <span className="text-lg font-semibold tracking-tight">HoodLink</span>
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              isActive(link.path)
                ? "bg-gray-800 text-white font-semibold "
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50 hover:shadow-gray-800"
            }`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </div>

      {/* Right Side Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        <button className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm border border-neutral-700 bg-neutral-800/70 hover:bg-neutral-700 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)] transition">
          <Plus size={18} className="text-blue-400" />
        </button>

        {/* User Profile Section (Desktop) */}
        <Link
          to="/profile"
          className={`flex items-center space-x-3 px-2 pr-3 py-1 rounded-md transition ${
            isActive("/profile")
              ? "bg-gray-800 text-white font-semibold "
              : "hover:bg-neutral-800/50 text-neutral-400 hover:text-white "
          }`}
        >
          <img
            src={
              user && user.profile_pic
                ? `${import.meta.env.VITE_API_URL}${user.profile_pic}`
                : `${
                    import.meta.env.VITE_API_URL
                  }/uploads/profile_pictures/default-avatar.webp`
            }
            alt="User Avatar"
            className="w-9 h-9 rounded-lg border border-neutral-700 shadow-[0_0_6px_rgba(255,255,255,0.1)]"
          />
          <span className="text-sm font-semibold">{user.full_name}</span>
        </Link>

        <Link
          onClick={logout}
          className="flex items-center space-x-1 text-sm px-3 py-1 rounded-md hover:bg-neutral-800/50 hover:shadow-[0_0_6px_rgba(255,255,255,0.12)] transition"
        >
          <LogOut size={18} className="text-red-400" />
          <span>Logout</span>
        </Link>
      </div>

      {/* Mobile Dropdown Toggle */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="text-white hover:text-blue-400 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 w-full bg-neutral-900/95 backdrop-blur-md text-white shadow-[0_0_15px_rgba(255,255,255,0.12)] border-t border-neutral-800 z-[9999] md:hidden">
          <div className="flex flex-col px-4 py-2 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-2 py-2 px-3 rounded-md text-sm transition ${
                  isActive(link.path)
                    ? "bg-neutral-800/70 text-white font-semibold shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50 hover:shadow-[0_0_6px_rgba(255,255,255,0.12)]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            <hr className="border-neutral-700" />

            <button className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm bg-neutral-800/70 hover:bg-neutral-700 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)] transition">
              <Plus size={18} className="text-blue-400" />
              <span>Create Post</span>
            </button>

            <Link
              to="/profile"
              className={`flex items-center space-x-2 py-2 px-3 rounded-md transition ${
                isActive("/profile")
                  ? "bg-neutral-800/70 text-white font-semibold shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50 hover:shadow-[0_0_6px_rgba(255,255,255,0.12)]"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <img
                src={
                  user && user.profile_pic
                    ? `${import.meta.env.VITE_API_URL}${user.profile_pic}`
                    : `${
                        import.meta.env.VITE_API_URL
                      }/uploads/profile_pictures/default-avatar.webp`
                }
                alt="User Avatar"
                className="w-9 h-9 rounded-lg border border-neutral-700 shadow-[0_0_6px_rgba(255,255,255,0.1)]"
              />
              <span className="text-sm font-semibold">{user.full_name}</span>
            </Link>

            <Link
              onClick={logout}
              className="flex items-center space-x-1 text-sm px-3 py-2 rounded-md hover:bg-neutral-800/50 hover:shadow-[0_0_6px_rgba(255,255,255,0.12)] transition"
            >
              <LogOut size={18} className="text-red-400" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
