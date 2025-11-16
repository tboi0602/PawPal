import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, LockOpen } from "lucide-react";
import InputForm from "../components/inputs/InputForm";
import { logo } from "../assets/images";
import { imgServices } from "../assets/images";
import googleLogo from "../assets/svg/googleLogo.svg";
import ForgotPasswordModel from "../components/models/ForgotPasswordModel";
import Swal from "sweetalert2";
import { Loader2 } from "../components/models/Loaders/Loader2.jsx";
//untils
import { setItem } from "../utils/operations.js";
//API
import { login } from "../services/auth/indentityAPI";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isClick, setIsClick] = useState(false);
  let domain = "";
  useEffect(() => {
    document.title = "PalPaw | Login";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields!");
    setIsLoading(true);
    try {
      const data = await login(email, password);
      if (!data.success) {
        setIsLoading(false);
        setError(data.message);
        return;
      }

      setItem("user-data", data.user);
      localStorage.setItem("token", data.token);
      if (data.user.role == "ADMIN") domain = "/admin/dashboard";
      else domain = "/home";
      navigate(domain);
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isClick && (
        <>
          <div className="flex flex-col justify-start items-center min-h-screen w-full p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50">
            <div className="flex items-center justify-between gap-2 mb-8 w-full max-w-5xl">
              <div className="cursor-pointer" onClick={() => navigate("/")}>
                <img
                  src={logo}
                  alt="logo"
                  className="w-24 sm:w-32 lg:w-36 grayscale"
                />
              </div>
              <div className="hidden md:flex items-center gap-2 text-md border-2 border-gray-400 rounded-md px-2 py-1">
                <h1>Don’t have an account?</h1>
                <div className="border border-r h-6 sm:h-8 md:h-10"></div>
                <div
                  className="button-black p-2 rounded-lg"
                  onClick={() => navigate("/register")}
                >
                  Register
                </div>
              </div>
            </div>
            <div className="md:hidden flex justify-center w-full mb-8">
              <p className="text-sm mr-2">Don’t have an account?</p>
              <div
                className="button-black px-3 py-1 text-sm rounded-lg"
                onClick={() => navigate("/register")}
              >
                Register Now
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl flex flex-col lg:flex-row overflow-hidden border border-gray-200">
              <div className="hidden lg:block lg:w-1/2 z-10 h-96 md:h-[550px]">
                <img
                  src={imgServices["Beauty"]}
                  alt="login_illustration"
                  className="p-2 rounded-2xl w-full h-full object-cover object-center "
                />
              </div>
              {/* Right form */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 bg-white bg-opacity-95 backdrop-blur-sm">
                <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">
                  Login
                </h1>
                {/* Social login */}
                <div className="flex flex-col gap-3">
                  <a href="">
                    <button className="flex items-center justify-center font-medium gap-2 border border-gray-300 w-full py-2 sm:py-3 rounded-xl bg-white hover:bg-gray-100 transition-all cursor-pointer text-sm sm:text-base">
                      <img
                        src={googleLogo}
                        alt="Google"
                        className="w-5 sm:w-6"
                      />
                      Login with Google
                    </button>
                  </a>
                </div>
                <div className="flex items-center my-3 sm:my-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="mx-3 text-xs sm:text-sm text-gray-500">
                    or
                  </span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 sm:gap-4 mt-4"
                >
                  <InputForm
                    placeholder="Email"
                    Icon={Mail}
                    type="text"
                    name="userName"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputForm
                    placeholder="Password"
                    Icon={LockOpen}
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    type="submit"
                    className="button-black p-2 sm:p-3 rounded-lg flex items-center justify-center text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 /> : "Login"}
                  </button>
                  <p
                    className="text-xs sm:text-sm text-left text-gray-700 underline hover:text-black cursor-pointer"
                    onClick={() => setIsClick(true)}
                  >
                    Forgot password?
                  </p>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Forgot Password Modal */}
      {isClick && <ForgotPasswordModel setIsClick={setIsClick} />}
    </>
  );
};
