import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import CreatePostPage from "./pages/CreatePostPage";
import FriendsPage from "./pages/FriendsPage";
import UserSearchPage from "./pages/UserSearchPage";
import ChatPage from "./pages/ChatPage";
import ConversationListPage from "./pages/ConversationListPage";
import Protected from "./components/Protected";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />

        {/* *******************all protected routes************************************ */}
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />
        <Route
          path="/create-post"
          element={
            <Protected>
              <CreatePostPage />
            </Protected>
          }
        />
        <Route
          path="/friends"
          element={
            <Protected>
              <FriendsPage />
            </Protected>
          }
        />
        <Route
          path="/search"
          element={
            <Protected>
              <UserSearchPage />
            </Protected>
          }
        />
        <Route
          path="/messages"
          element={
            <Protected>
              <ConversationListPage />
            </Protected>
          }
        />
        <Route
          path="/chat/:otherUserId"
          element={
            <Protected>
              <ChatPage />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
