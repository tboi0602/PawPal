import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { CheckCircle, XCircle } from "lucide-react";
import { activate, requiredActivate } from "../services/auth/verifyAPI";

export const ActivatePage = () => {
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(); 

  const [cooldown, setCooldown] = useState(0);
  const COOLDOWN_TIME = 120;
  const LOCAL_STORAGE_KEY = "lastActivateResendTime";

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
    if (!email || !token) {
      setSuccess(false);
      setMessage("The activation link is invalid. Please check again.");
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
        setMessage(`Activation failed: ${error.message}`);
      }
    };
    activateAccount();
  }, [email, token]);

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      const data = await requiredActivate(email);
      if (!data.success) {
        setSuccess(false);
        setMessage(data.message); 
        return;
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
      setCooldown(COOLDOWN_TIME);

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
      setMessage(`Resend failed: ${error.message}`);
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
          <h1 className="text-3xl font-bold text-black mb-6">Success</h1>

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
          <h1 className="text-3xl font-bold text-red-600 mb-6">Error</h1>

          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />

            <p className="text-lg font-semibold text-red-700 mb-6">{message}</p>

            <button
              disabled={cooldown > 0}
              className={`w-full p-3 rounded-xl font-bold transition duration-300 ${
                cooldown > 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800 cursor-pointer"
              }`}
              onClick={handleResend}
            >
              {cooldown > 0
                ? `Please wait ${formatTime(cooldown)}`
                : "Resend Activation link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
