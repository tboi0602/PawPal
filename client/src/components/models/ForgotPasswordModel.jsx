import { useState } from "react";
import { Mail, Check, Lock, ArrowLeft } from "lucide-react";
import InputForm from "../inputs/InputForm";
import { requiredChangePassword } from "../../services/auth/verifyAPI";
import Swal from "sweetalert2";

const ModelForgotPassword = ({ setIsClick }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!email.trim()) {
      setMessage("Email cannot be empty.");
      return;
    }
    try {
      const data = await requiredChangePassword(email);
      if (!data.success) {
        setMessage(data.message);
        return;
      }
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: { popup: "swal-margin" },
      });
      setIsSubmit(true);
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (isSubmit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-green-600 mb-3">
              Check your email
            </h2>

            <p className="text-gray-700 mb-2 leading-relaxed">
              We've sent a password reset link to your email.
            </p>
            <p className="text-black font-semibold mb-6">{email}</p>

            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Didn’t receive the email? Please check your spam folder or contact
              support if the issue continues.
            </p>
            <button
              className="button-black w-full py-3 rounded-xl hover:scale-105 "
              onClick={() => setIsClick(false)}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center m-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Forgot your password?
          </h1>
          <p className="text-gray-600 leading-relaxed mb-12">
            Don’t worry! Enter your email address below and we’ll send you
            instructions to reset your password.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-center"
      >
        <div className="p-8 rounded-2xl shadow-lg flex flex-col gap-2 w-1/3 min-w-96 bg-white border border-gray-200">
          <div className="flex flex-col gap-3">
            <label className="font-medium text-black">Email address</label>
            <InputForm
              placeholder="Enter your email address"
              Icon={Mail}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-red-600">{message}</p>
            <button
              type="submit"
              className="bg-green-500 font-semibold py-2  rounded-xl text-xl text-white  hover:bg-green-600 active:bg-green-700 transition-all cursor-pointer"
            >
              Send
            </button>
            <div className="py-5 mt-5 border-t border-gray-300">
              <button
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-black font-medium group transition-all cursor-pointer"
                onClick={() => setIsClick(false)}
              >
                <ArrowLeft className="w-4 group-hover:-translate-x-1 transition-all" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default ModelForgotPassword;
