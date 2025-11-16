import { useEffect, useState, useCallback } from "react";
import { getItem, setItem } from "../utils/operations";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { editUser } from "../services/users/userAPI";
import { getDistance } from "../services/distanceAPI";
import { getPromotions } from "../services/promotions/promotionAPI";
import {
  filterAndFindBestPromo,
  calculateDiscountAmount,
} from "../utils/promotionLogic";
import { createOrder } from "../services/shopping/orderAPI";
import { generateMoMO } from "../services/payment/momoAPI";

const STORE_ADDRESS = "Đại học Tôn Đức Thắng, Quận 7, Thành phố Hồ Chí Minh";
// If no user is logged in, `user` will be null — hook will still work for guests
const user = getItem("user-data") || null;
const initialAddressList = user?.address || [];
const userRank = user?.rank || "Bronze";

const initialShippingInfo = {
  fullName: user?.name || "",
  phone: user?.phone || "",
  address: initialAddressList.length > 0 ? initialAddressList[0] : "",
  notes: "",
  paymentMethod: "COD",
};

const fireSwal = (type, message) => {
  Swal.fire({
    toast: true,
    position: "bottom-right",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    customClass: { popup: "swal2-toast-popup" },
  });
};

export const useOrderLogic = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState(initialShippingInfo);
  const [loading, setLoading] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);
  const [error, setError] = useState(null);
  const [addressList, setAddressList] = useState(initialAddressList);
  const [newAddressInput, setNewAddressInput] = useState("");
  const [showNewAddressInput, setShowNewAddressInput] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);

  const [bestDiscount, setBestDiscount] = useState(null);
  const [allAvailablePromos, setAllAvailablePromos] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promotions, setPromotions] = useState([]);
  const [userManuallySelectedPromo, setUserManuallySelectedPromo] =
    useState(null); // Trạng thái mới

  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalAmount = subtotal + shippingFee - discountAmount;

  const calculateShippingFee = useCallback(async (address) => {
    if (!address) {
      setShippingFee(0);
      return;
    }
    setLoadingFee(true);
    try {
      const data = await getDistance(address, STORE_ADDRESS);
      const distanceKm = data.distance_km || 0;

      let fee = 0;
      if (distanceKm > 0) {
        const baseFee = 10000;
        const feePerKm = 5000;
        fee = Math.max(20000, baseFee + Math.ceil(distanceKm) * feePerKm);
      }

      setShippingFee(fee);
    } catch (err) {
      console.error("Failed to calculate shipping fee:", err);
      setShippingFee(20000);
    } finally {
      setLoadingFee(false);
    }
  }, []);

  const handleSelectPromo = useCallback(
    (selectedPromo) => {
      // Đánh dấu mã này là do người dùng chọn bằng tay
      setUserManuallySelectedPromo(selectedPromo);

      if (!selectedPromo) {
        setBestDiscount(null);
        setDiscountAmount(0);
        fireSwal("info", "Discount code removed.");
        return;
      }

      const actualDiscount = calculateDiscountAmount(selectedPromo, subtotal);

      if (actualDiscount > 0) {
        setBestDiscount({ ...selectedPromo, actualDiscount });
        setDiscountAmount(actualDiscount);
        fireSwal(
          "success",
          `Applied discount: ${
            selectedPromo.promotionCode
          } (-${actualDiscount.toLocaleString("vi-VN")}₫)`
        );
      } else {
        fireSwal("error", "The selected code is no longer eligible."); // Nếu mã không hợp lệ, xóa nó và tự động chọn lại mã tốt nhất (hoặc không)
        setBestDiscount(null);
        setDiscountAmount(0);
        setUserManuallySelectedPromo(null);
      }
    },
    [subtotal]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "address") {
      calculateShippingFee(value);
    }

    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();

    if (!newAddressInput.trim()) {
      fireSwal("error", "Address field cannot be empty.");
      return;
    }

    const fullAddress = newAddressInput.trim();
    const updatedAddressList = [...addressList, fullAddress];

    setAddressList(updatedAddressList);
    setShippingInfo((prev) => ({ ...prev, address: fullAddress }));
    calculateShippingFee(fullAddress);

    const formData = new FormData();
    updatedAddressList.forEach((address, index) =>
      formData.append(`address[${index}]`, address)
    );

    setLoading(true);
    try {
      // If user is not logged in, persist address only locally (no API call)
      if (!user) {
        setNewAddressInput("");
        setShowNewAddressInput(false);
        fireSwal(
          "success",
          "Address saved locally. Please place order to confirm."
        );
        return;
      }

      const data = await editUser(user._id, formData);
      if (!data.success) return fireSwal("error", data.message);
      setItem("user-data", data.user);
      fireSwal("success", "New address saved and selected");
      setNewAddressInput("");
      setShowNewAddressInput(false);
    } catch (error) {
      fireSwal("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (
      !shippingInfo.fullName ||
      !shippingInfo.phone ||
      !shippingInfo.address
    ) {
      fireSwal("error", "Please fill in all required shipping details.");
      return;
    }

    if (loadingFee) {
      fireSwal(
        "error",
        "Please wait for shipping fee calculation to complete."
      );
      return;
    }

    setLoading(true);
    const orderData = {
      userId: user?._id || "GUEST",
      rank: user?.rank || null,
      address: shippingInfo,
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: shippingInfo.paymentMethod.toLowerCase(),
      shippingFee: shippingFee,
      promotionCode: bestDiscount ? bestDiscount.promotionCode : null,
    };
    try {
      const result = await createOrder(orderData);
      if (!result.success) {
        fireSwal("error", result.message);
        return;
      }
      if (shippingInfo.paymentMethod === "COD") {
        if (result.success) {
          fireSwal("success", "Order placed successfully!");
          setItem("temp_order", []);
          navigate("/home/payment/status?message=success");
        } else {
          fireSwal("error", result.message);
        }
      } else {
        const order = result.order;

        const momo = await generateMoMO(
          order?._id,
          order?.finalAmount,
          `{Pay with MoMo: OrderId ${order?._id.slice(-8).toUpperCase()}}`
        );
        if (result.success) {
          setItem("temp_order", []);
          window.location.href = momo.payUrl;
        } else {
          fireSwal("error", momo.message);
        }
      }
    } catch (err) {
      fireSwal(
        "error",
        "An unexpected error occurred while placing the order: " + err.message
      );
      console.error("Order API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load promotions for logged-in users to save resources for guests
    if (!user) return;
    const loadPromo = async () => {
      const data = await getPromotions(1, 20, "", "active");
      setPromotions(data.promotions || []);
    };
    loadPromo();
  }, []);

  useEffect(() => {
    // If user is logged in and promotions haven't loaded yet, wait.
    // For guests (no user) we should continue to initialize the order data right away.
    if (user && promotions.length === 0 && !error) return;
    const rawData = getItem("temp_order");
    let currentSubtotal = 0;
    if (rawData) {
      setOrderItems(rawData);
      currentSubtotal = rawData.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      if (rawData.length === 0) setError("No items found.");
    } else {
      setError("Order not found. Redirecting...");
      setTimeout(() => navigate("/home/products"), 3000);
    }

    if (initialShippingInfo.address) {
      calculateShippingFee(initialShippingInfo.address);
    }

    // Only auto-apply promotions for logged-in users
    if (user && !userManuallySelectedPromo) {
      const { bestPromo, maxAmount, availableList } = filterAndFindBestPromo(
        promotions,
        currentSubtotal,
        userRank
      );

      setAllAvailablePromos(availableList);
      setBestDiscount(bestPromo);
      setDiscountAmount(maxAmount);

      if (bestPromo) {
        fireSwal(
          "info",
          `Auto-applied: ${
            bestPromo.promotionCode
          } (-${bestPromo.actualDiscount.toLocaleString("vi-VN")}₫)`
        );
      }
    }
  }, [
    navigate,
    promotions,
    calculateShippingFee,
    userManuallySelectedPromo,
    error,
  ]); // Thêm userManuallySelectedPromo vào dependency array // Re-calculate Discount on Subtotal Change

  useEffect(() => {
    if (subtotal > 0 && promotions.length > 0) {
      // Luôn tính toán mã tốt nhất mới
      const { bestPromo, maxAmount, availableList } = filterAndFindBestPromo(
        promotions,
        subtotal,
        userRank
      );

      setAllAvailablePromos(availableList);

      // Nếu người dùng CHƯA chọn mã bằng tay, hoặc mã tự động tốt nhất hiện tại TỐT HƠN mã đang áp dụng
      if (!userManuallySelectedPromo) {
        setBestDiscount(bestPromo);
        setDiscountAmount(maxAmount);
      } else {
        // Nếu người dùng đã chọn bằng tay, chỉ cập nhật lại số tiền giảm của MÃ ĐÓ
        const currentDiscountAmount = calculateDiscountAmount(
          userManuallySelectedPromo, // Dùng mã người dùng đã chọn
          subtotal
        );
        // Kiểm tra xem mã đó còn hợp lệ không (actualDiscount > 0)
        if (currentDiscountAmount > 0) {
          setDiscountAmount(currentDiscountAmount);
          setBestDiscount({
            ...userManuallySelectedPromo,
            actualDiscount: currentDiscountAmount,
          });
        } else {
          // Nếu mã người dùng chọn không còn hợp lệ, hủy bỏ và trở lại mã tự động tốt nhất
          setUserManuallySelectedPromo(null);
          setBestDiscount(bestPromo);
          setDiscountAmount(maxAmount);
          fireSwal(
            "error",
            "The manually selected code is no longer eligible and has been removed."
          );
        }
      }
    } else if (subtotal === 0) {
      setAllAvailablePromos([]);
      setBestDiscount(null);
      setDiscountAmount(0);
      setUserManuallySelectedPromo(null);
    }
  }, [subtotal, promotions, userManuallySelectedPromo]); // Thêm userManuallySelectedPromo vào dependency array

  return {
    // States
    orderItems,
    shippingInfo,
    loading,
    loadingFee,
    error,
    addressList,
    newAddressInput,
    showNewAddressInput,
    shippingFee,
    bestDiscount,
    allAvailablePromos,
    discountAmount,
    subtotal,
    totalAmount,

    setNewAddressInput,
    setShowNewAddressInput,
    handleSelectPromo,
    handleInputChange,
    handleSaveNewAddress,
    handlePlaceOrder,
    getShortAddress: (addr) =>
      addr
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)
        .slice(-3)
        .join(", "),

    user,
    userRank,
  };
};
