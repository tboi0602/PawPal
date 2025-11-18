import mongoose from "mongoose";
import Order from "../models/order/Order.js";
import Promotion from "../models/promotion/Promotion.js";
import Product from "../models/product/Product.js";
import PromotionUsage from "../models/promotion/PromotionUsage.js";
import { EMAIL_TARGET } from "../../../configs/config.js";

// Lấy order theo từng user có phân trang, lọc theo trạng thái
export const getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;
  try {
    const findQuery = { userId: userId };
    if (status) {
      findQuery.status = status;
    }
    const totalOrders = await Order.countDocuments(findQuery);
    if (totalOrders === 0 && page == 1) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found" });
    }
    const orders = await Order.find(findQuery)
      .populate({
        path: "orderItems.productId",
        select: "name images discountPrice",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      pagination: {
        totalOrders: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
      orders: orders,
    });
  } catch (error) {
    console.error(`Error in getOrdersByUser: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Lấy danh sách order với phân trang và lọc
export const getOrders = async (req, res) => {
  const { status, page = 1, limit = 10, search = "" } = req.query;
  const skip = (page - 1) * limit;
  try {
    const findQuery = {};
    if (status) {
      findQuery.status = status;
    }
    if (search) {
      findQuery._id = search;
    }
    const totalOrders = await Order.countDocuments(findQuery);
    if (totalOrders === 0 && page == 1) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found" });
    }
    const orders = await Order.find(findQuery)
      .populate({
        path: "orderItems.productId",
        select: "name images discountPrice",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    return res.status(200).json({
      success: true,
      pagination: {
        totalOrders: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: Number(page),
        pageSize: Number(limit),
      },
      orders: orders,
    });
  } catch (error) {
    console.error(`Error in getOrders: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Tạo mới order
export const createOrder = async (req, res) => {
  const {
    userId,
    email,
    rank,
    paymentMethod,
    orderItems,
    address,
    promotionCode,
    shippingFee,
  } = req.body;
  if (!userId || !orderItems || orderItems.length === 0 || !address) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userId, orderItems, or address",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subTotal = 0;
    let discountAmount = 0;
    let itemsForOrder = []; //  TÍNH TỔNG TIỀN & KIỂM TRA BẢO MẬT/TỒN KHO

    for (const item of orderItems) {
      if (!item.productId || item.quantity <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message:
            "Each order item must have productId and quantity greater than 0",
        });
      }

      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }
      subTotal += product.discountPrice * item.quantity;
      itemsForOrder.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.discountPrice, // Dùng giá từ DB
      });
    }
    const orderTotal = subTotal + (shippingFee || 0); // KIỂM TRA & ÁP DỤNG KHUYẾN MÃI

    let usedPromotion = null;
    if (promotionCode) {
      //  TÌM KIẾM KHUYẾN MÃI
      usedPromotion = await Promotion.findOne({
        promotionCode: promotionCode,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        $or: [{ rank: rank }, { rank: "All" }],
        minOrderAmount: { $lte: subTotal }, // Dùng subTotal
      }).session(session);

      if (!usedPromotion) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Invalid or inapplicable promotion code",
        });
      } //  KIỂM TRA USER USAGE

      const usage = await PromotionUsage.findOne({
        promotionId: usedPromotion._id,
        userId: userId,
      }).session(session);

      if (usage) {
        // Nếu đã tồn tại document usage, có nghĩa là đã dùng
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Promotion code has already been used by this user",
        });
      } // . KIỂM TRA GLOBAL USAGE LIMIT

      if (
        usedPromotion.usageLimit > 0 &&
        usedPromotion.usageCount >= usedPromotion.usageLimit
      ) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ success: false, message: "Promotion code limit reached" });
      } // . TÍNH TOÁN DISCOUNT AMOUNT

      if (usedPromotion.discountType === "fixed") {
        discountAmount = usedPromotion.discountValue;
      } else if (usedPromotion.discountType === "percent") {
        discountAmount = (orderTotal * usedPromotion.discountValue) / 100;
        if (
          usedPromotion.maxDiscountAmount > 0 &&
          discountAmount > usedPromotion.maxDiscountAmount
        ) {
          discountAmount = usedPromotion.maxDiscountAmount;
        }
      } // . CẬP NHẬT USAGE (TRONG TRANSACTION)

      await Promotion.updateOne(
        { _id: usedPromotion._id },
        { $inc: { usageCount: 1 } },
        { session }
      ); // . TẠO PROMOTION USAGE (TRONG TRANSACTION)

      const promotionUsage = new PromotionUsage({
        promotionId: usedPromotion._id,
        userId: userId,
        used: true, // Giả sử trường này tồn tại trong Schema
      });
      await promotionUsage.save({ session });
    } //  CẬP NHẬT TỒN KHO SẢN PHẨM (TRONG TRANSACTION)

    for (const item of itemsForOrder) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    } // TẠO ĐƠN HÀNG MỚI (TRONG TRANSACTION)

    const finalAmount = orderTotal - discountAmount;
    const newOrder = new Order({
      userId,
      orderItems: itemsForOrder,
      totalAmount: orderTotal,
      shippingFee: shippingFee || 0,
      discountAmount,
      paymentMethod: { method: paymentMethod },
      finalAmount,
      address,
      promotionCode: promotionCode || null,
    });
    await newOrder.save({ session }); //  COMMIT TRANSACTION
    if (newOrder) {
      const templateName = "orderConfirmation";
      const to = email;
      const subject = `Order Confirmation #${String(newOrder?._id).toUpperCase()}`;
      const data = {
        customerName: userId?.slice(-8).toUpperCase() || "Customer",
        orderId: newOrder._id,
        orderDate: newOrder.createdAt.toLocaleDateString("vi-VN"),
        finalAmount: newOrder.finalAmount.toLocaleString("vi-VN") + " VND",
        orderLink: `http://localhost:5173/home/orders`,
      };
      fetch(`${EMAIL_TARGET}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ templateName, to, subject, data }),
      }).catch((err) => console.log(err.message));
    }
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error in createOrder: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  } finally {
    session.endSession();
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "cancelled", // 0: Trạng thái hủy
    "pending", // 1
    "confirmed", // 2
    "delivering", // 3
    "delivered", // 4: Đã giao
    "failed", // 5: Giao thất bại
  ];
  const newStatus = status;

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const oldStatusIndex = validStatuses.indexOf(order.status);
    const newStatusIndex = validStatuses.indexOf(newStatus);
    if (order.status === newStatus) {
      await session.abortTransaction();
      return res.status(200).json({
        success: true,
        message: `Order is already in '${newStatus}' status`,
        order: order,
      });
    } //   chặn chuyển trạng thái (cancelled và Chuyển lùi)

    if (
      order.status === "cancelled" ||
      order.status === "delivered" ||
      order.status === "failed"
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message:
          "Order status cannot be changed once it is in 'cancelled', 'delivered', or 'failed' status.",
      });
    }
    if (newStatusIndex < oldStatusIndex && newStatus !== "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${newStatus}. Status can only move forward or to 'cancelled'.`,
      });
    }
    const deliveringIndex = validStatuses.indexOf("delivering");
    if (newStatus === "cancelled" && oldStatusIndex >= deliveringIndex) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order once it is in '${order.status}' status or beyond.`,
      });
    }
    //  HOÀN LẠI TỒN KHO VÀ PROMOTION khi chuyển sang "cancelled" và "failed"
    if (newStatus === "cancelled" || newStatus === "failed") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { stock: item.quantity },
          },
          { session }
        );
      }
      if (order.promotionCode) {
        const promo = await Promotion.findOneAndUpdate(
          { promotionCode: order.promotionCode },
          { $inc: { usageCount: -1 } },
          { session, new: true }
        );
        if (promo) {
          await PromotionUsage.deleteOne(
            {
              promotionId: promo._id,
              userId: order.userId,
            },
            { session }
          );
        }
      }
    } // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG

    order.status = newStatus;
    if (newStatus === "delivered") {
      order.paymentMethod.status = "paid";
    }
    await order.save({ session });
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: order,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error in updateOrderStatus: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  } finally {
    session.endSession();
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { "paymentMethod.status": "paid" },
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order: order,
    });
  } catch (error) {
    console.error(`Error in updatePaymentStatus: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
