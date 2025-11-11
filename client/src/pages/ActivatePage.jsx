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

  // ✅ Dùng useRef để đảm bảo API chỉ được gọi 1 lần
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
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    // ✅ Chặn không cho chạy lại lần thứ 2
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!email || !token) {
      setSuccess(false);
      setMessage(
        "The activation link is invalid or incomplete. Please check your email."
      );
      setIsInitialLoading(false);
      return;
    }

    const activateAccount = async () => {
      try {
        const data = await activate(email, token);

        if (!data.success) {
          setSuccess(false);
          setMessage(data.message);
          return;
        }

        setSuccess(true);
        setMessage(data.message);

        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "success",
          title: data.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          customClass: {
            popup: "swal-margin",
          },
        });
      } catch (error) {
        setSuccess(false);
        setMessage(
          `Activation failed: The server could not process your request. (${error.message})`
        );
      } finally {
        setIsInitialLoading(false);
      }
    };

    activateAccount();
  }, [email, token]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsInitialLoading(true);

    try {
      const data = await requiredActivate(email);
      localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
      setCooldown(COOLDOWN_TIME);

      if (!data.success) {
        setSuccess(false);
        setMessage(data.message);
        setIsInitialLoading(false);
        return;
      }

      setSuccess(false);
      setMessage(data.message);

      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
    } catch (error) {
      setMessage(`Resend failed: ${error.message}`);
      setSuccess(false);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {success ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-black mb-6">
            Account Activated
          </h1>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold text-green-700 mb-6">
              {message}
            </p>
            <a
              href="/login"
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition duration-300"
            >
              Login now
            </a>
          </div>
        </div>
      ) : (
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
              <p className="text-xs text-gray-500 mt-3">
                Cannot resend without email address from the link.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
