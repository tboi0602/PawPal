import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          {/* Main 404 */}
          <div className="mb-12">
            <div className="relative mb-8">
              <h1 className="text-[8rem] md:text-[12rem] font-black  leading-none select-none">
                404
              </h1>
            </div>

            <div className="space-y-4 mb-12">
              <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4">
                Opps! Page not found
              </h2>
              <p className="text-xl text-slate-600 mb-2 leading-relaxed max-w-2xl mx-auto">
                It looks like you don't have access to this page or the page
                you're looking for no longer exists or has moved.
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate("/home")}
              className="group button-black font-semibold py-4 px-8 rounded-2xl flex items-center"
            >
              <Home className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Back Home
            </button>

            <button
              onClick={() => navigate(-1)}
              className="group button-black-outline flex justify-center items-center py-4 px-8 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 transition-all group-hover:-translate-x-1" />
              Back
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500">
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
      </div>
    </div>
  );
};
