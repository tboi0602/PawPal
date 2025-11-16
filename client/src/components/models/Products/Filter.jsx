import { useRef, useState } from "react";
import { Filter as FilterIcon, X } from "lucide-react";

export const Filter = ({ filterProduct }) => {
  const categories = [
    { id: "cat1", name: "accessory" },
    { id: "cat2", name: "food" },
    { id: "cat3", name: "nutrition" },
    { id: "cat4", name: "medication" },
    { id: "cat5", name: "toy" },
    { id: "cat6", name: "functional" },
  ];

  const [filters, setFilters] = useState({
    categories: "",
  });
  const minPriceRef = useRef(null);
  const maxPriceRef = useRef(null);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilters = () => {
    const minPriceValue = minPriceRef.current
      ? Number(minPriceRef.current.value) || 0
      : 0;
    const maxPriceValue = maxPriceRef.current
      ? Number(maxPriceRef.current.value) || 0
      : 0;

    filterProduct(filters.categories, minPriceValue, maxPriceValue);

    if (isMobileFilterOpen) {
      setIsMobileFilterOpen(false);
    }
  };

  const isCategoryChecked = (categoryName) => {
    return filters.categories.includes(categoryName);
  };

  const FilterContent = ({ onClose }) => (
    <>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-2 flex justify-between items-center">
        SEARCH FILTERS
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          CATEGORY
        </h3>
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center space-x-3 cursor-pointer group hover:bg-gray-50 p-1 rounded transition-colors"
            >
              <input
                type="checkbox"
                name="categories"
                value={category.name}
                checked={isCategoryChecked(category.name)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                onChange={handleChange}
              />
              <span className="text-gray-600 transition-colors group-hover:text-black">
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          PRICE RANGE
        </h3>
        <div className="flex items-center gap-3 w-full">
          <input
            type="number"
            name="minPrice"
            ref={minPriceRef}
            placeholder="₫ Min"
            min={0}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm outline-none"
            defaultValue={0}
          />
          <span className="text-gray-500 font-bold">-</span>
          <input
            type="number"
            name="maxPrice"
            ref={maxPriceRef}
            placeholder="₫ Max"
            min={0}
            className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm outline-none"
            defaultValue={0}
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          className="w-full py-2 button-black rounded-lg transition-colors"
          onClick={handleFilters}
        >
          APPLY FILTERS
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed z-50 top-18 bottom-0 left-0 w-64 bg-white p-5 shadow-lg overflow-y-auto hidden md:block">
        <FilterContent />
      </div>
      <div className="md:hidden fixed top-20 left-4 z-60">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className=" p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Mở bộ lọc"
        >
          <FilterIcon className="w-6 h-6" />
        </button>
      </div>

      {isMobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-90 md:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed top-0 bottom-0 left-0 w-full xs:w-64 bg-white p-5 shadow-2xl overflow-y-auto z-100 transition-transform duration-300 md:hidden">
            <FilterContent onClose={() => setIsMobileFilterOpen(false)} />
          </div>
        </>
      )}
    </>
  );
};
