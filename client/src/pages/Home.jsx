/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import CompactPostCard from "@/components/posts/CompactPostCard";
import {
  Users,
  CalendarDays,
  MessageCircleMore,
  ChartLine,
} from "lucide-react";
import TextType from "../components/ui/TextType";
import EventCard from "@/components/events/EventCard";

function Home() {
  const [details, setDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, logout, loading } = useAuth();

  useEffect(() => {
    const getDetails = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDetails(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          window.location.href = "/";
        } else setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    if (token) getDetails();
  }, [token]);

  // ---------- Loading Skeleton ----------
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          {/* Hero Skeleton */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-12">
            <div className="h-10 w-2/3 bg-gray-700 rounded mb-4"></div>
            <div className="h-5 w-1/3 bg-gray-700 rounded mb-6"></div>
            <div className="h-9 w-40 bg-gray-700 rounded mx-auto"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl p-6 shadow-md flex justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-gray-700 rounded"></div>
                  <div className="h-7 w-12 bg-gray-700 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Two Column Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl shadow-md h-[600px] p-6 space-y-6"
              >
                <div className="h-6 w-1/3 bg-gray-700 rounded"></div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-24 bg-gray-700 rounded-xl"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900/80 to-gray-900" />
          <div className="relative z-10 p-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
              <TextType
                text={`Welcome to ${
                  details
                    ? `${details.neighborhoodName}, ${details.neighborhoodCity}`
                    : "Your Neighborhood"
                }`}
                typingSpeed={70}
                pauseDuration={1000}
                showCursor={true}
                deletingSpeed={10}
                cursorCharacter="|"
                loop={true}
                startOnVisible={true}
              />
            </h1>
            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              Connect with neighbors, discover local events, and build a
              stronger community together.
            </p>
            <div className="flex justify-center">
              <Link
                to={"/events"}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium text-white shadow transition"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Neighbors",
              value: details.neighborsCount,
              icon: <Users />,
              color: "bg-blue-700",
              link: "/profile",
            },
            {
              label: "Posts This Month",
              value: details.thisMonthPostsCount,
              icon: <ChartLine />,
              color: "bg-green-700",
              link: "/feed",
            },
            {
              label: "Events This Week",
              value: details.nextWeekEventsCount,
              icon: <CalendarDays />,
              color: "bg-orange-700",
              link: "/events",
            },
            {
              label: "Conversations",
              value: details.conversationsCount,
              icon: <MessageCircleMore />,
              color: "bg-purple-700",
              link: "/chats",
            },
          ].map((item, i) => {
            const CardContent = (
              <div className="bg-gray-800 rounded-xl p-6 shadow-md flex items-center justify-between hover:bg-gray-750 transition">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                  <p className="text-3xl font-bold text-white">
                    {item.value ?? "0"}
                  </p>
                </div>
                <div
                  className={`${item.color} p-3 rounded-lg shadow text-white`}
                >
                  {item.icon}
                </div>
              </div>
            );
            return item.link ? (
              <Link key={i} to={item.link}>
                {CardContent}
              </Link>
            ) : (
              <div key={i}>{CardContent}</div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="bg-gray-800 rounded-xl shadow-md flex flex-col">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <Link
                to={"/feed"}
                className="text-blue-400 hover:text-blue-500 font-medium text-sm"
              >
                View All
              </Link>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[580px] scrollbar-thin scrollbar-thumb-gray-700">
              {details?.recentPosts?.length > 0 ? (
                details.recentPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-900 rounded-xl p-3 shadow border border-gray-700"
                  >
                    <CompactPostCard post={post} />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No recent posts
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-800 rounded-xl shadow-md flex flex-col">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
              <Link
                to={"/events"}
                className="text-blue-400 hover:text-blue-500 font-medium text-sm"
              >
                View All
              </Link>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[580px] scrollbar-thin scrollbar-thumb-gray-700">
              {details?.upcomingEvents?.length > 0 ? (
                details.upcomingEvents.map((event) => (
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
        </div>
      </div>
    </div>
  );
}

export default Home;

{
  /* Right Column - Quick Actions / Upcoming Events */
}
// <div className="space-y-6">
//   <div className="bg-gray-800 rounded-xl p-6 shadow-md">
//     <h3 className="text-lg font-bold text-white mb-4">
//       Quick Actions
//     </h3>
//     <div className="space-y-3">
//       <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg transition-colors">
//         <div className="bg-green-700 p-2 rounded-lg">
//           <svg
//             className="w-4 h-4 text-green-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//             />
//           </svg>
//         </div>
//         <span className="font-medium text-white">Find Neighbors</span>
//       </button>
//     </div>
//   </div>
// </div>
