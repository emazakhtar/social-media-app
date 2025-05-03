// client/src/components/Navbar.tsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import {
  FaEnvelope,
  FaBell,
  FaUser,
  FaHome,
  FaUserFriends,
  FaSearch,
  FaPlus,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import styles from "./Navbar.module.css";

// Define a type for our notification object.
interface Notification {
  id: string; // Unique id for this notification.
  type: string; // E.g., "friend", "system", "chat".
  message: string;
  read: boolean;
  timestamp?: string;
}

const Navbar: React.FC = () => {
  // For this example, we assume the current user id is stored in localStorage.
  const currentUserId = localStorage.getItem("userId") || "unknownUser";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 2️⃣ Hook to redirect after logout
  const navigate = useNavigate();

  // 3️⃣ On mount, check localStorage for our token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Initialize a socket connection using our custom hook.
  const socket = useSocket(currentUserId);

  // ─────────── Message count state ───────────
  const [messageCount, setMessageCount] = useState<number>(0);

  // State to hold notifications and manage panel visibility.
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Compute count of unread notifications.
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Listen for incoming notifications via WebSocket.
  useEffect(() => {
    if (!socket) return;

    // The server will emit a "notification" event with a notification payload.
    const handleNotification = (data: {
      id: string;
      type: string;
      message: string;
      timestamp?: string;
    }) => {
      // Add new notification as unread.
      setNotifications((prev) => [
        {
          id: data.id,
          type: data.type,
          message: data.message,
          read: false, // New notification is unread.
          timestamp: data.timestamp,
        },
        ...prev,
      ]);
    };

    socket.on("notification", handleNotification);

    // Cleanup the listener on unmount.
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  interface UnreadCountResponse {
    count: number;
  }

  // ─────────── Fetch unread messages ───────────
  useEffect(() => {
    const fetchMessageCount = async () => {
      try {
        const res = await fetch(`/api/messages/unread-count`, {
          headers: { "Content-Type": "application/json" },
        });
        const data = (await res.json()) as UnreadCountResponse;
        setMessageCount(data.count);
      } catch (err) {
        console.error("Failed to fetch message count", err);
      }
    };
    fetchMessageCount();
  }, []); // run once on mount

  // Function to handle toggling the notification panel.
  const toggleNotificationPanel = () => {
    setShowNotifications((prev) => !prev);
    // If opening, mark all as read (alternatively, you could mark individual ones on click)
    if (!showNotifications) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <>
      <nav
        className={styles.navbar}
        style={{
          backgroundColor: isScrolled ? "rgba(51, 51, 51, 0.95)" : "#333",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backdropFilter: isScrolled ? "blur(10px)" : "none",
          boxShadow: isScrolled ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>
            <FaHome size={20} />
            <span>Home</span>
          </Link>
          <Link to="/profile" className={styles.navLink}>
            <FaUser size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/friends" className={styles.navLink}>
            <FaUserFriends size={20} />
            <span>Friends</span>
          </Link>
          <Link to="/search" className={styles.navLink}>
            <FaSearch size={20} />
            <span>Search</span>
          </Link>
          <Link to="/create-post" className={styles.navLink}>
            <FaPlus size={20} />
            <span>New Post</span>
          </Link>
        </div>

        <div className={styles.navActions}>
          <Link to="/messages" className={styles.navLink}>
            <div className={styles.iconContainer}>
              <FaEnvelope size={20} />
              {messageCount > 0 && (
                <span className={styles.badge}>{messageCount}</span>
              )}
            </div>
          </Link>

          <div
            className={styles.iconContainer}
            onClick={toggleNotificationPanel}
          >
            <FaBell size={20} />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </div>

          {isLoggedIn ? (
            <button onClick={handleLogout} className={styles.logoutButton}>
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login" className={styles.loginButton}>
              <FaSignInAlt size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {showNotifications && (
          <div className={styles.notificationPanel}>
            <h4>Notifications</h4>
            {notifications.length === 0 ? (
              <p className={styles.noNotifications}>No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`${styles.notificationItem} ${
                    notif.read ? styles.read : styles.unread
                  }`}
                >
                  <p>{notif.message}</p>
                  {notif.timestamp && (
                    <small>{new Date(notif.timestamp).toLocaleString()}</small>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </nav>
      <div className={styles.navbarSpacer}></div>
    </>
  );
};

export default Navbar;
