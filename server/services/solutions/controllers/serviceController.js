import Solution from "../models/Solution.js";

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
        message: "Missing required fields or invalid steps format",
      });
    }
    if (
      !["per_hour", "per_day", "per_kg", "per_session"].includes(
        data.pricingType
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid pricing type" });
    }
    const solution = await Solution.findOne({ name: data.name });
    if (solution)
      return res
        .status(400)
        .json({ success: false, message: "Solution is exist" });
    const newSolution = new Solution({
      name: data.name,
      description: data.description,
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
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getSolutions = async (req, res) => {
  const { search } = req.query;
  try {
    const solutions = await Solution.find({ name: search });
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
    const updatedSolution = await Solution.findByIdAndUpdate(id, data, {
      new: true,
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
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteSolution = async (req, res) => {
  const { id } = req.params;
  try {
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
