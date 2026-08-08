import mongoose, { Types } from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true, // you'll query by this constantly
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }, // gives you createdAt as sentAt equivalent, indexed sort key
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
