import mongoose from "mongoose";
import Cart from "../models/cart/Cart.js";
import CartItems from "../models/cart/CartItems.js";
import Product from "../models/product/Product.js";

// Add item to user's cart
export const addCartItem = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const { productId, quantity = 1, attribute } = req.body;
    if (!productId)
      return res
        .status(400)
        .json({ success: false, message: "Missing productId in request" });

    const product = await Product.findById(productId).lean();
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await new Cart({ userId, totalCartItems: 0 }).save();
    }

    let cartItem = await CartItems.findOne({ cartId: cart._id, productId });
    const unitPrice = product.discountPrice || product.price || 0;

    if (cartItem && attribute === cartItem.attribute) {
      const newQuantity = cartItem.quantity + Number(quantity);
      const newTotal = unitPrice * newQuantity;
      cartItem = await CartItems.findByIdAndUpdate(
        cartItem._id,
        { quantity: newQuantity, total: newTotal },
        { new: true }
      );
    } else {
      const itemTotal = unitPrice * Number(quantity);
      cartItem = new CartItems({
        cartId: cart._id,
        productId,
        attribute,
        quantity,
        total: itemTotal,
      });
      await cartItem.save();
    }

    // recompute totalCartItems
    const agg = await CartItems.aggregate([
      { $match: { cartId: cart._id } },
      { $group: { _id: null, sum: { $sum: "$quantity" } } },
    ]);
    const total = agg[0]?.sum || 0;
    cart.totalCartItems = total;
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Item added to cart",
      cartItem: cartItem,
    });
  } catch (error) {
    console.error(`Error in addCartItem: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const cart = await Cart.findOne({ userId }).lean();
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const totalItems = await CartItems.countDocuments({ cartId: cart._id });
    const items = await CartItems.find({ cartId: cart._id })
      .populate({
        path: "productId",
        select: "name images discountPrice attributes",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    return res.status(200).json({
      success: true,
      cart,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: pageNum,
        pageSize,
      },
      items,
    });
  } catch (error) {
    console.error(`Error in getCartByUser: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cart item id
    const { quantity, attribute } = req.body;
    if (quantity == null)
      return res
        .status(400)
        .json({ success: false, message: "Missing quantity" });

    let cartItem = await CartItems.findById(id);
    if (!cartItem)
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });

    const product = await Product.findById(cartItem.productId).lean();

    if (quantity > product.stock)
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory for product ${product.name}. Available: ${product.stock}`,
      });

    const unitPrice = product?.discountPrice || product?.price || 0;
    const newTotal = unitPrice * Number(quantity);

    cartItem.quantity = Number(quantity);
    cartItem.total = newTotal;
    await cartItem.save();

    // update cart total items
    const agg = await CartItems.aggregate([
      { $match: { cartId: cartItem.cartId } },
      { $group: { _id: null, sum: { $sum: "$quantity" } } },
    ]);
    const total = agg[0]?.sum || 0;
    await Cart.findByIdAndUpdate(cartItem.cartId, { totalCartItems: total });

    const updated = await CartItems.findById(id)
      .populate({
        path: "productId",
        select: "name images price discountPrice attribute",
      })
      .lean();

    return res
      .status(200)
      .json({ success: true, message: "Cart item updated", item: updated });
  } catch (error) {
    console.error(`Error in updateCartItem: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await CartItems.findById(id);
    if (!cartItem)
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });

    const cartId = cartItem.cartId;
    await CartItems.findByIdAndDelete(id);

    // update cart total items
    const matchId = mongoose.isValidObjectId(cartId)
      ? new mongoose.Types.ObjectId(cartId)
      : cartId;
    const agg = await CartItems.aggregate([
      { $match: { cartId: matchId } },
      { $group: { _id: null, sum: { $sum: "$quantity" } } },
    ]);
    const total = agg[0]?.sum || 0;
    await Cart.findByIdAndUpdate(cartId, { totalCartItems: total });

    return res
      .status(200)
      .json({ success: true, message: "Cart item removed" });
  } catch (error) {
    console.error(`Error in deleteCartItem: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};
