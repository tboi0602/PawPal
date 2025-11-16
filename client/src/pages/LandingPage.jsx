import { Footer } from "../components/layouts/customer/landingpage/Footer";
import { Header } from "../components/layouts/customer/landingpage/Header";
import { Contact } from "../components/pages/landing/Contact";
import { Hero } from "../components/pages/landing/Hero";
import { Product } from "../components/pages/landing/Product";
import { Service } from "../components/pages/landing/Service";

export const LandingPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Service />
      <Product />
      <Contact />
      <div className="flex flex-col justify-center items-center p-8 md:p-32 bg-black/10 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Sign up for PawPal notifications
          </h1>
          <p className="text-base sm:text-xl">
            Get exclusive deals, the latest pet news and service updates
            straight to your inbox!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 w-full max-w-lg">
          <input
            type="email"
            placeholder="Enter your email"
            className="border p-3 rounded-lg w-full sm:w-2/3 outline-none hover:bg-white focus:bg-white"
          />
          <button className="button-black p-3 text-lg sm:text-xl rounded-lg w-full sm:w-1/3">
            Sign up
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};
