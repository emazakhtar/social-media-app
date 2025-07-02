// server/src/routes/conversations.ts
import { Router } from "express";
import Conversation from "../models/Conversation";
import { protect } from "../middlewares/authMiddleware";
const router = Router();

// List all conversations involving current user
router.get("/", protect, async (req, res) => {
  console.log(req.query);
  const userId = req.user!.id;
  const convos = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "username") // Populate participant information
    .sort({ updatedAt: -1 });
  res.json({ conversations: convos });
});

export default router;
