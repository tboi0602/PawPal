import Product from "../models/product/Product.js";
import Review from "../models/product/Review.js";

//* GET Reviews
export const getReviews = async (req, res) => {
  const { productId, id } = req.params;

  const currentUserId = req.headers["x-user-id"];

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    if (id) {
      const review = await Review.findById(id).lean();
      if (!review) {
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });
      }
      return res.status(200).json({ success: true, review });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required to list reviews",
      });
    }

    const findQuery = { productId };
    const totalReviews = await Review.countDocuments(findQuery);

    if (totalReviews === 0) {
      return res.status(401).json({
        success: false,
        message: "No reviews found for this product.",
        reviews: [],
      });
    }

    let userReview = null;
    let reviews = [];
    let queryLimit = limit;

    if (currentUserId) {
      userReview = await Review.findOne({
        productId,
        userId: currentUserId,
      }).lean();

      if (userReview) {
        queryLimit = limit - 1;
      }
    }

    const remainingQuery = {
      ...findQuery,
      ...(userReview && { _id: { $ne: userReview._id } }),
    };

    reviews = await Review.find(remainingQuery)
      .sort({ createdAt: -1 })
      .skip(userReview ? (skip > 0 ? skip - 1 : skip) : skip)
      .limit(queryLimit)
      .lean();

    if (userReview) {
      reviews.unshift(userReview);
    }

    return res.status(200).json({
      success: true,
      reviews: reviews,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

//* ADD Review (Create a new review)

export const addReview = async (req, res) => {
  const { productId } = req.params;
  const userId = req.headers["x-user-id"];
  const { name, image, comment, rate } = req.body;

  if (!productId || !userId || !comment || rate === undefined) {
    return res.status(400).json({ message: "Missing required fields ." });
  }

  if (rate < 1 || rate > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Rating must be between 1 and 5." });
  }

  const product = await Product.findOne({ _id: productId });
  if (!product)
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });

  try {
    const existingReview = await Review.findOne({
      productId,
      "user.id": userId,
    });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this product.",
      });
    }

    const newReview = new Review({
      productId,
      user: {
        id: userId,
        name: name,
        image: image,
      },
      comment,
      rate,
    });

    const reviewSaved = await newReview.save();

    return res.status(201).json({
      success: true,
      message: `Review added successfully`,
      review: reviewSaved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Review error: ${error.message}`,
    });
  }
};


//* DELETE Review
export const deleteReview = async (req, res) => {
  const { id } = req.params;
  const userId = req.headers["x-user-id"];
  try {
    const reviewDeleted = await Review.findOneAndDelete({
      _id: id,
      "user.id": userId,
    });

    if (!reviewDeleted)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    res.status(200).json({
      success: true,
      message: `Review for product ${reviewDeleted.productId} has been successfully deleted`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server Review error: ${error.message}`,
    });
  }
};
