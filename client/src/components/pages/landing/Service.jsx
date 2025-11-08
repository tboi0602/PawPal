import { Cart } from "./Cart";
import { ArrowRight } from "lucide-react";
import { imgServices } from "../../../assets/images";

export const Service = () => {
  return (
    <div
      id="service"
      className="flex flex-col justify-center items-center px-32 py-16"
    >
      <div className="flex flex-col text-center gap-2">
        <h1 className="text-7xl font-bold  ">
          Our pet care services
        </h1>
        <p className="text-2xl  text-black/70">
          PawPal offers a wide range of professional services <br /> Ensuring
          style and fun for your pet.
        </p>
      </div>
      <div className="pt-8 grid grid-cols-4 w-full gap-8">
        <Cart
          image={imgServices["Training"]}
          title={"Training"}
          conten={"Basic and advanced training courses for pets."}
        />
        <Cart
          image={imgServices["Hygienic"]}
          title={"Hygienic"}
          conten={
            "Professional grooming services such as shaving, ear cleaning, etc."
          }
        />
        <Cart
          image={imgServices["Beauty"]}
          title={"Beauty"}
          conten={
            "Professional grooming services to keep your pet looking beautiful and radiant"
          }
        />
        <Cart
          image={imgServices["Home-Care"]}
          title={"Home Care"}
          conten={
            "Providing professional and dedicated support right in the comfort of our home"
          }
        />
      </div>
      <a href="/home/products" className="group button-black p-2 px-4 rounded-lg text-xl mt-8 flex gap-1 justify-center items-center ">
        <h1 className="text-3xl">Booking now</h1>
        <span className="group-hover:translate-x-1 duration-150">
          <ArrowRight className="w-6" />
        </span>
      </a>
    </div>
  );
};
