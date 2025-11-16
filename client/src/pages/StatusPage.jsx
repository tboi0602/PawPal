import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { resultMoMO } from "../services/payment/momoAPI";

const StatusLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    <span className="ml-4 text-lg text-gray-700">Verifying payment...</span>
  </div>
);

export const StatusPage = () => {
  const [searchParams] = useSearchParams();

  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isSuccess: false,
    message: null,
    title: null,
  });

  const paramsArray = useMemo(
    () => Array.from(searchParams.entries()),
    [searchParams]
  );

  const isMomoPayment = paramsArray.length > 1;

  const initialMessage = searchParams.get("message")?.toLowerCase() || "";

  const initialIsSuccess = initialMessage.startsWith("success");

  const handleMomoVerification = useCallback(async () => {
    const queryString = window.location.search;

    try {
      const data = await resultMoMO(queryString);

      if (data.success) {
        setApiStatus({
          isLoading: false,
          isSuccess: true,
          title: "Payment Confirmed & Order Placed!",
          message:
            data.message ||
            "Your payment has been successfully verified and your order is confirmed.",
        });
      } else {
        setApiStatus({
          isLoading: false,
          isSuccess: false,
          title: "Payment Verification Failed!",
          message:
            data.message ||
            "Could not verify payment. Please check your order history or contact support.",
        });
      }
    } catch (error) {
      console.error("Momo verification error:", error);
      setApiStatus({
        isLoading: false,
        isSuccess: false,
        title: "System Error!",
        message: "An unexpected error occurred during payment verification.",
      });
    }
  }, []);

  const block = useRef(false);
  useEffect(() => {
    if (isMomoPayment) {
      if (!block.current) {
        block.current = true;
        handleMomoVerification();
      }
    } else {
      setApiStatus({
        isLoading: false,
        isSuccess: initialIsSuccess,
        title: initialIsSuccess
          ? "Order Placed Successfully!"
          : "Order Placement Failed!",
        message: initialIsSuccess
          ? "Thank you for your order. Your purchase has been confirmed and we're preparing it for shipment."
          : "We're sorry, but there was an issue processing your order. Please try again or contact support.",
      });
    }
  }, [isMomoPayment, initialIsSuccess, handleMomoVerification]);

  const statusData = apiStatus.isSuccess
    ? {
        icon: <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />,
        color: "bg-green-50 border-green-300",
      }
    : {
        icon: <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />,
        color: "bg-red-50 border-red-300",
      };

  if (apiStatus.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-md w-full p-8 rounded-xl shadow-2xl text-center border-4 bg-blue-50 border-blue-300">
          <StatusLoader />
          <h1 className="text-xl font-bold mt-4 text-blue-700">
            Processing Your Payment Result...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div
        className={`max-w-md w-full p-8 rounded-xl shadow-2xl text-center border-4 ${statusData.color}`}
      >
        {statusData.icon}

        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900">
          {apiStatus.title}
        </h1>

        <p className="text-gray-600 mb-8">{apiStatus.message}</p>

        <Link
          to="/home"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 mr-4"
        >
          Go Back Home
        </Link>

        <Link
          to="/home/orders"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-400 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150"
        >
          See Order
        </Link>
      </div>
    </div>
  );
};

export default StatusPage;
