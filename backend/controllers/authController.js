import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
  return email?.toLowerCase().trim() === demoUser.email && password === 'password123';
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (isDemoLoginRequest(normalizedEmail, password)) {
    return res.json(buildAuthResponse(demoUser));
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      return res.json(buildAuthResponse(user));
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(503).json({
      message: 'Authentication service is currently unavailable. Use demo@example.com / password123 for local testing.',
      error: error.message,
    });
  }
};

// @desc    Logout user (Stateless client side cleanup reminder)
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  // Since we are using stateless JWT, we tell client to delete the token.
  // Optionally clear cookie if cookies were used
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile (Auto Login verification)
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving credentials', error: error.message });
  }
};

// Map to store temporary reset tokens for development/testing convenience
// In production, you would save these reset tokens hashed on the User model
const resetTokens = new Map();

// @desc    Send password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate reset token (10 mins expiry)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    resetTokens.set(resetToken, { userId: user._id, expires: expireTime });

    // In development, log token and reset link to console for easy developer access
    console.log('\n=======================================');
    console.log(`PASSWORD RESET REQUEST FOR: ${email}`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset Link: http://localhost:5173/reset-password?token=${resetToken}`);
    console.log('=======================================\n');

    // Simulate sending email, return success response along with token in development so user can test without inspecting server logs
    res.json({
      message: 'Password reset link and token generated successfully.',
      token: resetToken, // Returned for sandbox convenience
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const resetData = resetTokens.get(token);

    if (!resetData || resetData.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const user = await User.findById(resetData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (pre-save hook hashes this password automatically)
    user.password = password;
    await user.save();

    // Remove token once used
    resetTokens.delete(token);

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};
