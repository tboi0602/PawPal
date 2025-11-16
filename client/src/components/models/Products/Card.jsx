export const Card = ({ product }) => {
  const origin = window.location.origin;

  const isOutOfStock = product?.stock === 0;

  const discountPercentage =
    product?.price && product?.discountPrice && product.price > 0
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100
        )
      : 0;

  return (
    <div className="max-w-xs rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100">
      <a
        className="relative aspect-square overflow-hidden block"
        href={`${origin}/home/products/product-details?id=${product._id}`}
      >
        <img
          src={product?.images?.[0]}
          alt={product?.name || "product photo"}
          className={`w-full h-full p-2 rounded-2xl object-cover transition-transform duration-300 hover:scale-105 cursor-pointer active:scale-100 
                      ${isOutOfStock ? " opacity-70" : ""}`}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 bg-opacity-40 text-white text-xl font-bold uppercase z-10">
            Out of Stock
          </div>
        )}

        {discountPercentage > 0 && (
          <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-20">
            -{discountPercentage}%
          </div>
        )}
      </a>

      <div className="p-4 flex flex-col gap-3">
        <h3
          className="text-xl font-semibold line-clamp-2"
          title={product?.name}
        >
          {product?.name}
        </h3>

        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold text-red-600">
            {product?.discountPrice
              ? product.discountPrice.toLocaleString("vi-VN") + "₫"
              : product.price
              ? product.price.toLocaleString("vi-VN") + "₫"
              : "Contact"}
          </div>

          {product?.discountPrice &&
            product?.discountPrice < product?.price && (
              <div className="text-sm text-gray-500 line-through">
                {product?.price.toLocaleString("vi-VN") + "₫"}
              </div>
            )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium flex gap-1">
            <p className="text-yellow-500 ">
              {product?.avgRating
                ? product?.avgRating + " ⭐"
                : "Not rated yet"}
            </p>
            |
            <p className="text-gray-500">
              {" "}
              {product?.reviewCount
                ? product?.reviewCount + " Reviews"
                : "Not Review"}
            </p>
          </span>
          <span className=" text-green-600">Stock: {product.stock}</span>
        </div>
      </div>
    </div>
  );
};
