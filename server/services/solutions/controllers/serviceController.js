import Solution from "../models/Solution.js";
import mongoose from "mongoose";

export const addSolution = async (req, res) => {
  const data = req.body;
  try {
    if (
      !data.name ||
      !data.description ||
      !data.duration ||
      !data.price ||
      !data.pricingType ||
      !data.type
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    if (
      isNaN(data.duration) ||
      data.duration <= 0 ||
      isNaN(data.price) ||
      data.price < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duration must be a positive number, and Price must be a non-negative number.",
      });
    }

    const validPricingTypes = ["per_hour", "per_day", "per_kg", "per_session"];
    if (!validPricingTypes.includes(data.pricingType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pricing type" });
    }

    const newSolution = new Solution({
      name: data.name.trim(),
      description: data.description.trim(),
      duration: data.duration,
      price: data.price,
      pricingType: data.pricingType,
      type: data.type,
    });
    const savedSolution = await newSolution.save();

    return res.status(201).json({
      success: true,
      message: "Solution added successfully",
      solution: savedSolution,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${error.message}`,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getSolutions = async (req, res) => {
  try {
    const solutions = await Solution.find();
    return res.status(200).json({ success: true, solutions });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getSolutionById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Solution ID format" });
    }

    const solution = await Solution.findById(id);

    if (!solution) {
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });
    }

    return res.status(200).json({ success: true, solution });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateSolution = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Solution ID format" });
    }

    if (data.duration && (isNaN(data.duration) || data.duration <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number.",
      });
    }

    if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number.",
      });
    }

    const validPricingTypes = ["per_hour", "per_day", "per_kg", "per_session"];
    if (data.pricingType && !validPricingTypes.includes(data.pricingType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pricing type" });
    }

    delete data._id;

    const updatedSolution = await Solution.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedSolution) {
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Solution updated successfully",
      solution: updatedSolution,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${error.message}`,
      });
    }
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteSolution = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Solution ID format" });
    }

    const deletedSolution = await Solution.findByIdAndDelete(id);

    if (!deletedSolution) {
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Solution deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};
