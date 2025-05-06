import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  userId: string;
  username: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const PostSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },
    imageUrl: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    isLiked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>("Post", PostSchema);
