// components/Pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  totalItems, 
  totalPages, 
  currentPage, 
  onPageChange, 
  itemsPerPage, 
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const displayedStart = Math.min(startIndex + 1, totalItems);
  const displayedEnd = Math.min(endIndex, totalItems);

  // Hide if no items
  if (totalItems === 0) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pagesToShow = getPageNumbers();

  const buttonClass = (isActive) =>
    `min-w-[32px] px-3 py-1 rounded-md transition duration-150 text-sm font-medium cursor-pointer ${
      isActive
        ? "bg-gray-800 text-white"
        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
    }`;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border-t border-gray-100 rounded-b-xl">
      <div className="mb-4 md:mb-0 text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-gray-800">{displayedStart}</span> to{" "}
        <span className="font-semibold text-gray-800">{displayedEnd}</span> of{" "}
        <span className="font-semibold text-gray-800">{totalItems}</span>{" "}
        results
      </div>

      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${buttonClass(
              false
            )} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            <ChevronLeft size={16} />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </button>

          <div className="flex space-x-2 overflow-x-auto">
            {" "}
            {pagesToShow.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={buttonClass(page === currentPage)}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${buttonClass(
              false
            )} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
