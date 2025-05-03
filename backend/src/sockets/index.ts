import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import Notification from "../models/Notification";
import Conversation from "../models/Conversation";

const onlineUsers = new Map<string, string>(); // userId -> socket.id

export const initializeSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

    socket.on("register", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on(
      "sendNotification",
      async (data: { receiverId: string; type: string; message: string }) => {
        try {
          // Store notification in database
          const notification = new Notification({
            receiverId: data.receiverId,
            type: data.type,
            message: data.message,
          });
          await notification.save();

          // Emit notification to receiver if online
          const receiverSocketId = onlineUsers.get(data.receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("notification", {
              ...data,
              id: notification._id,
            });
            console.log(
              `Notification sent to user ${data.receiverId} at socket ${receiverSocketId}`
            );
          }
        } catch (error) {
          console.error("Error storing notification:", error);
          socket.emit("error", "Failed to store notification");
        }
      }
    );

    socket.on(
      "chatMessage",
      async (data: {
        senderId: string;
        receiverId: string;
        roomId: string;
        text: string;
      }) => {
        try {
          // Store message in database
          const message = new Message({
            senderId: data.senderId,
            receiverId: data.receiverId,
            roomId: data.roomId,
            text: data.text,
          });
          await message.save();

          // Update conversation's last message
          await Conversation.findOneAndUpdate(
            { roomId: data.roomId },
            {
              participants: [data.senderId, data.receiverId],
              lastMessage: data.text,
            },
            { upsert: true }
          );

          // Emit message to room
          io.to(data.roomId).emit("newMessage", {
            ...data,
            _id: message._id,
            createdAt: message.createdAt,
          });
          console.log(
            `Message from ${data.senderId} in room ${data.roomId}: ${data.text}`
          );

          // Send notification to receiver if online and not the sender
          const receiverSocketId = onlineUsers.get(data.receiverId);
          console.log("Debug - Receiver Socket ID:", receiverSocketId);
          console.log("Debug - Current Socket ID:", socket.id);

          if (receiverSocketId && receiverSocketId !== socket.id) {
            console.log("Debug - Attempting to save notification");
            try {
              // Store notification in database
              const notification = new Notification({
                receiverId: data.receiverId,
                type: "chat",
                message: `New message from ${data.senderId}`,
              });
              console.log("Debug - Notification object created:", notification);
              await notification.save();
              console.log("Debug - Notification saved successfully");

              // Emit notification
              io.to(receiverSocketId).emit("notification", {
                receiverId: data.receiverId,
                type: "chat",
                message: `New message from ${data.senderId}`,
                id: notification._id,
              });
              console.log("Debug - Notification emitted to socket");
            } catch (error) {
              console.error("Debug - Error saving notification:", error);
            }
          } else {
            console.log(
              "Debug - Skipping notification: receiver offline or same as sender"
            );
          }
        } catch (error) {
          console.error("Error storing message:", error);
          socket.emit("error", "Failed to store message");
        }
      }
    );

    socket.on("disconnect", () => {
      onlineUsers.forEach((id, userId) => {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          console.log(
            `User ${userId} disconnected and removed from online users.`
          );
        }
      });
    });
  });
};
