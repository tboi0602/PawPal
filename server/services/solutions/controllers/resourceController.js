import Resource from "../models/Resource.js";
import Solution from "../models/Solution.js";

export const addResource = async (req, res) => {
  const data = req.body;
  try {
    if (!data.solutionId || !data.name || !data.maxCapacity || !data.location) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const resource = await Resource.findOne({ name: data.name });
    if (resource)
      return res
        .status(400)
        .json({ success: false, message: "Resource exited" });

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (
      !Array.isArray(data.dayOfWeek) ||
      data.dayOfWeek.some((day) => !validDays.includes(day))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid dayOfWeek value" });
    }

    // Kiểm tra Solution tồn tại
    const solution = await Solution.findById(data.solutionId);
    if (!solution) {
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });
    }

    const newResource = new Resource({
      solution: {
        _id: solution._id,
        name: solution.name,
        description: solution.description,
        solutionType: solution.solutionType,
        duration: solution.duration,
        price: solution.price,
        pricingType: solution.pricingType,
        type: solution.type,
      },
      name: data.name,
      maxCapacity: data.maxCapacity,
      location: data.location,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type || "Basic",
      upcharge: data.upcharge || 0,
    });

    const savedResource = await newResource.save();

    return res.status(201).json({
      success: true,
      message: "Resource added successfully",
      resource: savedResource,
    });
  } catch (error) {
    console.error("❌ addResource error:", error);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().populate("solution");
    if (resources.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No resources found" });
    }
    return res.status(200).json({ success: true, resources });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getResourceById = async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }
    return res.status(200).json({ success: true, resource });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateResource = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (data.location && !["Floor 1", "Floor 2"].includes(data.location)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid location value" });
  }
  if (data.solutionId) {
    const solution = await Solution.findById(data.solutionId);
    if (!solution) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid solutionId" });
    }
  }
  try {
    const updatedResource = await Resource.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedResource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource: updatedResource,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getResourcesBySolutionId = async (req, res) => {
  const { solutionId } = req.params;
  try {
    const resources = await Resource.find({ "solution._id": solutionId });
    return res.status(200).json({ success: true, resources });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteResource = async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource)
      return res
        .status(401)
        .json({ success: false, message: "Resource not found" });
    return res.status(200).json({ success: true, resource });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};
