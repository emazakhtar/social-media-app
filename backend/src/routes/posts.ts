import { Router, Request, Response } from "express";
import Post, { IPost } from "../models/Post";
import { upload } from "../middlewares/upload";
import { protect } from "../middlewares/authMiddleware"; // Import middleware
import User from "../models/User";

const router = Router();

// Create a post (protected route)
router.post(
  "/",
  protect,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { content, userId } = req.body;
      if (!content || !userId) {
        return res
          .status(400)
          .json({ message: "Content and userId are required." });
      }

      // Get user's username
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      let imageUrl;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const post: IPost = new Post({
        userId,
        username: user.username,
        content,
        imageUrl,
        likes: 0,
        comments: 0,
        isLiked: false,
      });
      await post.save();
      res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Retrieve posts (protected route)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter = { content: { $regex: search, $options: "i" } };
    }
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
