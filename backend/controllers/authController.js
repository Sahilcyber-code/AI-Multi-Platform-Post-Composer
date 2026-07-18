import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generate JWT Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const demoUser = {
  _id: 'demo-user-id',
  name: 'Demo User',
  email: 'demo@example.com',
  profileImage: '',
};

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profileImage: user.profileImage,
  token: generateToken(user._id),
});

const isDemoLoginRequest = (email, password) => {
  return (
    email?.toLowerCase().trim() === demoUser.email &&
    password === 'password123'
  );
};

// ==========================
// Register User
// ==========================
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    console.error('Register Error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Login User
// ==========================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email?.toLowerCase().trim();

  console.log('\n========== LOGIN DEBUG ==========');
  console.log('Email Entered :', normalizedEmail);

  if (isDemoLoginRequest(normalizedEmail, password)) {
    console.log('Demo Login Successful');

    return res.json(buildAuthResponse(demoUser));
  }

  try {
    const user = await User.findOne({
      email: normalizedEmail,
    });

    console.log('User Found :', !!user);

    if (!user) {
      console.log('❌ User does not exist');

      return res.status(401).json({
        message: 'User not found',
      });
    }

    console.log('Database Email :', user.email);
    console.log('Stored Password Hash :', user.password);

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log('Password Match :', isMatch);

    if (!isMatch) {
      console.log('❌ Password Incorrect');

      return res.status(401).json({
        message: 'Incorrect password',
      });
    }

    console.log('✅ Login Successful');

    return res.json(buildAuthResponse(user));
  } catch (error) {
    console.error('Login Error:', error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Logout
// ==========================
export const logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    message: 'Logged out successfully',
  });
};

// ==========================
// Get Current User
// ==========================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Temporary Reset Token Store
// ==========================
const resetTokens = new Map();

// ==========================
// Forgot Password
// ==========================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const resetToken = crypto
      .randomBytes(20)
      .toString('hex');

    resetTokens.set(resetToken, {
      userId: user._id,
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log('\n========== PASSWORD RESET ==========');
    console.log('Email :', email);
    console.log('Token :', resetToken);
    console.log('====================================\n');

    res.json({
      message: 'Reset token generated',
      token: resetToken,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Reset Password
// ==========================
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const resetData = resetTokens.get(token);

    if (
      !resetData ||
      resetData.expires < Date.now()
    ) {
      return res.status(400).json({
        message: 'Invalid or expired token',
      });
    }

    const user = await User.findById(resetData.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    user.password = password;

    await user.save();

    resetTokens.delete(token);

    res.json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};