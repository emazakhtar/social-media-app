import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  receiverId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
