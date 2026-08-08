import userService from "./user.service.js";
import { hashPassword, comparePassword } from "../auth/auth.service.js";

async function getProfile(req, res) {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch profile", detail: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await userService.updateById(req.user.id, req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Update failed", detail: err.message });
  }
}

// different from auth's resetPassword: user is already logged in,
// must confirm current password rather than using an email token
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword required" });
    }

    const user = await userService.findByIdWithPassword(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await comparePassword(currentPassword, user.password);
    if (!match)
      return res.status(401).json({ error: "Current password incorrect" });

    user.password = await hashPassword(newPassword);
    user.refreshToken = undefined; // force re-login on other devices
    await user.save();

    res.json({ message: "Password changed" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Password change failed", detail: err.message });
  }
}

async function deleteAccount(req, res) {
  try {
    const user = await userService.deleteById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed", detail: err.message });
  }
}

// admin only
async function listUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await userService.listAll({ page, limit });
    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to list users", detail: err.message });
  }
}

async function searchUsers(req, res) {
  try {
    const q = String(req.query.q ?? req.query.username ?? "");
    const limit = Number(req.query.limit) || 8;
    const users = await userService.searchByUsername(q, {
      limit,
      excludeUserId: req.user.id,
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to search users", detail: err.message });
  }
}

async function getUserById(req, res) {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch user", detail: err.message });
  }
}

export {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  listUsers,
  searchUsers,
  getUserById,
};
