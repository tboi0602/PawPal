import Promotion from "../models/promotion/Promotion.js";
import PromotionUsage from "../models/promotion/PromotionUsage.js";

const VALID_RANKS = ["All", "Bronze", "Silver", "Gold", "Platinum"];

const getRankValue = (rank) => {
  switch (rank) {
    case "Bronze":
      return 1;
    case "Silver":
      return 2;
    case "Gold":
      return 3;
    case "Platinum":
      return 4;
    default:
      return 0;
  }
};

export const addPromotion = async (req, res) => {
  const promoData = req.body;
  console.log(promoData);
  try {
    if (
      !promoData?.promotionCode ||
      !promoData?.discountType ||
      !promoData?.discountValue ||
      !promoData?.startDate ||
      !promoData?.endDate ||
      promoData?.usageLimit === undefined
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!["percent", "fixed"].includes(promoData.discountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type (must be 'percent' or 'fixed')",
      });
    }

    if (promoData.rank && !VALID_RANKS.includes(promoData.rank)) {
      return res.status(400).json({
        success: false,
        message: `Invalid rank specified. Must be one of: ${VALID_RANKS.join(
          ", "
        )}`,
      });
    }

    const existing = await Promotion.findOne({
      promotionCode: promoData.promotionCode.toUpperCase().trim(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Promotion code already exists",
      });
    } // 5. Tạo promotion mới

    const newPromotion = new Promotion({
      promotionCode: promoData.promotionCode.toUpperCase().trim(),
      ...promoData,
    });

    const savedPromotion = await newPromotion.save();
    return res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      promotion: savedPromotion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Promotion error: ${error.message}`,
    });
  }
};

export const getPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findOne({ _id: id });

    if (!promotion)
      return res
        .status(404)
        .json({ success: false, message: "Invalid promotion code" });

    // Auto update status when retrieving
    const now = new Date();
    if (promotion.status === "upcoming" && now >= promotion.startDate) {
      promotion.status = "active";
      await promotion.save();
    } else if (
      promotion.status === "active" &&
      (now >= promotion.endDate ||
        (promotion.usageLimit > 0 &&
          promotion.usageCount >= promotion.usageLimit))
    ) {
      promotion.status = "expired";
      await promotion.save();
    }

    res.status(200).json({ success: true, promotion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPromotions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const nameSearch = req.query.search;
    const status = req.query.status || "all";
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    const skip = (page - 1) * limit;
    const findQuery = {};
    const sortQuery = {};

    if (nameSearch) {
      findQuery.$or = [
        { promotionCode: { $regex: nameSearch, $options: "i" } },
        { description: { $regex: nameSearch, $options: "i" } },
      ];
    }

    if (status !== "all") {
      findQuery.status = status;
    }

    // Automatically update status before retrieving
    const now = new Date();
    await Promotion.updateMany(
      {
        status: "upcoming",
        startDate: { $lte: now },
      },
      { status: "active" }
    );

    await Promotion.updateMany(
      {
        status: "active",
        $or: [
          { endDate: { $lte: now } },
          {
            $and: [
              { usageLimit: { $gt: 0 } },
              { $expr: { $gte: ["$usedCount", "$usageLimit"] } },
            ],
          },
        ],
      },
      { status: "expired" }
    );

    sortQuery[sortField] = sortOrder === "asc" ? 1 : -1;

    const totalPromotions = await Promotion.countDocuments(findQuery);

    if (totalPromotions === 0) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    const promotions = await Promotion.find(findQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortQuery)
      .lean();

    res.status(200).json({
      success: true,
      pagination: {
        totalItems: totalPromotions,
        totalPages: Math.ceil(totalPromotions / limit),
        currentPage: page,
        pageSize: limit,
      },
      promotions: promotions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Server Promotion error: ${err.message}`,
    });
  }
};

export const updatePromotion = async (req, res) => {
  const { id } = req.params;
  const dataUpdated = req.body;
  try {
    if (
      dataUpdated?.discountType &&
      !["percent", "fixed"].includes(dataUpdated?.discountType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type (must be 'percent' or 'fixed')",
      });
    }

    if (
      dataUpdated?.discountType === "percent" &&
      dataUpdated?.discountValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    if (dataUpdated?.usageLimit < 0) {
      return res.status(400).json({
        success: false,
        message: "Usage limit cannot be negative",
      });
    }

    if (
      dataUpdated?.startDate &&
      dataUpdated?.endDate &&
      new Date(dataUpdated?.endDate) <= new Date(dataUpdated?.startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    if (dataUpdated?.rank && !VALID_RANKS.includes(dataUpdated.rank)) {
      return res.status(400).json({
        success: false,
        message: `Invalid rank specified. Must be one of: ${VALID_RANKS.join(
          ", "
        )}`,
      });
    }

    const promotionUpdated = await Promotion.findOneAndUpdate(
      { _id: id },
      dataUpdated,
      { new: true, runValidators: true }
    );
    if (!promotionUpdated)
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    res.status(200).json({
      success: true,
      message: "Promotion update successful.",
      promotion: promotionUpdated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Promotion error: ${error.message}`,
    });
  }
};

export const deletePromotion = async (req, res) => {
  const { id } = req.params;
  try {
    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return res
        .status(404)
        .json({ success: false, message: "Promotion not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Promotion deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Promotion error: ${error.message}`,
    });
  }
};
