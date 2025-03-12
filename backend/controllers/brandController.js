const { validationResult } = require("express-validator");
const brand = require("../models/brand");
const perfume = require("../models/perfume");

/**
 * @desc    Get all brands
 * @route   GET /brands
 * @access  Public
 */
const getAllBrands = async (req, res) => {
  try {
    const brands = await brand.find();

    return res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve brands",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single brand
 * @route   GET /brands/:id
 * @access  Public
 */
const getBrand = async (req, res) => {
  try {
    const brandDetail = await brand.findById(req.params.id);

    if (!brandDetail) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: brandDetail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve brand",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new brand
 * @route   POST /brands
 * @access  Private (Admin)
 */
const createBrand = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Check if brand already exists
    const existingBrand = await brand.findOne({
      brandName: req.body.brandName,
    });
    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand with this name already exists",
      });
    }

    const newBrand = new brand(req.body);
    const savedBrand = await newBrand.save();

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: savedBrand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: error.message,
    });
  }
};

/**
 * @desc    Update brand
 * @route   PUT /brands/:id
 * @access  Private (Admin)
 */
const updateBrand = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const updatedBrand = await brand.findByIdAndUpdate(
      req.params.id,
      { brandName: req.body.brandName },
      { new: true, runValidators: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete brand
 * @route   DELETE /brands/:id
 * @access  Private (Admin)
 */
const deleteBrand = async (req, res) => {
  try {
    // Check if there are perfumes associated with this brand
    const checkPerfume = await perfume.find({ brand: req.params.id });
    if (checkPerfume.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete brand with associated perfumes",
      });
    }

    const deletedBrand = await brand.findByIdAndDelete(req.params.id);

    if (!deletedBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error: error.message,
    });
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
};
