import { ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSolutions } from "../../services/solutions/solutionAPI";
import { getProducts } from "../../services/shopping/productAPI";
import { getPromotions } from "../../services/promotions/promotionAPI";
import { Loader } from "../../components/models/Loaders/Loader";

export const HomePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load services
        const servicesRes = await getSolutions();
        if (servicesRes.success) {
          setServices(servicesRes.solutions?.slice(0, 3) || []);
        }

        // Load products
        const productsRes = await getProducts();
        if (productsRes.success) {
          setProducts(productsRes.products?.slice(0, 3) || []);
        }

        // Load promotions
        const promotionsRes = await getPromotions();
        if (promotionsRes.success) {
          setPromotions(promotionsRes.promotions?.slice(0, 2) || []);
        }
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader />
      </div>
    );
  }

  // Format price
  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="py-20 px-4 md:px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 tracking-tight">
                Welcome to <span className="text-black">PawPal</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your trusted companion for premium pet care services, products,
                and professional grooming solutions.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/home/services")}
                  className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-200"
                >
                  Book Services
                </button>
                <button
                  onClick={() => navigate("/home/products")}
                  className="px-6 py-3 border-2 border-black text-black font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Shop Products
                </button>
              </div>
            </div>
            {/* Hero Image */}
            <div className="flex justify-center">
              <div className="text-7xl">🐾</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services */}
      {services.length > 0 && (
        <div className="py-16 px-4 md:px-6 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                  Featured Services
                </h2>
                <p className="text-gray-600">
                  Professional care for your beloved pets
                </p>
              </div>
              <button
                onClick={() => navigate("/home/services")}
                className="hidden md:flex text-black font-semibold items-center gap-2 hover:text-gray-700 transition"
              >
                View All <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service._id}
                  onClick={() => navigate("/home/services")}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition duration-200 cursor-pointer"
                >
                  <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {service.description?.replace(/<[^>]*>/g, "")}
                  </p>
                  <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-2xl font-bold text-black">
                        {formatPrice(service.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {service.duration} min
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded capitalize">
                      {service.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <div className="py-16 px-4 md:px-6 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                  Best Sellers
                </h2>
                <p className="text-gray-600">
                  Premium pet products for your furry friends
                </p>
              </div>
              <button
                onClick={() => navigate("/home/products")}
                className="hidden md:flex text-black font-semibold items-center gap-2 hover:text-gray-700 transition"
              >
                View All <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate("/home/products")}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition duration-200 cursor-pointer"
                >
                  <img
                    src={product.images}
                    alt={product.name}
                    className="w-full aspect-video object-cover bg-gray-100"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {product.description?.replace(/<[^>]*>/g, "")}
                    </p>
                    <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-2xl font-bold text-black">
                          {formatPrice(product.price)}
                        </p>
                        {product.discount > 0 && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatPrice(
                              (product.price * 100) / (100 - product.discount)
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} fill="black" stroke="black" />
                        <span className="text-sm font-semibold text-black">
                          5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Special Offers */}
      {promotions.length > 0 && (
        <div className="py-16 px-4 md:px-6 bg-gray-950 border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
              Special Offers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map((promo) => (
                <div
                  key={promo._id}
                  onClick={() => navigate("/home/promotions")}
                  className="bg-black rounded-xl p-8 text-white border border-gray-800 hover:shadow-lg transition duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Promo Code</p>
                      <h3 className="text-2xl font-bold text-white">
                        {promo.promotionCode}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
                      LIMITED
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    {promo.description?.replace(/<[^>]*>/g, "")}
                  </p>
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400 mb-1">Discount up to</p>
                    <p className="text-3xl font-bold text-white">
                      {promo.maxDiscountAmount.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Ready to Care for Your Pet?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Join thousands of happy pet owners who trust PawPal for their pet
            care needs.
          </p>
          <button
            onClick={() => navigate("/home/services")}
            className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-200"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};
