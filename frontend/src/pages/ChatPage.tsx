// client/src/pages/ChatPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chat from "../components/Chat";

interface User {
  _id: string;
  username: string;
  email: string;
}

const ChatPage: React.FC = () => {
  // Extract the other user's ID from the URL.
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const navigate = useNavigate();

  // State to store the other user's information
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assume currentUserId is available in localStorage after login.
  const currentUserId = localStorage.getItem("userId") || "user1";

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUserId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/profile/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch user information");
        } else {
          setOtherUser(data.user);
        }
      } catch (err) {
        setError("An error occurred while fetching user information");
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  if (!otherUserId) {
    return <p>Error: No conversation selected.</p>;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
        <button
          onClick={() => navigate("/messages")}
          style={{
            padding: "10px 16px",
            backgroundColor: "#0084ff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            overflow: "hidden",
            marginRight: "16px",
          }}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${
              otherUser?.username || otherUserId
            }&background=random`}
            alt={otherUser?.username || otherUserId}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <h2
            style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600" }}
          >
            {otherUser?.username || "Loading..."}
          </h2>
          <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
            {otherUser?.email || ""}
          </p>
        </div>
      </div>

      {/* Pass the IDs to our Chat component so it can join the proper room */}
      <Chat
        currentUserId={currentUserId}
        otherUserId={otherUserId}
        otherUsername={otherUser?.username || ""}
      />
    </div>
  );
};

export default ChatPage;
