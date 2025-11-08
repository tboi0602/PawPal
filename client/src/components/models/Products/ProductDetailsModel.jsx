import { useState, useEffect } from "react";
import {
  X,
  Tag,
  Package,
  DollarSign,
  List,
  Info,
  TicketPercent,
} from "lucide-react";
import { getProduct } from "../../../services/shopping/productAPI";
import { Loader2 } from "../Loaders/Loader2";

export const ProductDetailsModel = ({ productId, setOpenDetails }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parsedAttributes, setParsedAttributes] = useState({});

  useEffect(() => {
    async function loadProductData() {
      try {
        const dataRes = await getProduct(productId);
        if (dataRes.success) {
          const productData = dataRes.product;
          setProduct(productData);

          let attributesObj = {};
          try {
            if (typeof productData.attributes === "string") {
              attributesObj = JSON.parse(productData.attributes);
            } else if (
              typeof productData.attributes === "object" &&
              productData.attributes !== null
            ) {
              attributesObj = productData.attributes;
            }
          } catch (e) {
            console.error("Error parsing attributes:", e);
          }
          setParsedAttributes(attributesObj);
        }
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [productId]);

  const attributeEntries = Object.entries(parsedAttributes);

  const InfoRow = ({
    // eslint-disable-next-line no-unused-vars
    Icon,
    label,
    value,
    valueClass = "font-semibold text-gray-900",
  }) => (
    <div className="flex items-center text-sm py-3 border-b border-gray-200 last:border-b-0">
      <Icon size={16} className="text-gray-500 mr-3 shrink-0" />
      <span className="w-1/3 text-gray-600 font-normal">{label}:</span>
      <span className={`w-2/3 ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-white p-8 rounded-xl w-11/12 max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <p className="text-gray-500 font-bold">Product Details:</p>
            {product?.name}
          </h2>
          <X
            className="cursor-pointer text-gray-700 hover:text-red-600 transition"
            size={24}
            onClick={() => setOpenDetails(false)}
          />
        </div>

        {loading && (
          <div className="flex w-full items-center justify-center">
            <Loader2 />
          </div>
        )}

        {!loading && product && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Cột 1 & 2: Image Gallery */}
            <div className="lg:col-span-2 p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                <List size={20} className="text-orange-500" /> Image Gallery (
                {product.images?.length || 0})
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-4 max-h-[70vh] overflow-y-auto pr-2">
                {product.images?.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Image of ${product.name}`}
                    className="w-full sm:w-40 h-32 object-cover rounded-lg shadow-sm border border-gray-300 transition duration-200 hover:shadow-md"
                  />
                ))}
                {product.images?.length === 0 && (
                  <p className="text-sm text-gray-500 text-center w-full mt-4">
                    No images available for this product.
                  </p>
                )}
              </div>
            </div>

            {/* Cột 3, 4 & 5: Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Block 1: Basic Information and Pricing */}
              <div className="p-5 rounded-xl border border-gray-200 shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <Info className="text-blue-600" size={20} /> Product
                  Information
                </h3>

                <div className="divide-y divide-gray-100">
                  <InfoRow
                    Icon={Info}
                    label="Product ID"
                    value={
                      <span className="text-xs text-gray-600 break-all font-mono">
                        {product._id}
                      </span>
                    }
                    valueClass="font-normal"
                  />
                  <InfoRow
                    Icon={Tag}
                    label="Category"
                    value={product.category}
                  />

                  {/* Hiển thị Giá bán (Regular Price) */}
                  {product.discountPrice ? (
                    <InfoRow
                      Icon={DollarSign}
                      label="Regular Price"
                      value={`${product.price.toLocaleString("en-US")} VND`}
                      valueClass="font-medium text-base text-gray-500 line-through"
                    />
                  ) : (
                    <InfoRow
                      Icon={DollarSign}
                      label="Price"
                      value={`${product.price.toLocaleString("en-US")} VND`}
                      valueClass="font-extrabold text-lg text-green-700"
                    />
                  )}

                  {/* Hiển thị Giá khuyến mãi (Discount Price) */}
                  {product.discountPrice && (
                    <InfoRow
                      Icon={TicketPercent}
                      label="Discount Price"
                      value={`${product.discountPrice.toLocaleString(
                        "en-US"
                      )} VND`}
                      valueClass="font-extrabold text-lg text-red-600"
                    />
                  )}

                  <InfoRow
                    Icon={Package}
                    label="Stock"
                    value={product.stock}
                    valueClass={`font-extrabold text-base ${
                      product.stock === 0 ? "text-red-700" : "text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Block 2: Specifications (Attributes) */}
              <div className="p-5 rounded-xl border border-gray-200 shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <List size={20} className="text-purple-600" /> Specifications
                </h3>

                {attributeEntries.length > 0 ? (
                  <div className="border border-gray-200 rounded divide-y divide-gray-200">
                    {attributeEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex text-sm p-3 bg-white hover:bg-gray-50 transition duration-100"
                      >
                        {/* Cột Tên thuộc tính */}
                        <span className="w-1/3 text-gray-600 capitalize px-2 font-medium">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        {/* Cột Giá trị */}
                        <span className="w-2/3 font-semibold text-gray-900 px-2">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-2 border border-gray-100 rounded">
                    This product has no detailed specifications.
                  </p>
                )}
              </div>

              {/* Block 3: Product Description */}
            </div>
            <div className="col-span-5 p-5 rounded-xl border border-gray-200 shadow-sm bg-white">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <List size={20} className="text-indigo-500" /> Description
              </h3>
              <div
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            </div>
          </div>
        )}
        {!loading && !product && (
          <p className="text-red-700 text-center py-10">
            Product information not found.
          </p>
        )}
      </div>
    </div>
  );
};
