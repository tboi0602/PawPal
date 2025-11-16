// File: src/components/Payment/ShippingForm.jsx

import { MapPin, Plus, Check } from "lucide-react";
import { Loader2 } from "../models/Loaders/Loader2"; // Đảm bảo đường dẫn đúng

export const ShippingForm = ({
  shippingInfo,
  addressList,
  newAddressInput,
  showNewAddressInput,
  loading,
  handleInputChange,
  handleSaveNewAddress,
  setNewAddressInput,
  setShowNewAddressInput,
  getShortAddress,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold border-b-2 border-black pb-2">
        Shipping Information
      </h2>
      {/* Không dùng <form> ở đây mà dùng ở component chính để submit cuối cùng */}
      <div className="space-y-4 pt-4">
        <input
          type="text"
          name="fullName"
          placeholder="Recipient's Full Name"
          value={shippingInfo.fullName}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-400 rounded-lg focus:ring-green-600 focus:border-green-600 transition-all"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={shippingInfo.phone}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-400 rounded-lg focus:ring-green-600 focus:border-green-600 transition-all"
          required
        />

        <div className="flex gap-3">
          <div className="grow relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            <select
              name="address"
              value={shippingInfo.address}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-3 border border-gray-400 rounded-lg focus:ring-green-600 focus:border-green-600 appearance-none bg-white transition-all cursor-pointer"
              required
            >
              <option value="">Select or enter address</option>
              {addressList &&
                addressList.length > 0 &&
                addressList.map((addr, index) => (
                  <option key={index} value={addr}>
                    {getShortAddress(addr)}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowNewAddressInput((prev) => !prev)}
            className={`p-3 border rounded-lg transition-colors flex items-center font-medium whitespace-nowrap ${
              showNewAddressInput
                ? "bg-black text-white border-black"
                : "bg-white border-green-600 text-green-600 hover:bg-green-50"
            }`}
          >
            {showNewAddressInput ? (
              "Cancel"
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" /> Add New
              </>
            )}
          </button>
        </div>

        {showNewAddressInput && (
          <div className="border border-green-600 p-4 rounded-lg bg-green-50 mt-4 transition-all duration-300">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Enter New Address
            </h4>
            <textarea
              value={newAddressInput}
              onChange={(e) => setNewAddressInput(e.target.value)}
              placeholder="Detailed Shipping Address"
              rows="3"
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-green-600 focus:border-green-600 transition-all"
              required
            />
            <button
              type="button"
              onClick={handleSaveNewAddress}
              disabled={loading}
              className="w-full py-2 mt-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
            >
              {loading ? <Loader2 /> : <Check className="w-4 h-4 mr-2" />} Save
              and Select
            </button>
          </div>
        )}
        <textarea
          name="notes"
          placeholder="Order Notes (Optional)"
          value={shippingInfo.notes}
          onChange={handleInputChange}
          rows="2"
          className="w-full p-3 border border-gray-400 rounded-lg focus:ring-green-600 focus:border-green-600 transition-all"
        />
      </div>
    </div>
  );
};
