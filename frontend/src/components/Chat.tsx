// client/src/components/Chat.tsx

import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import MessageList from "./MessageList"; // We'll create this component next.
import MessageInput from "./MessageInput"; // Already built in previous chapter.
import ChatNotification from "./ChatNotification"; // Already built.

interface ChatProps {
  currentUserId: string;
  otherUserId: string;
  otherUsername: string;
}

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  roomId: string;
  createdAt?: string;
  read: boolean; // true if the message has been read, false otherwise.
}

const Chat: React.FC<ChatProps> = ({
  currentUserId,
  otherUserId,
  otherUsername,
}) => {
  // Define a unique room ID by consistently combining the two user IDs.
  const roomId =
    currentUserId < otherUserId
      ? `${currentUserId}_${otherUserId}`
      : `${otherUserId}_${currentUserId}`;

  // Initialize the socket connection with the current user's ID.
  const socket = useSocket(currentUserId);

  // State to store the chat messages.
  const [messages, setMessages] = useState<Message[]>([]);
  // State for a temporary notification (for instance, when a new message is received).
  const [notification, setNotification] = useState<string>("");
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // fetching the chat messages using roomid
  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/history/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          setError(data.message || "Registration failed.");
        } else {
          setMessages(data.messages);
        }
      } catch (err) {
        setError("An error occurred during fetching conversations.");
      }
    };

    fetchAllMessages();
  }, [roomId]);

  // Once the socket is available, join the designated chat room.
  useEffect(() => {
    if (socket) {
      socket.emit("joinRoom", roomId);
      console.log(`Joined room: ${roomId}`);
    }
  }, [socket, roomId]);

  // Set up event listeners on the socket.
  useEffect(() => {
    if (!socket) return;

    // Listen for new chat messages.
    socket.on("newMessage", (data: any) => {
      // When a new message comes in, mark it as unread (read: false) before adding.
      setMessages((prev) => [...prev, { ...data, read: false }]);
    });

    // Listen for typing indicators
    socket.on("typing", (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === otherUserId) {
        setIsTyping(data.isTyping);
      }
    });

    // Listen for online status
    socket.on("userOnline", (data: { userId: string; isOnline: boolean }) => {
      if (data.userId === otherUserId) {
        setIsOnline(data.isOnline);
      }
    });

    // Listen for generic notifications (this might be used for chat notifications, although
    // we typically filter chat messages to the conversation window).
    socket.on("notification", (data: any) => {
      setNotification(`New message from ${data.senderId}: ${data.message}`);
      // Clear the temporary notification after 3 seconds.
      setTimeout(() => setNotification(""), 3000);
    });

    // Cleanup listeners on unmount.
    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("userOnline");
      socket.off("notification");
    };
  }, [socket, otherUserId]);

  // Function to send a message.
  const handleSendMessage = (text: string) => {
    if (socket) {
      // Construct the message data.
      const messageData = {
        senderId: currentUserId,
        receiverId: otherUserId,
        roomId,
        text,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Emit the chat message using our socket.
      socket.emit("chatMessage", messageData);

      // Since the current user is sending the message, mark it as read.
      setMessages((prev) => [...prev, { ...messageData, read: true }]);
    }
  };

  // Function to handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (socket) {
      socket.emit("typing", { userId: currentUserId, isTyping });
    }
  };

  // Callback to mark all messages as read. This is called when the user clicks on the message list.
  const markMessagesAsRead = () => {
    setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
    // Optionally, an API call (or a WebSocket call) can be made here to update the message read status in the database.
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: isOnline ? "#4CAF50" : "#ccc",
              marginRight: "8px",
            }}
          ></div>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        {isTyping && (
          <span
            style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}
          >
            {otherUsername} is typing...
          </span>
        )}
      </div>

      {/* Pass the messages and the callback to the MessageList component. */}
      <MessageList
        currentUserId={currentUserId}
        messages={messages}
        onMarkMessagesAsRead={markMessagesAsRead}
      />

      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />

      {notification && <ChatNotification message={notification} />}

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "12px",
            margin: "12px",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Chat;
