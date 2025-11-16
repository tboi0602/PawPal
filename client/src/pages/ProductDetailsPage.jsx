import { useCallback, useEffect, useRef, useState } from "react";
import { getProduct } from "../services/shopping/productAPI";
import ImageGallery from "../components/models/Precentations/ImageGallery";
import { Minus, Plus } from "lucide-react";
import { setItem, getItem } from "../utils/operations";
import Swal from "sweetalert2";
import { addToCart, getCart } from "../services/shopping/cartAPI";
import { useNavigate } from "react-router-dom";
import { Review } from "../components/models/Products/Review";
import { getReviews } from "../services/shopping/reviewAPI";

export const ProductDetailsPage = () => {
  const navigate = useNavigate();
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const productId = params.get("id");

  const [message, setMessage] = useState("");
  const [attributes, setAttributes] = useState({});

  const [product, setProducts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [quaty, setQuaty] = useState(1);

  const availableStock = product.stock || 0;
  const isProductInStock = availableStock > 0;

  const loadMoreReview = useCallback(async (productId, page, limit) => {
    const dataReview = await getReviews(productId, page, limit);
    if (dataReview.reviews) {
      setReviews((prevReviews) => [...prevReviews, ...dataReview.reviews]);
    }
  }, []);
  const reloadReview = useCallback(async (productId, page, limit) => {
    const dataReview = await getReviews(productId, page, limit);
    setReviews(dataReview.reviews);
  }, []);

  const block = useRef(false);
  useEffect(() => {
    const loadData = async (productId) => {
      if (!productId) return setMessage(`Product not found`);
      const dataProduct = await getProduct(productId);
      reloadReview(productId, currentPage, 10);
      try {
        if (!dataProduct.success) {
          setMessage(`Product with Id: ${productId} not found`);
          return;
        }
        const rawAttributes = dataProduct.product.attributes || {};
        const entries = Object.entries(rawAttributes);
        const modifiedEntries = entries.map(([key, value]) => [
          key,
          value.split(",").map((item) => item.trim()),
        ]);
        const newAttributes = Object.fromEntries(modifiedEntries);

        setAttributes(newAttributes);
        setProducts(dataProduct.product);

        const defaultOptions = Object.fromEntries(
          Object.entries(newAttributes).map(([key, values]) => [key, values[0]])
        );
        setSelectedOptions(defaultOptions);

        setQuaty(1);
      } catch (error) {
        setMessage(error.message);
      }
    };
    if (!block.current) loadData(productId);
    block.current = true;
  }, [productId, reloadReview, currentPage]);

  const handleOptionSelect = (key, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      if (quaty < availableStock) {
        setQuaty((prev) => prev + 1);
      }
    } else if (type === "decrement") {
      setQuaty((prev) => (prev < 2 ? 1 : prev - 1));
    }
  };

  const handleChangePage = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      loadMoreReview(productId, nextPage, 10);
      return nextPage;
    });
  };

  const handleAddToCart = async () => {
    if (!isProductInStock) {
      return Swal.fire({ icon: "warning", title: "Out of stock" });
    }

    const payload = {
      productId: product._id,
      quantity: quaty,
      attribute: selectedOptions,
    };
    try {
      const res = await addToCart(payload);
      if (res && res.success) {
        try {
          const cartData = await getCart();
          if (cartData && cartData.success && Array.isArray(cartData.items)) {
            const mapped = cartData.items.map((ci) => ({
              productId: ci.productId?._id || ci.productId,
              image: ci.productId?.images?.[0] || ci.image,
              name: ci.productId?.name || ci.name,
              price: ci.productId?.discountPrice || ci.price || 0,
              selectedOptions: ci.selectedOptions || ci.attribute || {},
              quantity: ci.quantity || 1,
            }));
            setItem("temp_order", mapped);
          }
        } catch (syncErr) {
          console.warn("Failed to sync cart from server:", syncErr?.message);
        }

        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "success",
          title: `Added ${product.name} To cart`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      // If server returned failure, show message
      Swal.fire({
        icon: "error",
        title: res?.message || "Failed to add to cart",
      });
    } catch (err) {
      // API call failed - fallback to localStorage
      console.warn("addToCart API failed, using local fallback", err?.message);
      try {
        const raw = getItem("temp_order") || [];
        // merge: if same productId + same selectedOptions => increase quantity
        const keyMatch = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        const idx = raw.findIndex(
          (it) =>
            it.productId === product._id &&
            keyMatch(it.selectedOptions, selectedOptions)
        );
        if (idx > -1) {
          raw[idx].quantity = (raw[idx].quantity || 0) + quaty;
        } else {
          raw.push({
            productId: product._id,
            image: product.images?.[0],
            name: product.name,
            price: product.discountPrice,
            selectedOptions,
            quantity: quaty,
          });
        }
        setItem("temp_order", raw);
        Swal.fire({ icon: "success", title: "Added to cart (offline)" });
      } catch (localErr) {
        console.error("Local fallback failed:", localErr);
        Swal.fire({ icon: "error", title: "Could not add to cart" });
      }
    }
  };

  const handleBuy = () => {
    if (!isProductInStock) {
      return alert("Cannot buy now: Product is out of stock.");
    }
    const temp_order = [
      {
        productId: product._id,
        image: product.images[0],
        name: product.name,
        price: product.discountPrice,
        selectedOptions,
        quantity: quaty,
      },
    ];
    setItem("temp_order", temp_order);
    navigate("/home/payment");
  };
  const avgStar = (
    reviews?.reduce((sum, review) => sum + review.rate, 0) / reviews?.length
  ).toFixed(1);
  return (
    <div className="p-8 md:px-32 md:py-16 lg:px-64 lg:py-32 min-h-screen w-full flex flex-col gap-10">
      {message ? (
        <p className="text-red-600 text-lg text-center">{message}</p>
      ) : (
        <>
          {/* IMAGES - DETAILS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 rounded-lg shadow-lg p-4 gap-10 bg-white">
            <div>
              <ImageGallery images={product?.images} name={product?.name} />
            </div>

            <div className="space-y-8">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {/* Ratings & Reviews */}
              <div className="text-lg text-gray-500">
                <span className="font-semibold text-yellow-500 mr-2">
                  {avgStar > 0 ? avgStar : "Not rated"} ⭐
                </span>
                |{" "}
                <span>
                  {reviews?.length > 0 ? reviews?.length + " " : "No "}review
                </span>
                <span className="text-lg ml-10 font-bold uppercase">
                  Category: {product.category}
                </span>
              </div>

              {/* Price & Stock */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-100 p-4 rounded-lg">
                <div className="flex gap-3 items-baseline">
                  <div className="text-3xl font-extrabold text-red-600">
                    {product.discountPrice?.toLocaleString("en-US") + "₫" ||
                      "Contact"}
                  </div>
                  {product.price > product.discountPrice && (
                    <div className="text-xl text-gray-500 line-through">
                      {product.price?.toLocaleString("en-US") + "₫"}
                    </div>
                  )}
                </div>

                <div
                  className={`flex gap-2 items-center font-bold ${
                    isProductInStock ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <h1>Stock:</h1>
                  <div>
                    {isProductInStock ? availableStock : "Out of stock"}
                  </div>
                </div>
              </div>

              {/* ATTRIBUTE SELECTION  */}
              {Object.entries(attributes).map(([key, values]) => (
                <div key={key} className=" pt-4">
                  <h3 className="text-lg font-semibold capitalize mb-3">
                    Select {key.replace(/([A-Z])/g, " $1").trim()}:
                    <span className="font-normal text-gray-600 ml-2">
                      {selectedOptions[key]}
                    </span>
                  </h3>

                  <div className="flex gap-2 flex-wrap">
                    {values.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleOptionSelect(key, value)}
                        className={`px-4 py-2 text-sm rounded-md border transition-all duration-200 min-w-[70px] cursor-pointer
                                                    ${
                                                      selectedOptions[key] ===
                                                      value
                                                        ? "bg-black text-white border-black shadow-md"
                                                        : "bg-white text-gray-800 border-gray-400 hover:border-black"
                                                    }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/*  QUANTITY CONTROL*/}
              <div className="flex items-center gap-6">
                <h1 className="text-lg font-semibold capitalize">Quantity: </h1>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quaty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4" />
                  </button>
                  <span className="select-none font-bold w-10 text-center text-lg">
                    {quaty}
                  </span>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={quaty >= availableStock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4" />
                  </button>
                </div>
                {quaty >= availableStock && isProductInStock && (
                  <span className="text-sm text-red-500">
                    Max stock reached.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  className={`w-full py-3 text-lg font-bold rounded-lg transition-colors border-2 cursor-pointer ${
                    isProductInStock
                      ? "border-black text-black hover:bg-gray-100"
                      : "border-gray-300 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleAddToCart}
                  disabled={!isProductInStock}
                >
                  ADD TO CART
                </button>
                <button
                  className={`w-full py-3 text-lg font-bold rounded-lg transition-colors cursor-pointer ${
                    isProductInStock
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={handleBuy}
                  disabled={!isProductInStock}
                >
                  BUY NOW
                </button>
              </div>
            </div>
          </div>
          {/* PRODUCT DESCRIPTION */}
          <div className="col-span-2 flex flex-col gap-4 p-4 shadow-lg border border-gray-200 rounded-lg bg-white">
            <h1 className="text-2xl font-bold">PRODUCT DESCRIPTION</h1>
            <div
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
              className="prose max-w-none"
            ></div>
          </div>
          {/* REVIEW */}
          <div>
            <Review
              reviews={reviews}
              setReviews={setReviews}
              productId={productId}
              reloadReview={reloadReview}
              handleChangePage={handleChangePage}
            />
          </div>
        </>
      )}
    </div>
  );
};
