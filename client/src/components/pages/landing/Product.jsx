import { ArrowRight } from "lucide-react";
import { Cart } from "./Cart";
import { imgProducts } from "../../../assets/images";

export const Product = () => {
  return (
    <div
      id="product"
      className="flex flex-col justify-center items-center px-32 py-16 border-t"
    >
      <div className="flex flex-col  text-center gap-2">
        <h1 className="text-7xl font-bold ">Our Product Lines</h1>
        <p className="text-2xl text-black/70">
          Discover carefully selected, high-quality products to meet all your
          pet's needs.
        </p>
      </div>
      <div className="pt-8 grid grid-cols-4 w-full gap-8">
        <Cart
          image={imgProducts["Accessories"]}
          title={"Accessories"}
          conten={
            "Fully prepared leash, smart bowl and soft nest, ensuring a comfortable and safe life for your baby."
          }
        />
        <Cart
          image={imgProducts["Food"]}
          title={"Food & Nutrition"}
          conten={
            "Providing premium seeds, pate and nutritional supplements, the foundation for a healthy, active and long-lived pet."
          }
        />
        <Cart
          image={imgProducts["Medication"]}
          title={"Medication"}
          conten={
            "Anti-flea, deworming solutions and functional foods support and maintain overall health."
          }
        />
        <Cart
          image={imgProducts["Toys"]}
          title={"Toys"}
          conten={
            "Durable chew toys and smart interactive toys, help pets reduce stress and enhance bonding with their owners."
          }
        />
      </div>
      <a
        href="/home/products"
        className="group button-black p-2 px-4 rounded-lg text-xl mt-8 flex gap-1 justify-center items-center "
      >
        <h1 className="text-3xl">Buy now</h1>
        <span className="group-hover:translate-x-1 duration-150">
          <ArrowRight className="w-6" />
        </span>
      </a>
    </div>
  );
};
