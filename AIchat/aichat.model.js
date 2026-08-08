import mongoose, { Types } from "mongoose";

const AichatSchema =new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    conversationId: {
      type: String,
    },
    message: {
      type: String,
    },
    content: {
      type: String,
    },
  },
  { timestamps: true },
);
const Ai = mongoose.model("Ai", AichatSchema);
export default Ai;
