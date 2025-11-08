export const Cart = ({ title, conten, image }) => {
  return (
    <div className="relative h-96 rounded-xl shadow-md border-2  border-white cursor-pointer hover:scale-105 duration-150">
      <img src={image} className="absolute object-cover h-full w-full rounded-xl" />
      <div className="absolute w-full h-28 bg-linear-to-t from-black/70  bottom-0 rounded-b-xl  "></div>
      <div className="absolute bottom-4 left-4 right-4 ">
        <h1 className="text-white text-xl font-medium">{title}</h1>
        <h1 className="text-white/80 ">{conten}</h1>
      </div>
    </div>
  );
};