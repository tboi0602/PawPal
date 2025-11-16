import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Trash, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";
import { OrderSummaryCard } from "../components/models/Orders/OrderSummaryCard";
import { setItem } from "../utils/operations";
import { Loader } from "../components/models/Loaders/Loader.jsx";
import { Loader2 } from "../components/models/Loaders/Loader2.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/shopping/cartAPI";

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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (message && items.length === 0) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-xl p-8 bg-white rounded-xl shadow-lg">
          <ShoppingCart className="mx-auto w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold mt-4 text-gray-800">{message}</h2>
          <p className="text-gray-500 mt-2">
            Browse our wide selection of products and find something great!
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/home/products")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-150 font-semibold"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-16 md:p-32 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 border-b pb-2 text-gray-900">
          Shopping Cart ({items.length} Items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <input
                type="checkbox"
                checked={
                  selectedItems.length === items.length && items.length > 0
                }
                onChange={handleSelectAll}
                className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <label className="ml-3 text-lg font-semibold text-gray-700">
                Select All ({selectedItems.length} selected)
              </label>
            </div>

            {items.map((item, index) => (
              <div
                key={item?._id || index}
                className={`flex gap-4 p-4 bg-white border rounded-xl shadow-sm transition duration-200 
                                    ${
                                      selectedItems.includes(item._id)
                                        ? " ring-1 ring-black/10"
                                        : "border-gray-200 hover:shadow-md"
                                    }`}
              >
                <div className="flex flex-col justify-start pt-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelectItem(item._id)}
                    className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                  />
                </div>

                <img
                  src={item.productId?.images?.[0]}
                  alt={item.productId?.name}
                  className="w-24 h-24 object-cover rounded-lg border shrink-0"
                />

                <div className="grow flex flex-col justify-between">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {item.productId?.name || "Product Name"}
                      </h3>

                      <ItemOptions
                        productAttributes={item.productId?.attributes}
                        cartAttribute={item.attribute}
                        itemId={item._id}
                        onAttributeChange={handleChangeAttribute}
                      />
                    </div>

                    <div className="font-extrabold text-red-600 text-lg ml-4 shrink-0">
                      {(item.productId?.discountPrice || 0).toLocaleString(
                        "vi-VN"
                      )}
                      ₫
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleChangeQuantity(index, "dec")}
                        className="p-2 text-gray-600 hover:bg-red-50 disabled:opacity-50 transition duration-150"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="px-4 py-1 font-semibold text-gray-900 bg-gray-50">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => handleChangeQuantity(index, "inc")}
                        className="p-2 text-gray-600 hover:bg-green-50 transition duration-150"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id)}
                      className="cursor-pointer text-sm font-semibold text-red-600 flex items-center gap-1 p-2 rounded-lg hover:bg-red-50 transition duration-150"
                    >
                      <Trash className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 gap-4 p-4 bg-white rounded-xl shadow-inner border border-gray-100">
              <button
                onClick={() => navigate("/home/products")}
                className="px-6 py-3 border border-gray-400 rounded-lg button-black-outline duration-150"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                disabled={itemsForSummary.length === 0}
                className={`px-6 py-3 text-white rounded-lg shadow-lg font-extrabold 
                                    ${
                                      itemsForSummary.length > 0
                                        ? "button-black"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
              >
                {isLoading && items.length > 0 ? (
                  <Loader2 />
                ) : (
                  `
                Proceed to Checkout ${subtotal?.toLocaleString("vi-VN") + "₫"}`
                )}
              </button>
            </div>
          </div>

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
  );
};

export default CartPage;
