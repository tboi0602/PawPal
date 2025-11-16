import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="relative z-10 grow flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg md:max-w-4xl text-center">
          <div className="mb-10 sm:mb-12">
            <div className="relative mb-6 sm:mb-8">
              <h1 className="text-[6rem] sm:text-[8rem] md:text-[12rem] font-black leading-none select-none text-gray-700 opacity-70">
                404
              </h1>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-800 mb-2">
                Opps! Page not found
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
                It looks like you don't have access to this page or the page
                you're looking for no longer exists or has moved.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center items-center mb-12 sm:mb-16">
            {/* Nút Back Home */}
            <button
              onClick={() => navigate("/home")}
              className="group button-black font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl flex items-center text-sm sm:text-base"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Back Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="group button-black-outline flex justify-center items-center py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-all group-hover:-translate-x-1" />
              Back
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 text-center w-full">
        <p className="text-xs sm:text-sm text-slate-500">
          Error Code: 404 • Lost but not forgotten •
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Contact our pet experts
          </a>
        </p>
      </div>
    </div>
  );
};
