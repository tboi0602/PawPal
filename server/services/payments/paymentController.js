import {
  MOMO_ACCESS_KEY,
  MOMO_PARTNER_CODE,
  MOMO_API_ENDPOINT,
  SHOPPING_TARGET,
} from "../../configs/config.js";
import { createMoMoSignature } from "../../utils/momoUtils.js";
import Transaction from "./models/Transaction.js";

export const initiateMoMoPayment = async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;
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
    const redirectUrl = "http://localhost:5173/home/payment/status";
    const ipnUrl = "http://localhost:5007/payments/momo/ipn";

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${strAmount}` +
      `&extraData=` +
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
      extraData: "",
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
