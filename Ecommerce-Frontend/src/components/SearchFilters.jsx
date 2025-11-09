import React, { useState, useEffect } from 'react';
import API from '../axios';

const SearchFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    available: null,
    ...initialFilters
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await API.get('/api/products/filters');
        setCategories(response.data.categories);
        setBrands(response.data.brands);
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      keyword: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      available: null
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (loading) {
    return <div className="animate-pulse">Loading filters...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Dropdown */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center space-x-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available === true}
                onChange={(e) => handleFilterChange('available', e.target.checked ? true : null)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <div
                key={key}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm"
              >
                <span>{`${key}: ${value}`}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            );
          })}
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={handleReset}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;