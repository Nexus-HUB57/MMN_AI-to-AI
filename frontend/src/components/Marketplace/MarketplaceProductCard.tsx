import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Eye, Filter, Grid, List, Search } from 'lucide-react';

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
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export const MarketplaceProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  viewMode = 'grid'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusBadge = () => {
    switch (product.status) {
      case 'out_of_stock':
        return { label: 'Esgotado', className: 'badge-error' };
      case 'paused':
        return { label: 'Pausado', className: 'badge-warning' };
      case 'active':
        return product.stockQuantity <= 5
          ? { label: 'Últimas unidades', className: 'badge-warning' }
          : null;
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge();
  const images = product.images?.length ? product.images : [product.thumbnailUrl || 'https://via.placeholder.com/300x200'];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div
      className={`product-card ${viewMode === 'list' ? 'product-card-list' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
    >
      {/* Badge de status */}
      {statusBadge && (
        <span className={`product-badge ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      )}

      {/* Badge de desconto */}
      {hasDiscount && (
        <span className="product-badge badge-discount">
          -{discountPercent}%
        </span>
      )}

      {/* Imagem do produto */}
      <div className="product-image-container">
        <img
          src={images[imageIndex]}
          alt={product.name}
          className="product-image"
        />

        {/* Overlay com ações */}
        <div className={`product-overlay ${isHovered ? 'visible' : ''}`}>
          <button
            className="product-action-btn"
            onClick={() => onAddToCart?.(product)}
            title="Adicionar ao carrinho"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            className={`product-action-btn ${isWishlisted ? 'active' : ''}`}
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              onAddToWishlist?.(product);
            }}
            title="Adicionar aos favoritos"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Indicadores de imagem */}
        {images.length > 1 && (
          <div className="product-image-dots">
            {images.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                className={`dot ${imageIndex === idx ? 'active' : ''}`}
                onClick={() => setImageIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <div className="product-info">
        {/* Tipo de produto */}
        <span className="product-type-badge">
          {product.productType === 'digital' && 'Digital'}
          {product.productType === 'physical' && 'Físico'}
          {product.productType === 'service' && 'Serviço'}
          {product.productType === 'subscription' && 'Assinatura'}
        </span>

        <h3 className="product-name">{product.name}</h3>

        {product.shortDescription && viewMode === 'list' && (
          <p className="product-description">{product.shortDescription}</p>
        )}

        {/* Rating */}
        {product.rating !== undefined && (
          <div className="product-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.round(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
              />
            ))}
            <span className="rating-count">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Preço */}
        <div className="product-price-container">
          {hasDiscount && (
            <span className="product-price-compare">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
          <span className={`product-price ${hasDiscount ? 'discounted' : ''}`}>
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && viewMode === 'list' && (
          <div className="product-tags">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="product-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="product-stats">
          {product.salesCount !== undefined && product.salesCount > 0 && (
            <span className="product-stat">
              <ShoppingCart className="w-3 h-3" />
              {product.salesCount} vendas
            </span>
          )}
          {product.status === 'active' && (
            <span className="product-stat">
              <Eye className="w-3 h-3" />
              {product.stockQuantity} em estoque
            </span>
          )}
        </div>
      </div>

      <style>{`
        .product-card {
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          border-color: var(--accent-cyan, #06b6d4);
        }

        .product-card-list {
          display: flex;
          flex-direction: row;
        }

        .product-card-list .product-image-container {
          width: 200px;
          min-height: 150px;
        }

        .product-card-list .product-info {
          flex: 1;
          padding: 16px;
        }

        .product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          z-index: 2;
        }

        .badge-discount {
          right: 12px;
          left: auto;
          background: var(--accent-red, #ef4444);
          color: white;
        }

        .badge-error {
          background: var(--accent-red, #ef4444);
          color: white;
        }

        .badge-warning {
          background: var(--accent-yellow, #f59e0b);
          color: black;
        }

        .product-image-container {
          position: relative;
          aspect-ratio: 4/3;
          background: var(--surface-tertiary, #0f172a);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .product-overlay.visible {
          opacity: 1;
        }

        .product-action-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--surface-primary, #1e293b);
          border: 2px solid var(--border-color, #334155);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .product-action-btn:hover {
          background: var(--accent-cyan, #06b6d4);
          border-color: var(--accent-cyan, #06b6d4);
          transform: scale(1.1);
        }

        .product-action-btn.active {
          background: var(--accent-red, #ef4444);
          border-color: var(--accent-red, #ef4444);
        }

        .product-image-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
        }

        .product-image-dots .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .product-image-dots .dot.active {
          background: var(--accent-cyan, #06b6d4);
          transform: scale(1.2);
        }

        .product-info {
          padding: 16px;
        }

        .product-type-badge {
          display: inline-block;
          padding: 2px 8px;
          background: var(--surface-tertiary, #0f172a);
          border-radius: 4px;
          font-size: 10px;
          color: var(--text-secondary, #94a3b8);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-description {
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 8px;
        }

        .rating-count {
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
          margin-left: 4px;
        }

        .product-price-container {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
        }

        .product-price {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent-green, #22c55e);
        }

        .product-price.discounted {
          color: var(--accent-red, #ef4444);
        }

        .product-price-compare {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          text-decoration: line-through;
        }

        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }

        .product-tag {
          padding: 2px 6px;
          background: var(--surface-tertiary, #0f172a);
          border-radius: 4px;
          font-size: 10px;
          color: var(--text-secondary, #94a3b8);
        }

        .product-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .product-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
        }

        @media (max-width: 640px) {
          .product-card-list {
            flex-direction: column;
          }

          .product-card-list .product-image-container {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplaceProductCard;