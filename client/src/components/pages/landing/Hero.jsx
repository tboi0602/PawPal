export const Hero = () => {
  return (
    <div>
      <div id="hero" className="relative flex  ">
        <img
          className="w-full h-screen object-cover"
          src="https://i.postimg.cc/SR1v3N0s/Artboard-1-4x.png"
        />
        <div className="absolute bg-white/20 w-full h-screen flex flex-col gap-4  items-center justify-center text-center">
          <h1 className="text-7xl font-bold">Dedicated pet care with</h1>
          <img
            src="https://i.postimg.cc/ZR61vd48/Artboard-1.png"
            className="w-50"
          />
          <p className="text-2xl ">
            Providing the best service and products for your four-legged friend.{" "}
            <br /> Discover special offers now
          </p>
          <div className="flex gap-8 text-xl font-bold">
            <a href="/home/services" className="button-black-outline text-4xl p-4 rounded-xl">
              Booking now
            </a>
            <a href="/home/products" className="button-black text-4xl p-4 rounded-xl">
              Buy now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
