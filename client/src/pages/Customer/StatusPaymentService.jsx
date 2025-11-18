import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getItem } from "../../utils/operations";

const StatusLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    <span className="ml-4 text-lg text-gray-700">
      Verifying booking payment...
    </span>
  </div>
);

export const StatusPaymentService = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState({
    isLoading: true,
    isSuccess: false,
    message: null,
    title: null,
    bookingDetails: null,
  });

  const block = useRef(false);

  const handlePaymentVerification = async () => {
    try {
      // Get query parameters from MoMo callback
      const queryString = window.location.search;
      console.log("Verifying payment with query:", queryString);

      // Call payment verification endpoint
      const response = await fetch(
        `http://localhost:5000/api-payment/payments/momo/service-booking${queryString}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log("Payment verification response:", data);

      if (data.success && data.booking) {
        setPaymentStatus({
          isLoading: false,
          isSuccess: true,
          title: "Booking Confirmed!",
          message:
            data.message ||
            "Your payment has been verified and booking is confirmed.",
          bookingDetails: data.booking,
        });
      } else if (data.success && data.paymentStatus === "completed") {
        // Payment succeeded but booking might not have created
        setPaymentStatus({
          isLoading: false,
          isSuccess: true,
          title: "Payment Confirmed",
          message: data.bookingError
            ? `Payment successful but booking failed: ${data.bookingError}`
            : "Payment has been successfully processed.",
          bookingDetails: data.booking || null,
        });
      } else {
        setPaymentStatus({
          isLoading: false,
          isSuccess: false,
          title: "Payment Verification Failed",
          message:
            data.message || "Could not verify payment. Please contact support.",
          bookingDetails: null,
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentStatus({
        isLoading: false,
        isSuccess: false,
        title: "System Error",
        message: "An unexpected error occurred during payment verification.",
        bookingDetails: null,
      });
    }
  };

  useEffect(() => {
    if (!block.current) {
      block.current = true;
      handlePaymentVerification();
    }
  }, []);

  const statusData = paymentStatus.isSuccess
    ? {
        icon: <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />,
        color: "bg-green-50 border-green-300",
        textColor: "text-green-700",
      }
    : {
        icon: <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />,
        color: "bg-red-50 border-red-300",
        textColor: "text-red-700",
      };

  if (paymentStatus.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-md w-full p-8 rounded-xl shadow-2xl text-center border-4 bg-blue-50 border-blue-300">
          <StatusLoader />
          <h1 className="text-xl font-bold mt-4 text-blue-700">
            Processing Your Booking...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div
        className={`max-w-2xl w-full p-8 rounded-xl shadow-2xl text-center border-4 ${statusData.color}`}
      >
        {statusData.icon}

        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
          {paymentStatus.title}
        </h1>

        <p className="text-gray-600 mb-8">{paymentStatus.message}</p>

        {/* Booking Details */}
        {paymentStatus.bookingDetails && paymentStatus.isSuccess && (
          <div className="bg-white border-2 border-green-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Booking Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Booking ID</p>
                <p className="text-lg font-semibold text-gray-900 break-all">
                  {paymentStatus.bookingDetails._id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Service</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentStatus.bookingDetails.solutionName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Date & Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(
                    paymentStatus.bookingDetails.dateStarts
                  ).toLocaleString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Status</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                  {paymentStatus.bookingDetails.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Pets</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentStatus.bookingDetails.pets
                    ?.map((p) => p.petName)
                    .join(", ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Amount
                </p>
                <p className="text-lg font-bold text-green-600">
                  {paymentStatus.bookingDetails.totalAmount?.toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Hire Shipper
                </p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    paymentStatus.bookingDetails.hireShipper
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {paymentStatus.bookingDetails.hireShipper
                    ? "Yes (+50,000₫)"
                    : "No"}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Insurance</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    paymentStatus.bookingDetails.insurance
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {paymentStatus.bookingDetails.insurance
                    ? "Yes (+20,000₫)"
                    : "No"}
                </span>
              </div>
              {paymentStatus.bookingDetails.hireShipper &&
                paymentStatus.bookingDetails.shipperAddress && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Shipping Address
                    </p>
                    <p className="text-sm text-gray-900 whitespace-normal">
                      {paymentStatus.bookingDetails.shipperAddress}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Debug Info for Payment Success but Booking Failed */}
        {paymentStatus.isSuccess && !paymentStatus.bookingDetails && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-yellow-800 font-semibold mb-2">
              Payment Completed
            </p>
            <p className="text-sm text-yellow-700">
              Your payment has been processed successfully, but we were unable
              to create the booking automatically. Please try booking again or
              contact support.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            to="/home"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150"
          >
            Go Back Home
          </Link>

          {paymentStatus.isSuccess && (
            <Link
              to="/home/bookings"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-400 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150"
            >
              View My Bookings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPaymentService;
