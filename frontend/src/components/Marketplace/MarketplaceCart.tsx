import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Heart, ArrowRight, X } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  thumbnailUrl?: string;
  quantity: number;
  maxQuantity: number;
  productType: 'digital' | 'physical' | 'service' | 'subscription';
  variations?: {
    name: string;
    value: string;
  }[];
}

interface MarketplaceCartProps {
  items: CartItem[];
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
  onContinueShopping?: () => void;
  couponCode?: string;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
  discount?: number;
}

export const MarketplaceCart: React.FC<MarketplaceCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onContinueShopping,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  discount = 0
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discount > 0 ? Math.round(subtotal * (discount / 100)) : 0;
  const total = subtotal - discountAmount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty >= 1) {
      onUpdateQuantity?.(itemId, newQty);
    }
  };

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      setIsApplyingCoupon(true);
      onApplyCoupon?.(couponInput.trim());
      setTimeout(() => setIsApplyingCoupon(false), 1000);
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'digital': return 'Digital';
      case 'physical': return 'Físico';
      case 'service': return 'Serviço';
      case 'subscription': return 'Assinatura';
      default: return type;
    }
  };

  const handleMoveToWishlist = (item: CartItem) => {
    onRemoveItem?.(item.id);
    // Wishlist logic would be handled here
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag className="empty-icon" />
        <h3>Seu carrinho está vazio</h3>
        <p>Adicione produtos para começar a comprar</p>
        <button onClick={onContinueShopping} className="continue-btn">
          Continuar Comprando
          <ArrowRight className="w-4 h-4" />
        </button>

        <style>{`
          .cart-empty {
            text-align: center;
            padding: 60px 20px;
          }
          .empty-icon {
            width: 64px;
            height: 64px;
            color: var(--text-secondary, #94a3b8);
            margin-bottom: 20px;
          }
          .cart-empty h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary, #f8fafc);
            margin-bottom: 8px;
          }
          .cart-empty p {
            font-size: 14px;
            color: var(--text-secondary, #94a3b8);
            margin-bottom: 24px;
          }
          .continue-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--accent-cyan, #06b6d4);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .continue-btn:hover {
            background: var(--accent-cyan-dark, #0891b2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="marketplace-cart">
      {/* Header */}
      <div className="cart-header">
        <div className="cart-title-section">
          <ShoppingBag className="cart-icon" />
          <h2 className="cart-title">Carrinho de Compras</h2>
          <span className="cart-count">({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
        </div>
        <button onClick={onContinueShopping} className="continue-link">
          Continuar Comprando
        </button>
      </div>

      <div className="cart-body">
        {/* Cart Items */}
        <div className="cart-items">
          <div className="items-header">
            <span>Produto</span>
            <span>Quantidade</span>
            <span>Total</span>
          </div>

          {items.map(item => (
            <div key={item.id} className="cart-item">
              {/* Product Info */}
              <div className="item-info">
                <img
                  src={item.thumbnailUrl || 'https://via.placeholder.com/80x80'}
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-details">
                  <span className="item-type">{getProductTypeLabel(item.productType)}</span>
                  <h4 className="item-name">{item.name}</h4>
                  {item.variations && item.variations.length > 0 && (
                    <div className="item-variations">
                      {item.variations.map((v, i) => (
                        <span key={i} className="variation">{v.name}: {v.value}</span>
                      ))}
                    </div>
                  )}
                  <div className="item-price">
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                      <span className="price-compare">{formatPrice(item.compareAtPrice)}</span>
                    )}
                    <span className="price-current">{formatPrice(item.price)}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="item-quantity">
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                    disabled={item.quantity >= item.maxQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {item.productType === 'physical' && (
                  <span className="stock-info">
                    {item.maxQuantity <= 5 ? `${item.maxQuantity} restantes` : `${item.maxQuantity} em estoque`}
                  </span>
                )}
              </div>

              {/* Item Total */}
              <div className="item-total">
                <span className="total-price">{formatPrice(item.price * item.quantity)}</span>
                <div className="item-actions">
                  <button
                    className="action-btn wishlist-btn"
                    onClick={() => handleMoveToWishlist(item)}
                    title="Mover para wishlist"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    className="action-btn remove-btn"
                    onClick={() => onRemoveItem?.(item.id)}
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="items-footer">
            <button onClick={onClearCart} className="clear-btn">
              Limpar Carrinho
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3 className="summary-title">Resumo do Pedido</h3>

          {/* Coupon */}
          <div className="coupon-section">
            {couponCode ? (
              <div className="coupon-applied">
                <div className="coupon-info">
                  <span className="coupon-label">Cupom aplicado:</span>
                  <span className="coupon-code">{couponCode}</span>
                  <span className="coupon-discount">-{discount}%</span>
                </div>
                <button onClick={onRemoveCoupon} className="remove-coupon-btn">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : showCouponInput ? (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Código do cupom"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="coupon-input"
                />
                <button
                  className="apply-coupon-btn"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim() || isApplyingCoupon}
                >
                  {isApplyingCoupon ? 'Aplicando...' : 'Aplicar'}
                </button>
              </div>
            ) : (
              <button
                className="add-coupon-btn"
                onClick={() => setShowCouponInput(true)}
              >
                Adicionar cupom
              </button>
            )}
          </div>

          {/* Summary Lines */}
          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal ({itemCount} itens)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-line discount">
                <span>Desconto ({discount}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Frete</span>
              <span className="free-shipping">Grátis</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span className="total-value">{formatPrice(total)}</span>
          </div>

          <button onClick={onCheckout} className="checkout-btn">
            Finalizar Compra
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Security Badge */}
          <div className="security-info">
            <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Compra segura e criptografada</span>
          </div>
        </div>
      </div>

      <style>{`
        .marketplace-cart {
          padding: 24px;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color, #334155);
        }

        .cart-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-icon {
          width: 28px;
          height: 28px;
          color: var(--accent-cyan, #06b6d4);
        }

        .cart-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }

        .cart-count {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
        }

        .continue-link {
          background: none;
          border: none;
          color: var(--accent-cyan, #06b6d4);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .continue-link:hover {
          text-decoration: underline;
        }

        .cart-body {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
        }

        .cart-items {
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 12px;
          overflow: hidden;
        }

        .items-header {
          display: grid;
          grid-template-columns: 1fr 140px 120px;
          gap: 16px;
          padding: 16px;
          background: var(--surface-tertiary, #0f172a);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-secondary, #94a3b8);
        }

        .cart-item {
          display: grid;
          grid-template-columns: 1fr 140px 120px;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid var(--border-color, #334155);
          align-items: center;
        }

        .cart-item:last-of-type {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          gap: 12px;
        }

        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          background: var(--surface-tertiary, #0f172a);
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-type {
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-secondary, #94a3b8);
        }

        .item-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
          line-height: 1.3;
        }

        .item-variations {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .variation {
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
          padding: 2px 6px;
          background: var(--surface-tertiary, #0f172a);
          border-radius: 4px;
        }

        .item-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 4px;
        }

        .price-compare {
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
          text-decoration: line-through;
        }

        .price-current {
          font-size: 14px;
          font-weight: 600;
          color: var(--accent-green, #22c55e);
        }

        .item-quantity {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          overflow: hidden;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-tertiary, #0f172a);
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
          width: 40px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .stock-info {
          font-size: 10px;
          color: var(--accent-yellow, #f59e0b);
        }

        .item-total {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .total-price {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }

        .item-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid var(--border-color, #334155);
          border-radius: 6px;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          border-color: var(--accent-cyan, #06b6d4);
          color: var(--accent-cyan, #06b6d4);
        }

        .remove-btn:hover {
          border-color: var(--accent-red, #ef4444);
          color: var(--accent-red, #ef4444);
        }

        .items-footer {
          padding: 16px;
          display: flex;
          justify-content: flex-end;
        }

        .clear-btn {
          background: none;
          border: none;
          color: var(--accent-red, #ef4444);
          font-size: 13px;
          cursor: pointer;
        }

        .clear-btn:hover {
          text-decoration: underline;
        }

        .cart-summary {
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 12px;
          padding: 20px;
          height: fit-content;
          position: sticky;
          top: 24px;
        }

        .summary-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
          margin-bottom: 16px;
        }

        .coupon-section {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color, #334155);
        }

        .coupon-applied {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--accent-green, #22c55e);
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid var(--accent-green, #22c55e);
          border-radius: 8px;
        }

        .coupon-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .coupon-label {
          font-size: 10px;
          color: var(--text-secondary, #94a3b8);
        }

        .coupon-code {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .coupon-discount {
          font-size: 12px;
          color: var(--accent-green, #22c55e);
          font-weight: 600;
        }

        .remove-coupon-btn {
          background: none;
          border: none;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          padding: 4px;
        }

        .coupon-input-group {
          display: flex;
          gap: 8px;
        }

        .coupon-input {
          flex: 1;
          padding: 8px 12px;
          background: var(--surface-tertiary, #0f172a);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 13px;
        }

        .coupon-input:focus {
          outline: none;
          border-color: var(--accent-cyan, #06b6d4);
        }

        .apply-coupon-btn {
          padding: 8px 16px;
          background: var(--accent-cyan, #06b6d4);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .apply-coupon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-coupon-btn {
          width: 100%;
          padding: 10px;
          background: none;
          border: 1px dashed var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-secondary, #94a3b8);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-coupon-btn:hover {
          border-color: var(--accent-cyan, #06b6d4);
          color: var(--accent-cyan, #06b6d4);
        }

        .summary-lines {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
        }

        .summary-line.discount {
          color: var(--accent-green, #22c55e);
        }

        .free-shipping {
          color: var(--accent-green, #22c55e);
          font-weight: 500;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid var(--border-color, #334155);
          margin-bottom: 16px;
        }

        .summary-total span:first-child {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .total-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent-green, #22c55e);
        }

        .checkout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: var(--accent-cyan, #06b6d4);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .checkout-btn:hover {
          background: var(--accent-cyan-dark, #0891b2);
        }

        .security-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
        }

        .lock-icon {
          width: 14px;
          height: 14px;
        }

        @media (max-width: 768px) {
          .cart-body {
            grid-template-columns: 1fr;
          }

          .items-header {
            display: none;
          }

          .cart-item {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .item-quantity {
            flex-direction: row;
            justify-content: flex-start;
          }

          .item-total {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .cart-summary {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplaceCart;