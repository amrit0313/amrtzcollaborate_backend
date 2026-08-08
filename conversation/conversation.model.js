import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        deletedAt: {
          type: Date,
          default: null,
        },
        lastReadAt: {
          type: Date,
          default: null,
        },
        pinned: {
          type: Boolean,
          default: false,
        },
      },
    ],
    lastMessage: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;
