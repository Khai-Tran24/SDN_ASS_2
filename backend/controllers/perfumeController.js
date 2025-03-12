const perfume = require("../models/perfume");
const brand = require("../models/brand");
const comment = require("../models/comment");
const { validationResult } = require("express-validator");

/**
 * @desc    Get perfume by ID with populated brand and comments
 * @route   GET /perfumes/:id
 * @access  Public
 */
const getPerfumeDetail = async (req, res) => {
  try {
    const perfumeDetail = await perfume
      .findById(req.params.id)
      .populate("brand")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name",
        },
      });

    if (!perfumeDetail) {
      return res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: perfumeDetail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve perfume details",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all perfumes with populated brand
 * @route   GET /perfumes
 * @access  Public
 */
const getAllPerfumes = async (req, res) => {
  try {
    const perfumes = await perfume
      .find()
      .populate("brand")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name",
        },
      });

    return res.status(200).json({
      success: true,
      count: perfumes.length,
      data: perfumes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve perfumes",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new perfume
 * @route   POST /perfumes
 * @access  Private (Admin)
 */
const createPerfume = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const newPerfume = new perfume(req.body);
    await newPerfume.save();

    return res.status(201).json({
      success: true,
      message: "Perfume created successfully",
      data: newPerfume,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create perfume",
      error: error.message,
    });
  }
};

/**
 * @desc    Update existing perfume
 * @route   PUT /perfumes/:id
 * @access  Private (Admin)
 */
const updatePerfume = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const updatedPerfume = await perfume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPerfume) {
      return res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Perfume updated successfully",
      data: updatedPerfume,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update perfume",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete perfume and its comments
 * @route   DELETE /perfumes/:id
 * @access  Private (Admin)
 */
const deletePerfume = async (req, res) => {
  try {
    const deletedPerfume = await perfume.findByIdAndDelete(req.params.id);

    if (!deletedPerfume) {
      return res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
    }

    // Delete associated comments
    await comment.deleteMany({
      _id: { $in: deletedPerfume.comments },
    });

    return res.status(200).json({
      success: true,
      message: "Perfume deleted successfully",
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete perfume",
      error: error.message,
    });
  }
};

/**
 * @desc    Search perfumes by name
 * @route   GET /perfumes/search
 * @access  Public
 */
const searchPerfume = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp("\\b" + query + "\\b", "i");
    const perfumes = await perfume
      .find({
        perfumeName: searchRegex,
      })
      .populate("brand");

    return res.status(200).json({
      success: true,
      count: perfumes.length,
      data: perfumes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search perfumes",
      error: error.message,
    });
  }
};

/**
 * @desc    Filter perfumes by brand
 * @route   GET /perfumes/filter
 * @access  Public
 */
const filterPerfumeByBrand = async (req, res) => {
  try {
    const selectedBrand = req.query.selectedBrand || "";
    const perfumeQuery = selectedBrand !== "" ? { brand: selectedBrand } : {};

    const perfumes = await perfume.find(perfumeQuery).populate("brand");

    return res.status(200).json({
      success: true,
      count: perfumes.length,
      selectedBrand: selectedBrand || null,
      data: perfumes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to filter perfumes by brand",
      error: error.message,
    });
  }
};

/**
 * @desc    Add comment to perfume
 * @route   POST /perfumes/:id/comments
 * @access  Private (User)
 */
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const perfumeDetail = await perfume.findById(req.params.id);

    if (!perfumeDetail) {
      return res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
    }

    // Check if user already commented on this perfume
    if (perfumeDetail.comments.length > 0) {
      const existingComments = await comment.find({
        _id: { $in: perfumeDetail.comments },
        author: req.user._id,
      });

      if (existingComments.length > 0) {
        return res.status(409).json({
          success: false,
          message: "You have already reviewed this perfume",
        });
      }
    }

    const newComment = new comment(req.body);
    newComment.author = req.user._id;
    await newComment.save();

    perfumeDetail.comments.push(newComment);
    await perfumeDetail.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all comments for a perfume
 * @route   GET /perfumes/:id/comments
 * @access  Public
 */
const getComments = async (req, res) => {
  try {
    const perfumeDetail = await perfume.findById(req.params.id).populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name",
      },
    });

    if (!perfumeDetail) {
      return res.status(404).json({
        success: false,
        message: "Perfume not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: perfumeDetail.comments.length,
      data: perfumeDetail.comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve comments",
      error: error.message,
    });
  }
};

module.exports = {
  createPerfume,
  getPerfumeDetail,
  updatePerfume,
  deletePerfume,
  searchPerfume,
  filterPerfumeByBrand,
  addComment,
  getComments,
  getAllPerfumes,
};
