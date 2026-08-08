import User from "../users/user.model.js";

const toPublicUser = (user) => {
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    username: user.email?.split("@")[0] ?? user.name,
    role: user.role,
  };
};

async function findById(id) {
  return User.findById(id);
}

async function findByIdWithPassword(id) {
  return User.findById(id).select("+password");
}

async function updateById(id, updates) {
  // whitelist fields — never let name/email/role updates slip in password or tokens
  const allowed = ["name", "email"];
  const safeUpdates = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }
  return User.findByIdAndUpdate(id, safeUpdates, {
    new: true,
    runValidators: true,
  });
}

async function deleteById(id) {
  return User.findByIdAndDelete(id);
}

async function listAll({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return { users, total, page, pages: Math.ceil(total / limit) };
}

async function searchByUsername(query, { limit = 8, excludeUserId } = {}) {
  if (!query.trim()) return [];

  const regex = new RegExp(
    query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  const users = await User.find({
    ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    $or: [{ name: regex }, { email: regex }],
  })
    .limit(limit)
    .select("name email role");

  return users.map((user) => toPublicUser(user));
}

const userService = {
  findById,
  findByIdWithPassword,
  updateById,
  deleteById,
  listAll,
  searchByUsername,
};

export default userService;
