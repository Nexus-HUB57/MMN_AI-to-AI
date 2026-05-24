import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { MarketplaceProductCard } from './MarketplaceProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  thumbnailUrl?: string;
  images?: string[];
  shortDescription?: string;
  stockQuantity: number;
  status: 'draft' | 'active' | 'paused' | 'archived' | 'out_of_stock';
  productType: 'digital' | 'physical' | 'service' | 'subscription';
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  isFeatured?: boolean;
  tags?: string[];
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

interface Filters {
  search: string;
  category: string;
  productType: string;
  priceRange: [number, number];
  rating: number;
  status: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
}

interface MarketplaceCatalogProps {
  products: Product[];
  categories: Category[];
  isLoading?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showFilters?: boolean;
}

const ITEMS_PER_PAGE = 12;

export const MarketplaceCatalog: React.FC<MarketplaceCatalogProps> = ({
  products,
  categories,
  isLoading = false,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  viewMode: initialViewMode = 'grid',
  onViewModeChange,
  showFilters = true
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    productType: '',
    priceRange: [0, 100000],
    rating: 0,
    status: 'active',
    sortBy: 'newest'
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    type: false,
    rating: false
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search filter
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filters.category && p.categoryId !== filters.category) {
        return false;
      }
      // Product type filter
      if (filters.productType && p.productType !== filters.productType) {
        return false;
      }
      // Price range filter
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) {
        return false;
      }
      // Rating filter
      if (filters.rating > 0 && (p.rating === undefined || p.rating < filters.rating)) {
        return false;
      }
      // Status filter
      if (filters.status && p.status !== filters.status) {
        return false;
      }
      return true;
    });

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      productType: '',
      priceRange: [0, 100000],
      rating: 0,
      status: 'active',
      sortBy: 'newest'
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.search || filters.category || filters.productType ||
    filters.rating > 0 || filters.status !== 'active';

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="marketplace-catalog">
      {/* Header */}
      <div className="catalog-header">
        <div className="catalog-title-section">
          <h2 className="catalog-title">Catálogo de Produtos</h2>
          <span className="catalog-count">{filteredProducts.length} produtos</span>
        </div>

        {/* Search Bar */}
        <div className="catalog-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          {filters.search && (
            <button
              className="search-clear"
              onClick={() => handleFilterChange('search', '')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="catalog-controls">
          {/* Filter Toggle */}
          {showFilters && (
            <button
              className={`filter-toggle-btn ${showFilterPanel ? 'active' : ''}`}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filtros</span>
              {hasActiveFilters && <span className="filter-badge">•</span>}
            </button>
          )}

          {/* Sort Select */}
          <div className="sort-container">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select"
            >
              <option value="newest">Mais Recentes</option>
              <option value="popular">Mais Vendidos</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
            <ChevronDown className="sort-icon" />
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              title="Visualização em Grade"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              title="Visualização em Lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="catalog-body">
        {/* Filter Sidebar */}
        {showFilters && showFilterPanel && (
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Filtros</h3>
              {hasActiveFilters && (
                <button className="reset-btn" onClick={resetFilters}>
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('category')}
              >
                <span>Categorias</span>
                <ChevronDown className={`w-4 h-4 ${expandedSections.category ? 'rotate' : ''}`} />
              </button>
              {expandedSections.category && (
                <div className="filter-section-content">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.category}
                      onChange={() => handleFilterChange('category', '')}
                    />
                    <span>Todas as categorias</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat.id}
                        onChange={() => handleFilterChange('category', cat.id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('price')}
              >
                <span>Faixa de Preço</span>
                <ChevronDown className={`w-4 h-4 ${expandedSections.price ? 'rotate' : ''}`} />
              </button>
              {expandedSections.price && (
                <div className="filter-section-content">
                  <div className="price-range-display">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>-</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                    className="price-range-slider"
                  />
                </div>
              )}
            </div>

            {/* Product Type */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('type')}
              >
                <span>Tipo de Produto</span>
                <ChevronDown className={`w-4 h-4 ${expandedSections.type ? 'rotate' : ''}`} />
              </button>
              {expandedSections.type && (
                <div className="filter-section-content">
                  {[
                    { value: '', label: 'Todos' },
                    { value: 'digital', label: 'Digitais' },
                    { value: 'physical', label: 'Físicos' },
                    { value: 'service', label: 'Serviços' },
                    { value: 'subscription', label: 'Assinaturas' }
                  ].map(type => (
                    <label key={type.value} className="filter-option">
                      <input
                        type="radio"
                        name="productType"
                        checked={filters.productType === type.value}
                        onChange={() => handleFilterChange('productType', type.value)}
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('rating')}
              >
                <span>Avaliação Mínima</span>
                <ChevronDown className={`w-4 h-4 ${expandedSections.rating ? 'rotate' : ''}`} />
              </button>
              {expandedSections.rating && (
                <div className="filter-section-content">
                  {[0, 1, 2, 3, 4, 5].map(rating => (
                    <label key={rating} className="filter-option">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                      />
                      <span>
                        {rating === 0 ? 'Todas' : `${'★'.repeat(rating)}${'☆'.repeat(5-rating)}`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className={`catalog-products ${viewMode === 'list' ? 'list-mode' : ''}`}>
          {isLoading ? (
            <div className="catalog-loading">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text short" />
                </div>
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map(product => (
              <MarketplaceProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
              />
            ))
          ) : (
            <div className="catalog-empty">
              <Filter className="empty-icon" />
              <h3>Nenhum produto encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outros termos.</p>
              <button onClick={resetFilters} className="reset-all-btn">
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="catalog-pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Anterior
          </button>
          <div className="pagination-pages">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`pagination-page ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Próxima
          </button>
        </div>
      )}

      <style>{`
        .marketplace-catalog {
          padding: 24px;
        }

        .catalog-header {
          margin-bottom: 24px;
        }

        .catalog-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .catalog-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }

        .catalog-count {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
        }

        .catalog-search {
          position: relative;
          margin-bottom: 16px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          w: 20px;
          h: 20px;
          color: var(--text-secondary, #94a3b8);
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 44px;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-cyan, #06b6d4);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          padding: 4px;
        }

        .catalog-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-toggle-btn:hover, .filter-toggle-btn.active {
          border-color: var(--accent-cyan, #06b6d4);
        }

        .filter-badge {
          color: var(--accent-cyan, #06b6d4);
          font-size: 18px;
        }

        .sort-container {
          position: relative;
          margin-left: auto;
        }

        .sort-select {
          appearance: none;
          padding: 8px 32px 8px 12px;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
          cursor: pointer;
        }

        .sort-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          w: 16px;
          h: 16px;
          color: var(--text-secondary, #94a3b8);
          pointer-events: none;
        }

        .view-toggle {
          display: flex;
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          overflow: hidden;
        }

        .view-btn {
          padding: 8px 12px;
          background: var(--surface-secondary, #1e293b);
          border: none;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn:hover {
          color: var(--text-primary, #f8fafc);
        }

        .view-btn.active {
          background: var(--accent-cyan, #06b6d4);
          color: white;
        }

        .catalog-body {
          display: flex;
          gap: 24px;
        }

        .filter-panel {
          width: 260px;
          flex-shrink: 0;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 12px;
          padding: 16px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .filter-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .reset-btn {
          background: none;
          border: none;
          color: var(--accent-cyan, #06b6d4);
          font-size: 12px;
          cursor: pointer;
        }

        .filter-section {
          margin-bottom: 8px;
        }

        .filter-section-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          background: none;
          border: none;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .filter-section-header svg {
          transition: transform 0.2s ease;
        }

        .filter-section-header svg.rotate {
          transform: rotate(180deg);
        }

        .filter-section-content {
          padding: 8px 0;
        }

        .filter-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
        }

        .filter-option:hover {
          color: var(--text-primary, #f8fafc);
        }

        .filter-option input {
          accent-color: var(--accent-cyan, #06b6d4);
        }

        .price-range-display {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 8px;
        }

        .price-range-slider {
          width: 100%;
          accent-color: var(--accent-cyan, #06b6d4);
        }

        .catalog-products {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .catalog-products.list-mode {
          grid-template-columns: 1fr;
        }

        .catalog-loading {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .product-skeleton {
          background: var(--surface-secondary, #1e293b);
          border-radius: 12px;
          overflow: hidden;
        }

        .skeleton-image {
          aspect-ratio: 4/3;
          background: var(--surface-tertiary, #0f172a);
          animation: pulse 1.5s infinite;
        }

        .skeleton-text {
          height: 16px;
          margin: 12px;
          background: var(--surface-tertiary, #0f172a);
          border-radius: 4px;
          animation: pulse 1.5s infinite;
        }

        .skeleton-text.short {
          width: 60%;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .catalog-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          w: 48px;
          h: 48px;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 16px;
        }

        .catalog-empty h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
          margin-bottom: 8px;
        }

        .catalog-empty p {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 16px;
        }

        .reset-all-btn {
          padding: 8px 16px;
          background: var(--accent-cyan, #06b6d4);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          cursor: pointer;
        }

        .catalog-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 32px;
        }

        .pagination-btn {
          padding: 8px 16px;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: var(--accent-cyan, #06b6d4);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          gap: 4px;
        }

        .pagination-page {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-page:hover {
          border-color: var(--accent-cyan, #06b6d4);
        }

        .pagination-page.active {
          background: var(--accent-cyan, #06b6d4);
          border-color: var(--accent-cyan, #06b6d4);
        }

        @media (max-width: 768px) {
          .filter-panel {
            display: none;
          }

          .sort-container {
            margin-left: 0;
          }

          .catalog-products {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplaceCatalog;