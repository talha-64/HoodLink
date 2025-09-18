import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoutes from "./components/layouts/ProtectedRoutes.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";

import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home.jsx";
import Feed from "./pages/Feed.jsx";
import Events from "./pages/Events.jsx";
import Chat from "./pages/Chat.jsx";
import Profile from "./pages/Profile.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import MyEvents from "./pages/MyEvents.jsx";

import { Toaster } from "@/components/ui/toaster";

const MainLayout = () => (
  <>
    <Navbar />
    <div className="pt-16">
      <Outlet />
    </div>
  </>
);

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/events" element={<Events />} />
            <Route path="/chats" element={<Chat />} />
            <Route path="/myposts" element={<MyPosts />} />
            <Route path="/myevents" element={<MyEvents />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
