import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { CheckCircle, XCircle } from "lucide-react";
import { activate, requiredActivate } from "../services/auth/verifyAPI";
import { Loader2 } from "../components/models/Loaders/Loader2";

export const ActivatePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [message, setMessage] = useState("Processing activation...");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const COOLDOWN_TIME = 120;
  const LOCAL_STORAGE_KEY = "lastActivateResendTime";

  const hasRunRef = useRef(false);

  useEffect(() => {
    const lastSent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      const remaining = COOLDOWN_TIME - elapsed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setIsInitialLoading(true);

    try {
      const dataRes = await requiredActivate(email);
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: dataRes.success ? "success" : "error",
        title: dataRes.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
      if (dataRes.success) {
        setCooldown(COOLDOWN_TIME);
        localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
      }
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "error",
        title: `An error occurred during resend: ${error.message}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    const handleActivate = async () => {
      if (hasRunRef.current || !email || !token) {
        if (!email) setMessage("Error: Email parameter is missing.");
        if (!token) setMessage("Error: Token parameter is missing.");
        setIsInitialLoading(false);
        return;
      }
      hasRunRef.current = true;
      try {
        const dataRes = await activate(email, token);
        if (dataRes.success) {
          setMessage(dataRes.message);
          setSuccess(true);
        } else {
          setMessage(dataRes.message);
          setSuccess(false);
        }
      } catch (error) {
        setMessage(
          `An unexpected error occurred during activation: ${error.message}`
        );
        setSuccess(false);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (email && token) {
      handleActivate();
    } else {
      setIsInitialLoading(false);
      setSuccess(false);
      setMessage(
        "Invalid activation link. Please resend the link or check your email."
      );
    }
  }, [email, token]);

  return (
    // Responsive: Căn giữa màn hình và đảm bảo chiều cao tối thiểu là 100vh
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {isInitialLoading && !success && (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Activation in Progress
          </h1>
          <div className="flex flex-col items-center">
            <Loader2 />
            <p className="text-lg font-semibold text-gray-700 mt-4">
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Activation Success */}
      {success === true && (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-green-600 mb-6">
            Activation Success
          </h1>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold text-green-700 mb-6">
              {message}
            </p>
            <a
              href="/login"
              className="w-full p-3 rounded-xl font-bold transition duration-300 bg-black text-white hover:bg-gray-800 cursor-pointer"
            >
              Go to Login
            </a>
          </div>
        </div>
      )}

      {/* Activation Failed */}
      {success === false && !isInitialLoading && (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-red-600 mb-6">
            Activation Failed
          </h1>
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-red-700 mb-6">{message}</p>
            <button
              disabled={cooldown > 0 || !email || isInitialLoading}
              className={`w-full p-3 rounded-xl font-bold transition duration-300 ${
                cooldown > 0 || !email
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800 cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
              }`}
              onClick={handleResend}
            >
              {cooldown > 0 ? (
                `Please wait ${formatTime(cooldown)}`
              ) : isInitialLoading ? (
                <div className="w-full flex items-center justify-center">
                  <Loader2 />
                </div>
              ) : (
                "Resend Activation link"
              )}
            </button>
            {!email && (
              <p className="text-sm text-gray-500 mt-4">
                Email parameter is missing. Cannot resend link.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
