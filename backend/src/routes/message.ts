// server/src/routes/chat.ts

import { Router, Request, Response } from "express";
import Message, { IMessage } from "../models/Message";
import Conversation from "../models/Conversation";
import { protect } from "../middlewares/authMiddleware";
import Post from "../models/Post";

const router = Router();

// GET /api/chat/history/:roomId
// This endpoint retrieves the chat history for a given room.
router.get("/history/:roomId", async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    // Find all messages that match the roomId, sorted by creation time (ascending).
    const messages: IMessage[] = await Message.find({ roomId }).sort({
      createdAt: 1,
    });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Create a message (protected route)
router.post(
  "/history/:roomId",
  protect,
  async (req: Request, res: Response) => {
    try {
      console.log("message body", req.body);
      const { text, senderId, receiverId } = req.body;
      if (!text || !senderId || !receiverId) {
        return res
          .status(400)
          .json({ message: "Content and userId are required." });
      }

      // Create the message
      const message: IMessage = new Message({ text, senderId, receiverId });
      await message.save();

      // Update or create conversation
      const roomId = `${senderId}_${receiverId}`;
      const conversation = await Conversation.findOneAndUpdate(
        { roomId },
        {
          roomId,
          participants: [senderId, receiverId],
          lastMessage: text,
        },
        { upsert: true, new: true }
      );
      console.log("conversation", conversation);
      res.status(201).json({
        success: "Message and conversation updated successfully",
        message,
        conversation,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// GET /api/messages/unread-count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const userId = req.user!.id; // set by authMiddleware
    // Count messages where recipient is the current user and read flag is false
    const count = await Message.countDocuments({ to: userId, read: false });
    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
