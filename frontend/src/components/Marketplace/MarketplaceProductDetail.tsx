import React, { useState } from 'react';
import {
  Star, Heart, ShoppingCart, ChevronLeft, ChevronRight,
  Share2, Truck, Shield, Download, CheckCircle, Minus, Plus
} from 'lucide-react';

interface ProductVariation {
  id: string;
  name: string;
  options: { label: string; value: string; stock?: number }[];
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  thumbnailUrl?: string;
  images?: string[];
  shortDescription?: string;
  description?: string;
  stockQuantity: number;
  status: 'draft' | 'active' | 'paused' | 'archived' | 'out_of_stock';
  productType: 'digital' | 'physical' | 'service' | 'subscription';
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  isFeatured?: boolean;
  tags?: string[];
  categoryId?: string;
  categoryName?: string;
  variations?: ProductVariation[];
  features?: string[];
  warranty?: string;
  downloadUrl?: string;
  subscriptionInterval?: string;
}

interface MarketplaceProductDetailProps {
  product: Product;
  reviews?: Review[];
  onAddToCart?: (product: Product, quantity: number, variations?: Record<string, string>) => void;
  onAddToWishlist?: (product: Product) => void;
  onBack?: () => void;
}

export const MarketplaceProductDetail: React.FC<MarketplaceProductDetailProps> = ({
  product,
  reviews = [],
  onAddToCart,
  onAddToWishlist,
  onBack
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  const images = product.images?.length ? product.images : [product.thumbnailUrl || 'https://via.placeholder.com/600x600'];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;
  const maxQuantity = product.stockQuantity;
  const isOutOfStock = product.status === 'out_of_stock' || product.stockQuantity === 0;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxQuantity) {
      setQuantity(newQty);
    }
  };

  const handleVariationChange = (variationName: string, value: string) => {
    setSelectedVariations(prev => ({ ...prev, [variationName]: value }));
  };

  const handleAddToCart = () => {
    const hasAllVariations = product.variations?.every(v => selectedVariations[v.name]);
    if (hasAllVariations || !product.variations?.length) {
      onAddToCart?.(product, quantity, selectedVariations);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePrevImage = () => {
    setSelectedImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'digital': return 'Produto Digital';
      case 'physical': return 'Produto Físico';
      case 'service': return 'Serviço';
      case 'subscription': return 'Assinatura';
      default: return type;
    }
  };

  return (
    <div className="product-detail">
      {/* Back Button */}
      <button onClick={onBack} className="back-btn">
        <ChevronLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="detail-grid">
        {/* Image Gallery */}
        <div className="image-section">
          {/* Main Image */}
          <div className="main-image-container">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="main-image"
            />

            {images.length > 1 && (
              <>
                <button className="nav-btn prev" onClick={handlePrevImage}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button className="nav-btn next" onClick={handleNextImage}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="image-badges">
              {hasDiscount && (
                <span className="badge badge-discount">-{discountPercent}%</span>
              )}
              {product.isFeatured && (
                <span className="badge badge-featured">Destaque</span>
              )}
              {isOutOfStock && (
                <span className="badge badge-out">Esgotado</span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="info-section">
          <span className="product-type">{getProductTypeLabel(product.productType)}</span>
          {product.categoryName && <span className="product-category">{product.categoryName}</span>}

          <h1 className="product-name">{product.name}</h1>

          {/* Rating */}
          <div className="product-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.round(product.rating || 0) ? 'star-filled' : 'star-empty'}`}
              />
            ))}
            <span className="rating-text">
              {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} avaliações)
            </span>
          </div>

          {/* Price */}
          <div className="price-section">
            {hasDiscount && (
              <span className="price-compare">{formatPrice(product.compareAtPrice!)}</span>
            )}
            <span className={`price-current ${hasDiscount ? 'discounted' : ''}`}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="save-badge">Economize {formatPrice(product.compareAtPrice! - product.price)}</span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="short-description">{product.shortDescription}</p>
          )}

          {/* Variations */}
          {product.variations && product.variations.length > 0 && (
            <div className="variations-section">
              {product.variations.map(variation => (
                <div key={variation.id} className="variation-group">
                  <label className="variation-label">
                    {variation.name}: {selectedVariations[variation.name] || 'Selecione'}
                  </label>
                  <div className="variation-options">
                    {variation.options.map(option => (
                      <button
                        key={option.value}
                        className={`variation-btn ${selectedVariations[variation.name] === option.value ? 'selected' : ''}`}
                        onClick={() => handleVariationChange(variation.name, option.value)}
                        disabled={option.stock === 0}
                      >
                        {option.label}
                        {option.stock !== undefined && option.stock <= 5 && (
                          <span className="low-stock">{option.stock} restantes</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="quantity-section">
              <label className="quantity-label">Quantidade:</label>
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {product.productType === 'physical' && (
                <span className="stock-info">
                  {maxQuantity <= 10 ? `Apenas ${maxQuantity} em estoque` : `${maxQuantity} disponíveis`}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="actions-section">
            <button
              className={`add-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isOutOfStock ? 'Esgotado' : 'Adicionar ao Carrinho'}</span>
            </button>
            <button
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => {
                setIsWishlisted(!isWishlisted);
                onAddToWishlist?.(product);
              }}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button className="share-btn" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="features-section">
              {product.features.map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <CheckCircle className="w-4 h-4" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Delivery Info */}
          <div className="delivery-section">
            {product.productType === 'digital' && product.downloadUrl && (
              <div className="delivery-item">
                <Download className="w-5 h-5" />
                <span>Download imediato disponível após compra</span>
              </div>
            )}
            {product.productType === 'physical' && (
              <div className="delivery-item">
                <Truck className="w-5 h-5" />
                <span>Frete calculado no checkout</span>
              </div>
            )}
            {product.warranty && (
              <div className="delivery-item">
                <Shield className="w-5 h-5" />
                <span>{product.warranty}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Descrição
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Avaliações ({product.reviewCount || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Envio
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-panel">
              <div
                className="product-description"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />
              {product.tags && product.tags.length > 0 && (
                <div className="product-tags">
                  {product.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-panel">
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.userName}</span>
                          {review.verified && (
                            <span className="verified-badge">Verificada</span>
                          )}
                        </div>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'star-filled' : 'star-empty'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-reviews">
                  <p>Ainda não há avaliações para este produto.</p>
                  <p>Seja o primeiro a avaliar!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="tab-panel shipping-info">
              {product.productType === 'digital' ? (
                <div className="shipping-digital">
                  <h4>Produtos Digitais</h4>
                  <ul>
                    <li>Arquivos disponíveis para download imediato após confirmação de pagamento</li>
                    <li>Você receberá um link por e-mail</li>
                    <li>Arquivos em formatos comuns (PDF, ZIP, etc.)</li>
                  </ul>
                </div>
              ) : (
                <div className="shipping-physical">
                  <h4>Produtos Físicos</h4>
                  <ul>
                    <li>Frete calculado conforme CEP de entrega</li>
                    <li>Prazo de entrega: 5-15 dias úteis</li>
                    <li>Rastreamento disponível após postagem</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .product-detail {
          padding: 24px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--text-secondary, #94a3b8);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 24px;
          transition: color 0.2s ease;
        }

        .back-btn:hover {
          color: var(--accent-cyan, #06b6d4);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .image-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .main-image-container {
          position: relative;
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          background: var(--surface-secondary, #1e293b);
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          background: var(--accent-cyan, #06b6d4);
        }

        .nav-btn.prev { left: 16px; }
        .nav-btn.next { right: 16px; }

        .image-badges {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-discount {
          background: var(--accent-red, #ef4444);
          color: white;
        }

        .badge-featured {
          background: var(--accent-cyan, #06b6d4);
          color: white;
        }

        .badge-out {
          background: var(--text-secondary, #94a3b8);
          color: white;
        }

        .thumbnail-list {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .thumbnail {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          background: none;
        }

        .thumbnail.active {
          border-color: var(--accent-cyan, #06b6d4);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-type, .product-category {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-secondary, #94a3b8);
        }

        .product-name {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
          line-height: 1.3;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .star-filled {
          color: var(--accent-yellow, #f59e0b);
          fill: var(--accent-yellow, #f59e0b);
        }

        .star-empty {
          color: var(--text-secondary, #94a3b8);
        }

        .rating-text {
          margin-left: 8px;
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
        }

        .price-section {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }

        .price-compare {
          font-size: 18px;
          color: var(--text-secondary, #94a3b8);
          text-decoration: line-through;
        }

        .price-current {
          font-size: 32px;
          font-weight: 700;
          color: var(--accent-green, #22c55e);
        }

        .price-current.discounted {
          color: var(--accent-red, #ef4444);
        }

        .save-badge {
          padding: 4px 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid var(--accent-green, #22c55e);
          border-radius: 4px;
          font-size: 12px;
          color: var(--accent-green, #22c55e);
        }

        .short-description {
          font-size: 15px;
          color: var(--text-secondary, #94a3b8);
          line-height: 1.6;
        }

        .variations-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .variation-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .variation-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        .variation-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .variation-btn {
          padding: 8px 16px;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .variation-btn:hover:not(:disabled) {
          border-color: var(--accent-cyan, #06b6d4);
        }

        .variation-btn.selected {
          background: var(--accent-cyan, #06b6d4);
          border-color: var(--accent-cyan, #06b6d4);
          color: white;
        }

        .variation-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .low-stock {
          display: block;
          font-size: 10px;
          color: var(--accent-yellow, #f59e0b);
        }

        .quantity-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .quantity-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          overflow: hidden;
        }

        .qty-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-secondary, #1e293b);
          border: none;
          color: var(--text-primary, #f8fafc);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: var(--accent-cyan, #06b6d4);
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-value {
          width: 50px;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .stock-info {
          font-size: 12px;
          color: var(--accent-yellow, #f59e0b);
        }

        .actions-section {
          display: flex;
          gap: 12px;
        }

        .add-cart-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: var(--accent-cyan, #06b6d4);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-cart-btn:hover:not(:disabled) {
          background: var(--accent-cyan-dark, #0891b2);
        }

        .add-cart-btn.disabled {
          background: var(--text-secondary, #94a3b8);
          cursor: not-allowed;
        }

        .wishlist-btn, .share-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wishlist-btn:hover {
          border-color: var(--accent-red, #ef4444);
          color: var(--accent-red, #ef4444);
        }

        .wishlist-btn.active {
          background: var(--accent-red, #ef4444);
          border-color: var(--accent-red, #ef4444);
          color: white;
        }

        .share-btn:hover {
          border-color: var(--accent-cyan, #06b6d4);
          color: var(--accent-cyan, #06b6d4);
        }

        .features-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: var(--surface-secondary, #1e293b);
          border-radius: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
        }

        .feature-item svg {
          color: var(--accent-green, #22c55e);
        }

        .delivery-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .delivery-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
        }

        .delivery-item svg {
          color: var(--accent-cyan, #06b6d4);
        }

        .tabs-section {
          background: var(--surface-secondary, #1e293b);
          border-radius: 12px;
          overflow: hidden;
        }

        .tabs-header {
          display: flex;
          border-bottom: 1px solid var(--border-color, #334155);
        }

        .tab-btn {
          flex: 1;
          padding: 16px;
          background: none;
          border: none;
          color: var(--text-secondary, #94a3b8);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: var(--text-primary, #f8fafc);
        }

        .tab-btn.active {
          color: var(--accent-cyan, #06b6d4);
          border-bottom: 2px solid var(--accent-cyan, #06b6d4);
        }

        .tabs-content {
          padding: 24px;
        }

        .tab-panel {
          min-height: 200px;
        }

        .product-description {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          line-height: 1.8;
        }

        .product-description p {
          margin-bottom: 16px;
        }

        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 24px;
        }

        .tag {
          padding: 4px 12px;
          background: var(--surface-tertiary, #0f172a);
          border-radius: 20px;
          font-size: 12px;
          color: var(--accent-cyan, #06b6d4);
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-item {
          padding: 16px;
          background: var(--surface-tertiary, #0f172a);
          border-radius: 12px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reviewer-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .verified-badge {
          padding: 2px 6px;
          background: var(--accent-green, #22c55e);
          border-radius: 4px;
          font-size: 10px;
          color: white;
        }

        .review-rating {
          display: flex;
          gap: 2px;
        }

        .review-comment {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .review-date {
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
        }

        .no-reviews {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary, #94a3b8);
        }

        .shipping-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
          margin-bottom: 12px;
        }

        .shipping-info ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shipping-info li {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          padding-left: 20px;
          position: relative;
        }

        .shipping-info li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--accent-cyan, #06b6d4);
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .product-name {
            font-size: 22px;
          }

          .price-current {
            font-size: 26px;
          }

          .tabs-header {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplaceProductDetail;