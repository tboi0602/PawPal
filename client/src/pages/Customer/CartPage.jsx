import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Trash, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";
import { OrderSummaryCard } from "../../components/models/Orders/OrderSummaryCard.jsx";
import { setItem } from "../../utils/operations.js";
import { Loader } from "../../components/models/Loaders/Loader.jsx";
import { Loader2 } from "../../components/models/Loaders/Loader2.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../../services/shopping/cartAPI.js";

const ItemOptions = ({
  productAttributes,
  cartAttribute,
  itemId,
  onAttributeChange,
}) => {
  const combinedOptions = {
    ...cartAttribute,
    ...productAttributes,
  };
  const optionEntries = Object.entries(combinedOptions).filter(([, v]) => v);

  if (optionEntries.length === 0) return null;
  const handleSelectChange = (key, value) => {
    onAttributeChange(itemId, key, value);
  };

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-2">
      {optionEntries.map(([key, value]) => {
        const availableValues = value
          .toString()
          .split(",")
          .map((v) => v.trim());
        const currentValue = cartAttribute?.[key] || availableValues[0];

        return (
          <div key={key} className="flex items-center">
            <span className="font-medium capitalize text-gray-800 mr-2">
              {key}:
            </span>

            {availableValues.length > 1 ||
            (availableValues.length === 1 &&
              availableValues[0] !== currentValue) ? (
              <select
                value={currentValue}
                onChange={(e) => handleSelectChange(key, e.target.value)}
                className="border border-gray-300 rounded-md p-1 bg-white text-gray-700 focus:ring-black focus:border-black"
              >
                {!availableValues.includes(currentValue) && (
                  <option value={currentValue}>{currentValue}</option>
                )}
                {availableValues.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <span className="ml-1 text-gray-600">{currentValue}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  const [pendingChanges, setPendingChanges] = useState({});
  const debouncedChanges = useDebounce(pendingChanges, 500);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCart();
      if (data.success) {
        setItems(data.items);
        if (data.items.length === 0) {
          setMessage("Your cart is empty.");
          setSelectedItems([]);
        } else {
          setMessage("");
          setSelectedItems(data.items.map((item) => item._id));
        }
      } else {
        setMessage(data.message || "Failed to load cart.");
        setItems([]);
        setSelectedItems([]);
      }
    } catch (err) {
      console.warn("Cart API not available.", err?.message);
      setMessage("Could not connect to the shopping cart service.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    const updateApi = async () => {
      setIsLoading(true);
      let shouldReload = false;

      for (const [itemId, change] of Object.entries(debouncedChanges)) {
        if (change.quantity > 0 || change.attribute) {
          try {
            const payload = {};
            if (change.quantity) payload.quantity = change.quantity;
            if (change.attribute) payload.attribute = change.attribute;

            const dataRes = await updateCartItem(itemId, payload);

            if (!dataRes.success) {
              Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                  dataRes.message ||
                  "Failed to update item. Check stock/options.",
              });
              shouldReload = true;
            }

            setPendingChanges((prev) => {
              const next = { ...prev };
              delete next[itemId];
              return next;
            });
          } catch (error) {
            console.error("Error updating cart item:", error);
            shouldReload = true;
          }
        }
      }

      if (shouldReload) {
        loadCart();
      } else {
        setIsLoading(false);
      }
    };

    if (Object.keys(debouncedChanges).length > 0) {
      updateApi();
    }
  }, [debouncedChanges, loadCart]);

  const updateItemStateAndDebounce = (itemId, updatedFields) => {
    const itemIndex = items.findIndex((item) => item._id === itemId);
    if (itemIndex === -1) return;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, ...updatedFields } : item
      )
    );

    setPendingChanges((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        ...updatedFields,
        quantity:
          updatedFields.quantity !== undefined
            ? updatedFields.quantity
            : prev[itemId]?.quantity || items[itemIndex].quantity,
        attribute:
          updatedFields.attribute !== undefined
            ? updatedFields.attribute
            : prev[itemId]?.attribute || items[itemIndex].attribute,
      },
    }));
  };

  const handleChangeQuantity = (index, action) => {
    const itemToUpdate = items[index];
    const currentDebouncedChange = pendingChanges[itemToUpdate._id] || {};
    let newQuantity = currentDebouncedChange.quantity || itemToUpdate.quantity;

    if (action === "inc") {
      newQuantity += 1;
    } else if (action === "dec") {
      newQuantity -= 1;
    }

    if (newQuantity < 1) {
      handleRemove(itemToUpdate._id);
      return;
    }

    updateItemStateAndDebounce(itemToUpdate._id, { quantity: newQuantity });
  };

  const handleChangeAttribute = (itemId, attrKey, attrValue) => {
    const itemIndex = items.findIndex((item) => item._id === itemId);
    if (itemIndex === -1) return;

    const itemToUpdate = items[itemIndex];
    const currentAttribute =
      pendingChanges[itemId]?.attribute || itemToUpdate.attribute;

    const newAttribute = { ...currentAttribute, [attrKey]: attrValue };

    updateItemStateAndDebounce(itemId, { attribute: newAttribute });
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item._id));
    }
  };

  const handleRemove = async (itemId) => {
    const itemToRemove = items.find((item) => item._id === itemId);
    if (!itemToRemove) return;

    const result = await Swal.fire({
      title: "Remove Item?",
      text: `Do you want to remove "${itemToRemove.productId.name}" from your cart?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "gray",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      setIsLoading(true);

      const newItems = items.filter((item) => item._id !== itemId);
      setItems(newItems);
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));

      try {
        const dataRes = await removeCartItem(itemId);

        if (!dataRes.success) {
          Swal.fire({
            title: "Error!",
            text: dataRes.message || "Failed to remove item.",
            icon: "error",
          });
          loadCart();
        } else {
          Swal.fire({
            toast: true,
            position: "bottom-right",
            icon: "success",
            title: `${itemToRemove.productId.name} has been removed`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          if (newItems.length === 0) setMessage("Your cart is empty.");
        }
      } catch (error) {
        console.error("Error removing cart item:", error);
        Swal.fire({
          title: "Server Error!",
          text: "An error occurred while removing the item.",
          icon: "error",
        });
        loadCart();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const itemsForSummary = items.filter((item) =>
    selectedItems.includes(item._id)
  );
  const finalItemsFoSummary = itemsForSummary.map((item) => ({
    productId: item.productId?._id || item.productId,
    image: item.productId?.images?.[0] || item.image,
    name: item.productId?.name || item.name,
    price: item.productId?.discountPrice || item.price || 0,
    quantity: item.quantity || 1,
  }));

  const subtotal = itemsForSummary.reduce(
    (acc, it) => acc + (it.productId?.discountPrice || 0) * (it.quantity || 0),
    0
  );

  const handleCheckout = () => {
    if (itemsForSummary.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Items Selected",
        text: "Please select at least one item to proceed to checkout.",
      });
      return;
    }
    try {
      setItem("temp_order", finalItemsFoSummary);
    } catch (e) {
      console.warn("Failed to persist temp_order for checkout:", e?.message);
    }
    navigate("/home/payment");
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (message && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <ShoppingCart className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">{message}</h2>
          <p className="text-gray-600 mb-6">
            Browse our collection and add items to your cart.
          </p>
          <button
            onClick={() => navigate("/home/products")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition font-semibold"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 md:px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-bold text-black mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{items.length} item(s) in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={
                  selectedItems.length === items.length && items.length > 0
                }
                onChange={handleSelectAll}
                className="w-5 h-5 border-gray-300 rounded cursor-pointer"
              />
              <label className="ml-3 font-medium text-black">
                Select All ({selectedItems.length}/{items.length})
              </label>
            </div>

            {/* Items */}
            {items.map((item, index) => (
              <div
                key={item?._id || index}
                className={`flex gap-4 p-4 border rounded-lg transition duration-200 ${
                  selectedItems.includes(item._id)
                    ? "border-black bg-gray-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  className="w-5 h-5 border-gray-300 rounded cursor-pointer mt-1 shrink-0"
                />

                <img
                  src={item.productId?.images?.[0]}
                  alt={item.productId?.name}
                  className="w-24 h-24 object-cover rounded border border-gray-200 shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black line-clamp-2">
                        {item.productId?.name || "Product"}
                      </h3>
                      <ItemOptions
                        productAttributes={item.productId?.attributes}
                        cartAttribute={item.attribute}
                        itemId={item._id}
                        onAttributeChange={handleChangeAttribute}
                      />
                    </div>
                    <div className="font-bold text-lg text-black ml-4 shrink-0">
                      {(item.productId?.discountPrice || 0).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => handleChangeQuantity(index, "dec")}
                        className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="px-3 py-1 font-medium bg-white text-black">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => handleChangeQuantity(index, "inc")}
                        className="p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-2 rounded hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate("/home/products")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                disabled={itemsForSummary.length === 0}
                className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition ${
                  itemsForSummary.length > 0
                    ? "bg-black hover:bg-gray-900"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {isLoading && items.length > 0
                  ? "Processing..."
                  : `Checkout - ${subtotal?.toLocaleString("vi-VN")}₫`}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummaryCard
              orderItems={finalItemsFoSummary}
              subtotal={subtotal}
              shippingFee={0}
              loadingFee={false}
              discountAmount={0}
              totalAmount={subtotal}
              bestDiscount={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
