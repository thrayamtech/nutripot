import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaThLarge, FaTh, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import API from '../utils/api';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: false,
    fabric: false,
    status: false
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    fabric: '',
    inStock: false,
    featured: false,
    sale: false,
    search: ''
  });

  // Price range slider state
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid-4'); // grid-3, grid-4, grid-5
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Available fabric types
  const fabricTypes = [
    'Silk',
    'Cotton',
    'Georgette',
    'Chiffon',
    'Banarasi',
    'Kanjivaram Silk',
    'Net',
    'Mul Mul Cotton',
    'Tissue'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Parse URL params
    const params = new URLSearchParams(location.search);
    const newFilters = {
      category: params.get('category') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      fabric: params.get('fabric') || '',
      inStock: params.get('inStock') === 'true',
      featured: params.get('featured') === 'true',
      sale: params.get('sale') === 'true',
      search: params.get('search') || ''
    };
    setFilters(newFilters);
    setSortBy(params.get('sort') || 'default');
    setCurrentPage(parseInt(params.get('page')) || 1);

    // Update price range from URL
    if (params.get('minPrice') || params.get('maxPrice')) {
      setPriceRange([
        parseInt(params.get('minPrice')) || 0,
        parseInt(params.get('maxPrice')) || 50000
      ]);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      params.append('page', currentPage);
      params.append('limit', limit);

      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.fabric) params.append('fabric', filters.fabric);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.featured) params.append('featured', 'true');
      if (filters.search) params.append('search', filters.search);

      // Handle sorting
      if (sortBy === 'price-asc') params.append('sort', 'price');
      else if (sortBy === 'price-desc') params.append('sort', '-price');
      else if (sortBy === 'newest') params.append('sort', '-createdAt');
      else if (sortBy === 'name') params.append('sort', 'name');

      // Filter by sale (products with discountPrice)
      if (filters.sale) {
        const { data } = await API.get(`/products?${params.toString()}`);
        const saleProducts = data.products.filter(p => p.discountPrice);
        setProducts(saleProducts);
        setTotalProducts(saleProducts.length);
      } else {
        const { data } = await API.get(`/products?${params.toString()}`);
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateURLParams = (newFilters, newSort, newPage) => {
    const params = new URLSearchParams();

    if (newFilters.category) params.append('category', newFilters.category);
    if (newFilters.minPrice) params.append('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.append('maxPrice', newFilters.maxPrice);
    if (newFilters.fabric) params.append('fabric', newFilters.fabric);
    if (newFilters.inStock) params.append('inStock', 'true');
    if (newFilters.featured) params.append('featured', 'true');
    if (newFilters.sale) params.append('sale', 'true');
    if (newFilters.search) params.append('search', newFilters.search);
    if (newSort !== 'default') params.append('sort', newSort);
    if (newPage > 1) params.append('page', newPage);

    navigate(`/products?${params.toString()}`);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURLParams(newFilters, sortBy, 1);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange([min, max]);
    const newFilters = {
      ...filters,
      minPrice: min > 0 ? min.toString() : '',
      maxPrice: max < 50000 ? max.toString() : ''
    };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURLParams(newFilters, sortBy, 1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    updateURLParams(filters, value, currentPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams(filters, sortBy, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      fabric: '',
      inStock: false,
      featured: false,
      sale: false,
      search: ''
    };
    setFilters(clearedFilters);
    setPriceRange([0, 50000]);
    setSortBy('default');
    setCurrentPage(1);
    navigate('/products');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const totalPages = Math.ceil(totalProducts / limit);

  const gridClasses = {
    'grid-3': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
    'grid-4': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    'grid-5': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 px-2 transition-colors"
      >
        <span className="font-medium text-gray-700 text-sm">{title}</span>
        {expandedSections[section] ? (
          <FaChevronUp className="text-gray-400 text-xs" />
        ) : (
          <FaChevronDown className="text-gray-400 text-xs" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="pb-4 px-2">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Premium Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#5A0F1B] via-[#7A1525] to-[#5A0F1B] py-8 md:py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djEySDI0VjM0aDEyek0zNiAydjEySDI0VjJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="max-w-[1600px] mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-1 text-white">Shop All Sarees</h1>
          <p className="text-white/80 text-xs md:text-sm">Discover our exquisite collection</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop with Toggle */}
          <aside className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${showDesktopFilters ? 'w-72' : 'w-0 overflow-hidden'}`}>
            <div className="bg-white sticky top-24">
              <div className="flex items-center justify-between p-3 pb-2">
                <h2 className="text-xs font-semibold text-gray-700 uppercase">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-[#5A0F1B] font-medium flex items-center gap-1 transition-colors"
                >
                  <FaTimes className="text-xs" /> Clear
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Categories */}
                <FilterSection title="Categories" section="categories">
                  <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleFilterChange('category', filters.category === cat._id ? '' : cat._id)}
                        className={`w-full text-left px-2 py-1.5 text-sm transition-colors ${
                          filters.category === cat._id
                            ? 'text-[#5A0F1B] font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price" section="price">
                  <div className="space-y-4">
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(priceRange[0], parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5A0F1B]"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>₹0</span>
                        <span>₹50,000</span>
                      </div>
                    </div>
                    <div className="text-center text-sm font-medium text-gray-700 bg-gray-50 py-2 rounded">
                      ₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(parseInt(e.target.value) || 0, priceRange[1])}
                        placeholder="Min"
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#5A0F1B]"
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(priceRange[0], parseInt(e.target.value) || 50000)}
                        placeholder="Max"
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#5A0F1B]"
                      />
                    </div>
                  </div>
                </FilterSection>

                {/* Fabric Type */}
                <FilterSection title="Fabric" section="fabric">
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {fabricTypes.map((fabric) => (
                      <button
                        key={fabric}
                        onClick={() => handleFilterChange('fabric', filters.fabric === fabric ? '' : fabric)}
                        className={`w-full text-left px-2 py-1.5 text-sm transition-colors ${
                          filters.fabric === fabric
                            ? 'text-[#5A0F1B] font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {fabric}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Status Filters */}
                <FilterSection title="Status" section="status">
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="w-4 h-4 text-[#5A0F1B] border-gray-300 rounded focus:ring-[#5A0F1B]"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">In Stock</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                        className="w-4 h-4 text-[#5A0F1B] border-gray-300 rounded focus:ring-[#5A0F1B]"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">Featured</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.sale}
                        onChange={(e) => handleFilterChange('sale', e.target.checked)}
                        className="w-4 h-4 text-[#5A0F1B] border-gray-300 rounded focus:ring-[#5A0F1B]"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">On Sale</span>
                    </label>
                  </div>
                </FilterSection>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Bar - Sort & View Options */}
            <div className="bg-white p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Desktop Filter Toggle Button */}
                <button
                  onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 text-[#5A0F1B] hover:text-[#7A1525] transition-colors text-sm font-medium"
                  title={showDesktopFilters ? "Hide Filters" : "Show Filters"}
                >
                  <FaFilter className="text-xs" />
                  {showDesktopFilters ? 'Hide' : 'Show'} Filters
                </button>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 text-[#5A0F1B] hover:text-[#7A1525] transition-colors text-sm font-medium"
                >
                  <FaFilter className="text-xs" />
                  Filters
                </button>

                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

                <p className="text-sm text-gray-600">
                  <span className="font-bold text-[#5A0F1B]">{totalProducts}</span> <span className="hidden sm:inline">products found</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid-3')}
                    className={`p-2 transition-colors ${viewMode === 'grid-3' ? 'text-[#5A0F1B]' : 'text-gray-400 hover:text-gray-600'}`}
                    title="3 columns"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="6" height="6" rx="1"/>
                      <rect x="9" y="2" width="6" height="6" rx="1"/>
                      <rect x="16" y="2" width="6" height="6" rx="1"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid-4')}
                    className={`p-2 transition-colors ${viewMode === 'grid-4' ? 'text-[#5A0F1B]' : 'text-gray-400 hover:text-gray-600'}`}
                    title="4 columns"
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode('grid-5')}
                    className={`p-2 transition-colors ${viewMode === 'grid-5' ? 'text-[#5A0F1B]' : 'text-gray-400 hover:text-gray-600'}`}
                    title="5 columns"
                  >
                    <FaTh />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 text-gray-700 focus:outline-none text-sm bg-transparent cursor-pointer hover:text-[#5A0F1B] transition-colors"
                >
                  <option value="default">Default sorting</option>
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.category || filters.fabric || filters.minPrice || filters.maxPrice || filters.search) && (
              <div className="bg-white p-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Active Filters:</span>
                  {filters.search && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5A0F1B]/10 text-[#7A1525] rounded-full text-xs font-medium">
                      Search: {filters.search}
                      <button onClick={() => handleFilterChange('search', '')} className="hover:text-[#8A1F35]">
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5A0F1B]/10 text-[#7A1525] rounded-full text-xs font-medium">
                      {categories.find(c => c._id === filters.category)?.name}
                      <button onClick={() => handleFilterChange('category', '')} className="hover:text-[#8A1F35]">
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  )}
                  {filters.fabric && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5A0F1B]/10 text-[#7A1525] rounded-full text-xs font-medium">
                      {filters.fabric}
                      <button onClick={() => handleFilterChange('fabric', '')} className="hover:text-[#8A1F35]">
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5A0F1B]/10 text-[#7A1525] rounded-full text-xs font-medium">
                      ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '50,000'}
                      <button onClick={() => handlePriceRangeChange(0, 50000)} className="hover:text-[#8A1F35]">
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className={`grid ${gridClasses[viewMode]} gap-4`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-3"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid ${gridClasses[viewMode]} gap-4`}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-gray-600 hover:text-[#5A0F1B] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'text-[#5A0F1B]'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-gray-600 hover:text-[#5A0F1B] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-sm text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 text-[#5A0F1B] hover:text-[#7A1525] transition-colors font-medium underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sidebar */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 max-w-full bg-white shadow-2xl z-50 lg:hidden overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex items-center justify-between p-5">
                <h2 className="text-lg font-bold text-gray-800 uppercase">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-5">
              {/* Same filter sections as desktop */}
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase">Categories</h3>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleFilterChange('category', filters.category === cat._id ? '' : cat._id)}
                        className={`w-full text-left px-2 py-1.5 text-sm ${
                          filters.category === cat._id
                            ? 'text-[#5A0F1B] font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase">Price</h3>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(priceRange[0], parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5A0F1B]"
                  />
                  <div className="text-center text-sm font-medium text-gray-700 bg-gray-50 py-2 rounded mt-3">
                    ₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}
                  </div>
                </div>

                {/* Fabric */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase">Fabric</h3>
                  <div className="space-y-1">
                    {fabricTypes.map((fabric) => (
                      <button
                        key={fabric}
                        onClick={() => handleFilterChange('fabric', filters.fabric === fabric ? '' : fabric)}
                        className={`w-full text-left px-2 py-1.5 text-sm ${
                          filters.fabric === fabric
                            ? 'text-[#5A0F1B] font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {fabric}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4 sticky bottom-0 bg-white pt-4 border-t">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-3 text-[#5A0F1B] hover:text-[#7A1525] font-medium text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d97706;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b45309;
        }
      `}</style>
    </div>
  );
};

export default Products;
