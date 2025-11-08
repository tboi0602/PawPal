export const Footer = () => {
  return (
    <div className=" p-16">
      <div className=" grid grid-cols-4 justify-center items-center gap-8 ">
        <div className="flex flex-col gap-2 ">
          <img
            src="https://i.postimg.cc/ZR61vd48/Artboard-1.png"
            className="w-30"
          />
          <p className="text-black/70 ">
            Dedicated pet care with PawPal. Bringing the best services and
            products to your friend...
          </p>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold">Service</h1>
            <div className="">
              <p className="text-black/70">Training</p>
              <p className="text-black/70">Hygienic</p>
              <p className="text-black/70">Beauty</p>
              <p className="text-black/70">Home Care</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold">Product</h1>
            <div className="">
              <p className="text-black/70">Accessories</p>
              <p className="text-black/70">Food & Nutrition</p>
              <p className="text-black/70">Medication</p>
              <p className="text-black/70">Toys</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold">Support</h1>
            <div className=" flex flex-col">
              <a className="text-black/70" href="">
                FAQs
              </a>
              <a className="text-black/70" href="">
                Privacy Policy
              </a>
              <a className="text-black/70" href="">
                Terms of Service
              </a>
              <a className="text-black/70" href="">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t mt-8 pt-4 text-center text-black/70">
        © 2025 PalPaw. All rights reserved.
      </div>
    </div>
  );
};
