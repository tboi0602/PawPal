import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Home,
  CheckCircle,
  AlertTriangle,
  CircleX,
} from "lucide-react";
import InputForm from "../components/inputs/InputForm";
import { logo } from "../assets/images";
import { imgServices } from "../assets/images";
import Swal from "sweetalert2";
import { validatePassword } from "../utils/validatePassword";
import { Loader2 } from "../components/models/Loaders/Loader2";
//API
import { register } from "../services/auth/indentityAPI";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    document.title = "PalPaw | Register";
  }, []);

  useEffect(() => {
    setIsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  useEffect(() => {
    if (password.length > 0) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(false);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (!fullName || !address || !email || !password || !confirmPassword) {
      setIsLoading(false);
      setError("Please fill in all fields!");
      return;
    }

    if (password !== confirmPassword) {
      setIsLoading(false);
      setError("Passwords do not match!");
      return;
    }

    if (!passwordValidation) {
      setIsLoading(false);
      setError(
        "Password is too weak. Please ensure it meets all strength requirements."
      );
      return;
    }

    try {
      const data = await register(fullName, address, email, password);

      if (!data.success) {
        setIsLoading(false);
        setError(data.message);
        return;
      }

      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });

      navigate("/login");
    } catch (error) {
      setIsLoading(false);
      setError(`Registration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center w-full p-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-5 w-full px-40">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="logo" className="w-36 " />
        </div>

        <div className="flex items-center gap-2 text-md border-2 border-gray-400 rounded-md px-2 py-1">
          <h1>Already have an account?</h1>
          <div className="border border-r h-10"></div>
          <div
            className="button-black p-2 rounded-lg"
            onClick={() => navigate("/login")}
          >
            Login
          </div>
        </div>
      </div>
      {/* Register box */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[866px] flex flex-col lg:flex-row overflow-hidden border border-gray-200">
        {/* Left image */}
        <div className="hidden lg:block lg:w-1/2 z-10 ">
          <img
            src={imgServices["Beauty"]}
            alt="register_illustration"
            className="p-2 rounded-2xl w-full h-full object-cover object-center"
          />
        </div>
        {/* Right form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 bg-white bg-opacity-95 backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-8 text-center">Register</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
            <InputForm
              placeholder="Full name"
              Icon={User}
              type="text"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <InputForm
              placeholder="Address"
              Icon={Home}
              type="text"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <InputForm
              placeholder="Email"
              Icon={Mail}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* Input Password */}
            <div className="relative">
              <div className="relative group">
                <InputForm
                  placeholder="Password"
                  Icon={Lock}
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute z-10 p-2 w-full text-center bg-black/40 backdrop-blur-[2px] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  Password must be longer than 7 characters and contain the
                  characters a-z, A-Z, 0-9, !@#,...
                </div>
              </div>
              {password.length > 0 && (
                <div className=" absolute top-3 -right-6">
                  {passwordValidation ? (
                    <CheckCircle className="w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 text-yellow-500" />
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <InputForm
                placeholder="Confirm Password"
                Icon={Lock}
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {(password.length > 0 || confirmPassword.length > 0) && (
                <div className=" absolute top-3 -right-6">
                  {isMatch ? (
                    <CheckCircle className="w-5 text-green-500" />
                  ) : (
                    <CircleX className="w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="submit"
              className="bg-black text-white font-bold hover:bg-black/80  p-3 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-600 duration-150"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex w-full justify-center items-center">
                  <Loader2 />
                </div>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
