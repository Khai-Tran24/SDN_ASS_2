const { body } = require("express-validator");

const validateBrand = [
  body("brandName").notEmpty().withMessage("Content is required"),
];

module.exports = {
  validateBrand,
};
