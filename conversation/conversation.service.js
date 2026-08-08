import Conversation from "./conversation.model.js";

const populateConversation = (query) =>
  query.populate("participants.user", "name email").sort({
    lastMessageAt: -1,
    updatedAt: -1,
  });

const normalizeParticipant = (participant, currentUserId) => {
  const user = participant?.user;
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    username: user.email?.split("@")[0] ?? user.name,
    isCurrentUser: user._id.toString() === currentUserId.toString(),
  };
};

const normalizeConversation = (conversation, currentUserId) => {
  const participants = (conversation.participants ?? [])
    .map((participant) => normalizeParticipant(participant, currentUserId))
    .filter(Boolean);

  const partner =
    participants.find((participant) => !participant.isCurrentUser) ??
    participants[0] ??
    null;

  return {
    id: conversation._id.toString(),
    participants,
    partner,
    lastMessage: conversation.lastMessage ?? null,
    lastMessageAt: conversation.lastMessageAt ?? conversation.updatedAt ?? null,
  };
};

const getConversations = async (userId) => {
  const conversations = await populateConversation(
    Conversation.find({ "participants.user": userId }),
  );

  return conversations.map((conversation) =>
    normalizeConversation(conversation, userId),
  );
};

const createConversation = async (userId, receiverId) => {
  let conversation = await Conversation.findOne({
    "participants.user": { $all: [userId, receiverId] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [{ user: userId }, { user: receiverId }],
      lastMessage: null,
      lastMessageAt: new Date(),
    });
  }

  const populated = await populateConversation(
    Conversation.findById(conversation._id),
  );

  return normalizeConversation(populated, userId);
};

const deleteConversation = async (id) => {
  return await Conversation.findByIdAndDelete(id);
};

const touchConversation = async (conversationId, content) => {
  return Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessage: content,
      lastMessageAt: new Date(),
    },
    { new: true },
  );
};

const addParticipants = async (users) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [users] },
  });
  if (conversation) return conversation;
  return await Conversation.create({
    participants: [users],
    lastMessage,
    lastMessageAt,
  });
};

// const removeParticipants = async (id) => {
//   let;
// };

export {
  getConversations,
  createConversation,
  touchConversation,
  addParticipants,
  deleteConversation,
};
