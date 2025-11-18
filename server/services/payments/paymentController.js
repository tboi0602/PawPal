import {
  MOMO_ACCESS_KEY,
  MOMO_PARTNER_CODE,
  MOMO_API_ENDPOINT,
  SHOPPING_TARGET,
  SOLUTIONS_TARGET,
} from "../../configs/config.js";
import { createMoMoSignature } from "../../utils/momoUtils.js";
import Transaction from "./models/Transaction.js";

export const initiateMoMoPayment = async (req, res) => {
  try {
    const { orderId, amount, orderInfo, isServiceBooking } = req.body;
    if (!orderId || !amount || !orderInfo) {
      return res
        .status(400)
        .json({ message: "Missing required payment parameters" });
    }

    const strAmount = String(amount);
    const strOrderId = String(orderId);
    const partnerCode = MOMO_PARTNER_CODE;
    const accessKey = MOMO_ACCESS_KEY;
    const requestId = partnerCode + new Date().getTime();
    const requestType = "payWithMethod";

    // Use different redirect URL based on payment type
    const redirectUrl = isServiceBooking
      ? "http://localhost:5173/home/booking-payment/status"
      : "http://localhost:5173/home/payment/status";
    const ipnUrl = "http://localhost:5007/payments/momo/ipn";

    // For service booking, orderId contains the bookingId
    // No need for extraData anymore since we have bookingId in orderId
    const extraData = "";

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${strAmount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${strOrderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = createMoMoSignature(rawSignature);

    const requestBody = {
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: Number(amount),
      orderId: strOrderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      requestType: requestType,
      extraData: extraData,
      signature: signature,
      lang: "en",
    };
    const momoResponse = await fetch(MOMO_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const responseData = await momoResponse.json();
    if (responseData.resultCode === 0 && responseData.payUrl) {
      return res.status(200).json({
        payUrl: responseData.payUrl,
        message: "Initiation successful",
      });
    } else {
      return res.status(400).json({
        message: responseData.message || "Failed to initiate MoMo payment",
        resultCode: responseData.resultCode,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error pay with Momo" });
  }
};

export const handleMoMoPaymentResult = async (req, res) => {
  try {
    const callbackData = req.query;
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      message,
      responseTime,
      resultCode,
      transId,
      signature,
      payType,
      orderType,
      orderInfo,
    } = callbackData;

    const accessKey = MOMO_ACCESS_KEY;
    const finalExtraData = callbackData.extraData ? callbackData.extraData : "";
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${finalExtraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const localSignature = createMoMoSignature(rawSignature);

    if (localSignature === signature) {
      if (Number(resultCode) === 0) {
        const newTransaction = new Transaction({
          transactionId: transId,
          orderId: orderId,
          requestId: requestId,
          amount: Number(amount),
          description: orderInfo,
          status: "success",
        });
        await newTransaction.save();
        await fetch(`${SHOPPING_TARGET}/orders/${orderId}/payment-status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ["x-user-id"]: req.headers["x-user-id"],
            ["x-user-role"]: req.headers["x-user-role"],
            ["x-user-activate"]: req.headers["x-user-activate"],
          },
        });
        return res.status(200).json({
          success: true,
          message: "Payment Successful",
        });
      } else {
        const newTransaction = new Transaction({
          transactionId: transId,
          orderId: orderId,
          requestId: requestId,
          amount: Number(amount),
          description: orderInfo,
          status: "failed",
        });
        await newTransaction.save();
        return res.status(400).json({
          success: false,
          message: "Payment Failed",
        });
      }
    } else {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid Signature" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Handle MoMo payment result for service booking
 * Verifies payment and creates booking if successful
 */
export const handleMoMoPaymentResultServiceBooking = async (req, res) => {
  try {
    const callbackData = req.query;
    const {
      partnerCode,
      orderId, // This is the bookingId from MoMo
      requestId,
      amount,
      message,
      responseTime,
      resultCode,
      transId,
      signature,
      payType,
      orderType,
      orderInfo,
    } = callbackData;

    console.log("Service booking payment callback:", {
      orderId,
      resultCode,
      transId,
    });

    const accessKey = MOMO_ACCESS_KEY;
    const finalExtraData = callbackData.extraData ? callbackData.extraData : "";
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${finalExtraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const localSignature = createMoMoSignature(rawSignature);

    if (localSignature !== signature) {
      console.error("Invalid signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid Signature" });
    }

    // Extract bookingId from orderId (orderId contains bookingId)
    const bookingId = orderId;
    console.log("Processing payment for bookingId:", bookingId);

    if (Number(resultCode) === 0) {
      // Payment successful
      console.log("Payment successful for booking:", bookingId);

      // Save transaction
      const newTransaction = new Transaction({
        transactionId: transId,
        orderId: orderId,
        requestId: requestId,
        amount: Number(amount),
        description: orderInfo,
        status: "success",
      });
      await newTransaction.save();
      console.log("Transaction saved:", newTransaction._id);

      // Call Solutions service to update booking status to "confirmed"
      try {
        console.log("Updating booking status to confirmed:", bookingId);
        const updateResponse = await fetch(
          `${SOLUTIONS_TARGET}/booking/${bookingId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "confirmed" }),
          }
        );

        const updateResult = await updateResponse.json();
        console.log("Booking status update result:", updateResult);

        if (updateResult.success) {
          return res.status(200).json({
            success: true,
            message: "Payment successful and booking confirmed",
            bookingId: bookingId,
            transactionId: transId,
            booking: updateResult.booking,
          });
        } else {
          console.error(
            "Failed to update booking status:",
            updateResult.message
          );
          return res.status(200).json({
            success: true,
            message: "Payment successful but booking confirmation failed",
            paymentStatus: "completed",
            bookingError: updateResult.message,
          });
        }
      } catch (error) {
        console.error("Error updating booking status:", error);
        return res.status(200).json({
          success: true,
          message: "Payment successful but could not confirm booking",
          paymentStatus: "completed",
          error: error.message,
        });
      }
    } else {
      // Payment failed - delete the booking
      console.log("Payment failed. Deleting booking:", bookingId);

      // Save failed transaction
      const newTransaction = new Transaction({
        transactionId: transId,
        orderId: orderId,
        requestId: requestId,
        amount: Number(amount),
        description: orderInfo,
        status: "failed",
      });
      await newTransaction.save();
      console.log("Failed transaction saved:", newTransaction._id);

      // Call Solutions service to delete booking
      try {
        const deleteResponse = await fetch(
          `${SOLUTIONS_TARGET}/booking/${bookingId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": "",
              "x-user-role": "system",
              "x-user-activate": "true",
            },
          }
        );

        const deleteResult = await deleteResponse.json();
        console.log("Booking deletion result:", deleteResult);

        return res.status(200).json({
          success: false,
          message: "Payment Failed. Booking cancelled.",
          bookingId: bookingId,
          reason: message,
        });
      } catch (error) {
        console.error("Error deleting booking:", error);
        return res.status(200).json({
          success: false,
          message: "Payment Failed but could not cancel booking",
          bookingId: bookingId,
          error: error.message,
        });
      }
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
