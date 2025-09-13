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
import PostEdit from "./pages/PostEdit.jsx";
import AllPosts from "./pages/AllPosts.jsx";

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
            <Route path="/allposts" element={<AllPosts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/postedit" element={<PostEdit />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
