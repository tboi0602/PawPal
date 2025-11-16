import { useNavigate } from "react-router-dom";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import { useOrderLogic } from "../hooks/useOrderLogic";
import { Loader2 } from "../components/models/Loaders/Loader2";
import { ShippingForm } from "../components/inputs/ShippingForm";
import { PromotionSection } from "../components/models/Promotions/PromotionSection";
import { OrderSummaryCard } from "../components/models/Orders/OrderSummaryCard";
import { momoLogo } from "../assets/images.js";

export const ProductPaymentPage = () => {
  const navigate = useNavigate();

  const {
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
    getShortAddress,
  } = useOrderLogic();

  if (error && orderItems.length === 0) {
    return (
      <div className="text-center p-20 text-red-600 font-semibold">{error}</div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="w-full flex justify-center items-center">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-16">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold mb-8 flex items-center text-black">
          <ShoppingBag className="w-8 h-8 mr-3 text-green-600" /> Checkout
          Confirmation
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 hover:text-green-600 mb-6 flex items-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1 cursor-pointer" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORMS & PROMOTIONS */}
          <div className="space-y-8">
            {/* Shipping Form */}
            <ShippingForm
              shippingInfo={shippingInfo || ""}
              addressList={addressList || ""}
              newAddressInput={newAddressInput || ""}
              showNewAddressInput={showNewAddressInput || false}
              loading={loading}
              handleInputChange={handleInputChange }
              handleSaveNewAddress={handleSaveNewAddress}
              setNewAddressInput={setNewAddressInput}
              setShowNewAddressInput={setShowNewAddressInput}
              getShortAddress={getShortAddress}
            />

            {/*  Promotions Section */}
            <PromotionSection
              allAvailablePromos={allAvailablePromos}
              bestDiscount={bestDiscount}
              handleSelectPromo={handleSelectPromo}
            />

            {/* Payment Method và nút Place Order */}
            <div>
              <h2 className="text-2xl font-semibold border-b-2 border-black pb-2">
                Payment Method
              </h2>
              <div className="space-y-3 pt-4">
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    shippingInfo.paymentMethod === "COD"
                      ? "border-green-600 bg-green-50 shadow-sm"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={shippingInfo.paymentMethod === "COD"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-600 checked:bg-green-600 transition-colors"
                  />
                  <span className="ml-3 font-medium text-gray-900">
                    Cash on Delivery (COD)
                  </span>
                </label>
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    shippingInfo.paymentMethod === "MOMO"
                      ? "border-green-600 bg-green-50 shadow-sm"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOMO"
                    checked={shippingInfo.paymentMethod === "MOMO"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-600 checked:bg-green-600 transition-colors"
                  />
                  <span className="ml-3 font-medium text-gray-900 flex gap-3 justify-center items-center">
                    MoMo E-Wallet
                    <img src={momoLogo} alt="momologo" className="w-7 h-7" />
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || loadingFee || orderItems.length === 0}
                className="w-full py-4 mt-6 bg-green-600 text-white text-xl font-bold rounded-lg 
                hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center ">
                    <Loader2 /> Processing Order...
                  </div>
                ) : (
                  `BUY NOW ${totalAmount.toLocaleString("en-US")}₫`
                )}
              </button>
            </div>
          </div>
          {/* CỘT 2: ORDER SUMMARY */}
          <OrderSummaryCard
            orderItems={orderItems}
            subtotal={subtotal}
            shippingFee={shippingFee}
            loadingFee={loadingFee}
            discountAmount={discountAmount}
            bestDiscount={bestDiscount}
            totalAmount={totalAmount}
          />
        </div>
      </div>
    </div>
  );
};
