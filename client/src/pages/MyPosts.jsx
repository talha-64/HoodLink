/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { React, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { CirclePlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { Link } from "react-router-dom";
import PostCard from "@/components/posts/PostCard";

function Events() {
  const { toast } = useToast();
  const { token, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [reload, setReload] = useState(false);

  const [tab, setTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [lastSearch, setLastSearch] = useState("");
  // const [images, setimages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    images: [],
  });

  // Search Logic

  const handleSearchClick = (e) => {
    e.preventDefault();

    const trimmedInput = searchInput.trim();

    if (trimmedInput === "" || trimmedInput === lastSearch) {
      setLastSearch("");
      getPosts(tab);
    } else {
      setLastSearch(trimmedInput);
      searchPost(trimmedInput);
    }
  };

  const searchPost = async (query) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/searchMyPosts${
          query ? `?q=${query}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts(res.data.posts);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        if (err.response && err.response.data) {
          setError(err.response.data.error || err.response.message);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetching Events logic

  const getPosts = async (filter = "") => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/myPosts${
          filter ? `?filter=${filter}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts(res.data.posts);
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
    } finally {
      setIsLoading(false);
    }
  };

  //Create Post logic

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("category", formData.category);

    formData.images.forEach((img) => {
      data.append("images", img);
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/post`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: res.data.message,
        duration: 3000,
      });
      setFormData({
        title: "",
        content: "",
        category: "",
      });
      getPosts(tab);
    } catch (err) {
      if (err?.status === 401) {
        logout();
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

  const triggerReload = () => setReload((prev) => !prev);

  // Effect hooks

  useEffect(() => {
    if (token) {
      getPosts(tab);
    }
  }, [token, refresh, reload]);

  useEffect(() => {
    setSearchInput("");
    getPosts(tab);
  }, [tab]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.06)] border border-gray-700">
          <div className="animate-pulse flex items-start gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-700 rounded-2xl"></div>
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Grid of Small Loading Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-gray-700 animate-pulse"
            >
              <div className="h-40 bg-gray-700 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-4">
      {/* Header Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
          {/* Top Row: Title + Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Neighborhood Posts
              </h1>
              <p className="text-md text-gray-400">
                Stay connected with your neighborhood
              </p>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search events..."
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchClick(e);
                  }
                }}
                className="w-full md:w-64 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              <button
                onClick={handleSearchClick}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </div>
          <Accordion
            className="bg-blue-700 transition rounded-2xl px-4 shadow-md"
            type="single"
            collapsible
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>Create a Post</AccordionTrigger>
              <AccordionContent>
                <form
                  onSubmit={handleSubmit}
                  className="max-w-5xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md space-y-4"
                >
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Create post
                  </h2>

                  {/* Container flex: vertical on mobile, horizontal on md+ */}
                  <div className="flex flex-col md:flex-row md:space-x-6 md:space-y-0 space-y-4">
                    {/* Left side: Title and Description, stacked vertically */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-gray-300 mb-1"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Post Title"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="content"
                          className="block text-gray-300 mb-1"
                        >
                          Content
                        </label>
                        <textarea
                          id="content"
                          name="content"
                          value={formData.content}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Post content"
                        ></textarea>
                      </div>

                      <div>
                        <label
                          htmlFor="category"
                          className="block text-gray-300 mb-1"
                        >
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Event Description"
                        >
                          <option value="">--Please choose a category--</option>
                          <option value="news">News</option>
                          <option value="lost_and_found">Lost and Found</option>
                          <option value="help_request">Help_Request</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="images"
                          className="text-sm font-medium text-neutral-300"
                        >
                          Profile Picture
                        </label>
                        <input
                          accept="image/*"
                          type="file"
                          id="images"
                          name="images"
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              images: Array.from(e.target.files),
                            }));
                          }}
                          className="bg-gray-900 text-white border-neutral-700 file:text-neutral-300 focus:border-neutral-500 focus:ring-0 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded transition"
                  >
                    Submit
                  </button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Events Section (min screen height, responsive grid) */}
      <div className="max-w-5xl mx-auto min-h-[calc(100vh-220px)]">
        {/* Adjust offset if needed */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700">
          <Tabs
            defaultValue="allPosts"
            value={tab}
            onValueChange={setTab}
            className="w-full"
          >
            <div className="md:flex justify-between">
              {/* Tabs */}
              <TabsList className="bg-gray-800 text-white border rounded-lg space-x-2 mb-12 md:mb-6 grid grid-cols-2 grid-rows-2 gap-11 md:flex ">
                <TabsTrigger
                  value="all"
                  className="px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow rounded-md transition"
                >
                  All Posts
                </TabsTrigger>
                <TabsTrigger
                  value="news"
                  className="px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow rounded-md transition"
                >
                  News
                </TabsTrigger>
                <TabsTrigger
                  value="lost_and_found"
                  className="px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow rounded-md transition"
                >
                  Lost and found
                </TabsTrigger>
                <TabsTrigger
                  value="help_request"
                  className="px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow rounded-md transition"
                >
                  Help request
                </TabsTrigger>
              </TabsList>
              <Link
                className={
                  "mb-6 md:mb-0 h-10 px-4 text-sm flex items-center justify-center bg-blue-600 text-white rounded-md transition"
                }
                to={"/feed"}
              >
                Neighborhood Posts
              </Link>
            </div>

            {/* Tab Content Wrapper */}
            <div className="w-full">
              {/* All Events Tab */}
              <TabsContent value="all">
                {posts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-900 rounded-xl p-4 shadow border border-gray-700"
                      >
                        <PostCard
                          post={post}
                          allowControls={true}
                          onReload={triggerReload}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No posts available
                  </div>
                )}
              </TabsContent>

              {/* This Week */}
              <TabsContent value="news">
                {posts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-900 rounded-xl p-4 shadow border border-gray-700"
                      >
                        <PostCard
                          post={post}
                          allowControls={true}
                          onReload={triggerReload}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No posts available
                  </div>
                )}
              </TabsContent>

              {/* Next Week */}
              <TabsContent value="lost_and_found">
                {posts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-900 rounded-xl p-4 shadow border border-gray-700"
                      >
                        <PostCard
                          post={post}
                          allowControls={true}
                          onReload={triggerReload}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No posts available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="help_request">
                {posts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-900 rounded-xl p-4 shadow border border-gray-700"
                      >
                        <PostCard
                          post={post}
                          allowControls={true}
                          onReload={triggerReload}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No posts available
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Events;
