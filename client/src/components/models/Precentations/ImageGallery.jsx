import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ images, name }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-96 w-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="space-y-4">
      {/* --- Main Image Display --- */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-gray-100">
        <img
          src={images[currentImageIndex]}
          alt={`${name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-contain transition-opacity duration-300"
        />

        {/* Navigation Buttons (Optional: use only if more than one image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* --- Thumbnail Gallery --- */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto p-1">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-all duration-200 border-2 
                ${
                  index === currentImageIndex
                    ? "border-indigo-600 shadow-md"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
