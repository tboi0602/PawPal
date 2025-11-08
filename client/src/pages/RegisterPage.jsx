import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Home,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import InputForm from "../components/inputs/InputForm";
import { logo } from "../assets/images";
import { imgServices } from "../assets/images";
import Swal from "sweetalert2";
import { validatePassword } from "../utils/validatePassword";
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
  const [passwordValidation, setPasswordValidation] = useState({});

  useEffect(() => {
    document.title = "PalPaw | Register";
  }, []);

  useEffect(() => {
    if (password.length > 0) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation({});
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !address || !email || !password || !confirmPassword)
      return setError("Please fill in all fields!");

    if (password !== confirmPassword)
      return setError("Passwords do not match!");

    const validation = validatePassword(password);
    if (!validation.isValid) {
      return setError(
        "Password is too weak. Please ensure it meets all strength requirements."
      );
    }

    try {
      const data = await register(fullName, address, email, password);
      if (!data.success) return setError(data.message);

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
      console.error("Registration failed:", error);
      setError("Registration failed due to a server or network error.");
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
              <InputForm
                placeholder="Password"
                Icon={Lock}
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length > 0 && (
                <div className="absolute top-3 -right-6">
                  {passwordValidation.isValid ? (
                    <CheckCircle className="w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 text-yellow-500" />
                  )}
                </div>
              )}
            </div>
            
            {password.length > 0 && (
              <div className=" text-xs text-gray-600 p-2 border rounded-md -mt-2">
                <p className="font-semibold mb-1">Password must contain:</p>
                <PasswordRequirement
                  met={passwordValidation.minLength}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={passwordValidation.uppercase}
                  text="At least one uppercase letter (A-Z)"
                />
                <PasswordRequirement
                  met={passwordValidation.lowercase}
                  text="At least one lowercase letter (a-z)"
                />
                <PasswordRequirement
                  met={passwordValidation.number}
                  text="At least one number (0-9)"
                />
                <PasswordRequirement
                  met={passwordValidation.specialChar}
                  text="At least one special character (!@#...)"
                />
              </div>
            )}

            <InputForm
              placeholder="Confirm password"
              Icon={Lock}
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <p className="text-sm text-red-600">{error}</p>

            <button type="submit" className="button-black p-3 rounded-lg">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PasswordRequirement = ({ met, text }) => {
  const IconComponent = met ? CheckCircle : X;
  const colorClass = met ? "text-green-500" : "text-gray-500";

  return (
    <p className={`flex items-center gap-1 ${colorClass}`}>
      <IconComponent className="w-3 h-3" />
      {text}
    </p>
  );
};
