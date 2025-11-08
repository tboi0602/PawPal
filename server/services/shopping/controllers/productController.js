import Product from "../models/product/Product.js";
import { put, del } from "@vercel/blob";

//* GET Product
export const getProduct = async (req, res) => {
  const { id } = req.params;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const nameSearch = req.query.search;
  const categoryFilter = req.query.category;
  const minPrice = parseFloat(req.query.min);
  const maxPrice = parseFloat(req.query.max);

  try {
    if (id) {
      const product = await Product.findById(id).lean();
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({ success: true, product: product });
    }

    const findQuery = {};
    if (nameSearch) {
      findQuery.name = { $regex: nameSearch, $options: "i" };
    }

    if (categoryFilter) {
      findQuery.category = categoryFilter;
    }

    const priceRange = {};
    if (!isNaN(minPrice) && minPrice >= 0) {
      priceRange.$gte = minPrice;
    }
    if (!isNaN(maxPrice) && maxPrice > 0) {
      priceRange.$lte = maxPrice;
    }

    if (Object.keys(priceRange).length > 0) {
      findQuery.price = priceRange;
    }
    const totalProduct = await Product.countDocuments(findQuery);
    if (totalProduct === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const products = await Product.find(findQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      pagination: {
        totalProducts: totalProduct,
        totalPages: Math.ceil(totalProduct / limit),
        currentPage: page,
        pageSize: limit,
      },
      products: products,
    });
  } catch (error) {
    console.error(`Error in getProduct: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

//* ADD Product
export const addProduct = async (req, res) => {
  let dataProduct = req.body;
  dataProduct.attributes = JSON.parse(dataProduct.attributes);
  const files = req.files;
  if (!files || files?.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      message: "Server configuration error: Missing Vercel Blob Token.",
    });
  }
  try {
    const name = dataProduct.name;
    const existingProduct = await Product.findOne({ name }).lean();
    if (existingProduct) {
      return res
        .status(409)
        .json({ success: false, message: "This name is already in use." });
    }

    const uploadPromises = files.map((file) => {
      return put(`products/${Date.now()}-${file.originalname}`, file.buffer, {
        access: "public",
      });
    });
    const uploadedBlobs = await Promise.all(uploadPromises);
    const imageUrls = uploadedBlobs.map((blob) => blob.url);
    const newProduct = new Product({
      ...dataProduct,
      images: imageUrls,
    });
    const productSaved = await newProduct.save();
    return res.status(201).json({
      success: true,
      message: `Product created successfully`,
      product: productSaved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server Product error: ${error.message}`,
    });
  }
};

//* UPDATE INFORMATION Product

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  let updateData = req.body;
  const files = req?.files;

  try {
    let existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let attributes = JSON.parse(updateData?.attributes || "[]");
    let imagesToDelete = JSON.parse(updateData?.imagesToDelete || "[]");
    let existingImagesToKeep = JSON.parse(
      updateData?.existingImagesToKeep || "[]"
    );

    if (imagesToDelete?.length > 0) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          success: false,
          message:
            "Server configuration error: Missing Vercel Blob Token for delete.",
        });
      }

      const deletePromises = imagesToDelete?.map((url) =>
        del(url).catch((e) => {
          console.warn(`Failed to delete blob URL ${url}: ${e.message}`);
        })
      );
      await Promise.all(deletePromises);
    }

    let newImageUrls = [];
    if (files && files?.length > 0) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          success: false,
          message:
            "Server configuration error: Missing Vercel Blob Token for upload.",
        });
      }

      const uploadPromises = files.map((file) => {
        return put(`products/${Date.now()}-${file.originalname}`, file.buffer, {
          access: "public",
        });
      });

      const uploadedBlobs = await Promise.all(uploadPromises);
      newImageUrls = uploadedBlobs.map((blob) => blob.url);
    }

    const finalImageUrls = [...existingImagesToKeep, ...newImageUrls];

    const finalUpdate = {
      ...updateData,
      attributes: attributes,
      images: finalImageUrls,
    };

    delete finalUpdate.imagesToDelete;
    delete finalUpdate.existingImagesToKeep;
    const productUpdated = await Product.findByIdAndUpdate(id, finalUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product update successful.",
      product: productUpdated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server Product error: ${error.message}`,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productDeleted = await Product.findByIdAndDelete(id);
    if (!productDeleted)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const deleteImage = productDeleted.images.map((url) => del(url));
    await Promise.all(deleteImage);
    res.status(200).json({
      success: true,
      message: `${productDeleted.name} has been successfully deleted`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server Product error: ${error.message}`,
    });
  }
};
