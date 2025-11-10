import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav aria-label="Page navigation" className="flex justify-center mt-8">
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            currentPage === 0
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
          }`}
        >
          Previous
        </button>

        {/* First Page + Ellipsis */}
        {startPage > 1 && (
          <>
            <button 
              onClick={() => onPageChange(0)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum - 1)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentPage === pageNum - 1
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Last Page + Ellipsis */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            currentPage === totalPages - 1
              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
              : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
          }`}
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

