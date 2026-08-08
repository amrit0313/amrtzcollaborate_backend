import passport from "../config/passport.js";
import User from "../users/user.model.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashToken,
} from "./auth.service.js";

async function register(req, res) {
  try {
    console.log("camehere");
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", detail: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    // password is select:false in schema, must explicitly include it
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", detail: err.message });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken required" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    const user = await User.findById(payload.sub).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      // token reuse or mismatch — reject
      return res.status(401).json({ error: "Refresh token not recognized" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // rotate: invalidate old refresh token, store new one
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ error: "Refresh failed", detail: err.message });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: "refreshToken required" });

    const user = await User.findOne({ refreshToken }).select("+refreshToken");
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed", detail: err.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // don't leak whether the email exists
    if (!user)
      return res.json({
        message: "If that email exists, a reset link was sent",
      });

    const { rawToken, hashedToken } = generateResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // TODO: send rawToken via email service, not the DB hash
    // emailService.sendResetLink(user.email, rawToken);

    res.json({
      message: "If that email exists, a reset link was sent",
      devToken: rawToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Request failed", detail: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "token and newPassword required" });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "Token invalid or expired" });
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // force re-login everywhere
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Reset failed", detail: err.message });
  }
}

const googleCallback = async (req, res) => {
  const accessToken = generateAccessToken(req.user);
  const refreshToken = generateRefreshToken(req.user);
  req.user.refreshToken = refreshToken;
  await req.user.save();

  res.redirect(
    `https://amrtzcollaborate-frontend.vercel.app//auth/success?access_token=${accessToken}`,
  );
};

const user = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    if (!me) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: {
        id: me._id,
        name: me.name,
        email: me.email,
        role: me.role,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to load profile", detail: err.message });
  }
};

export {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
  user,
};
