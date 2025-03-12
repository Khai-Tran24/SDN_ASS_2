const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const member = require("../models/member");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

/**
 * @desc    Register new member
 * @route   POST /member/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Check if email already exists
    const existingUser = await member.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const newMember = new member(req.body);

    // Hash password
    const hash = await bcrypt.hash(newMember.password, 10);
    newMember.password = hash;

    const savedMember = await newMember.save();

    // Remove password from response
    const memberResponse = savedMember.toObject();
    delete memberResponse.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: memberResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Login member
 * @route   POST /member/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await member.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Convert user to plain object and remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Logout member
 * @route   POST /member/logout
 * @access  Public
 */
const logout = async (req, res) => {
  try {
    // In a stateless REST API, we don't need to do anything on the server
    // The client should remove the tokens
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Get member by ID
 * @route   GET /member/:id
 * @access  Private (Authenticated)
 */
const getMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const memberData = await member.findById(memberId);

    if (!memberData) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Remove password from response
    const memberResponse = memberData.toObject();
    delete memberResponse.password;

    return res.status(200).json({
      success: true,
      data: memberResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve member",
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /member/profile
 * @access  Private (Authenticated)
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const memberData = await member.findById(userId);

    if (!memberData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove password from response
    const memberResponse = memberData.toObject();
    delete memberResponse.password;

    return res.status(200).json({
      success: true,
      data: memberResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all members
 * @route   GET /member
 * @access  Private (Admin)
 */
const getAllMembers = async (req, res) => {
  try {
    const members = await member.find().select("-password");

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve members",
      error: error.message,
    });
  }
};

/**
 * @desc    Update member
 * @route   PUT /member/:id
 * @access  Private (Authenticated/Owner)
 */
const updateMember = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const memberId = req.params.id;
    const { currentPassword, newPassword, confirmPassword, ...updateData } =
      req.body;

    // If trying to update password
    if (currentPassword && newPassword) {
      const currentUser = await member.findById(memberId);

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "Member not found",
        });
      }

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );

      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedMember = await member
      .findByIdAndUpdate(memberId, updateData, { new: true })
      .select("-password");

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update member",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete member
 * @route   DELETE /member/:id
 * @access  Private (Admin/Owner)
 */
const deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const deletedMember = await member.findByIdAndDelete(memberId);

    if (!deletedMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
      data: {
        id: memberId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete member",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMember,
  getUserProfile,
  getAllMembers,
  updateMember,
  deleteMember,
};
