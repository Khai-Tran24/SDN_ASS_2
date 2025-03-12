const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../../utils/jwt");
const member = require("../../models/member");

/**
 * Authenticate JWT token from Authorization header
 * Used for REST API endpoints
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get auth header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format
    console.log(token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

/**
 * Refresh token middleware for API
 */
const refreshTokenMiddleware = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (err, userData) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Invalid refresh token",
          });
        }

        try {
          const currentUser = await member.findById(userData._id);

          if (!currentUser) {
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

          const accessToken = generateAccessToken(currentUser);

          return res.status(200).json({
            success: true,
            data: {
              accessToken,
            },
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Token refresh error",
            error: error.message,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
};

/**
 * Authorize roles for API endpoints
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      (req.user.isAdmin && roles.includes("admin")) ||
      (!req.user.isAdmin && roles.includes("user"))
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access forbidden: Insufficient permissions",
    });
  };
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access forbidden: Admin privileges required",
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  refreshTokenMiddleware,
  isAdmin,
};
