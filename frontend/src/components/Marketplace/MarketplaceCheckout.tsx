import React, { useState } from 'react';
import {
  CreditCard, Truck, Package, Lock, CheckCircle, ArrowLeft,
  ShoppingBag, MapPin, Calendar, FileText
} from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  thumbnailUrl?: string;
  productType: 'digital' | 'physical' | 'service' | 'subscription';
  isDigital: boolean;
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CheckoutData {
  billingAddress: Address;
  shippingAddress: Address;
  sameAsBilling: boolean;
  shippingMethod: 'standard' | 'express' | 'pickup';
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  installment: number;
  cupomCode?: string;
}

interface MarketplaceCheckoutProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => void;
  onPlaceOrder?: (data: CheckoutData) => void;
  onBack?: () => void;
  onContinueShopping?: () => void;
  isProcessing?: boolean;
}

type CheckoutStep = 'cart' | 'address' | 'shipping' | 'payment' | 'confirmation';

export const MarketplaceCheckout: React.FC<MarketplaceCheckoutProps> = ({
  items,
  subtotal,
  discount,
  shipping,
  total,
  couponCode,
  onApplyCoupon,
  onPlaceOrder,
  onBack,
  onContinueShopping,
  isProcessing = false
}) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [couponInput, setCouponInput] = useState('');
  const [formData, setFormData] = useState<CheckoutData>({
    billingAddress: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'BR'
    },
    shippingAddress: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'BR'
    },
    sameAsBilling: true,
    shippingMethod: 'standard',
    paymentMethod: 'credit_card',
    installment: 1
  });

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const steps = [
    { key: 'cart', label: 'Carrinho', icon: ShoppingBag },
    { key: 'address', label: 'Endereço', icon: MapPin },
    { key: 'shipping', label: 'Envio', icon: Truck },
    { key: 'payment', label: 'Pagamento', icon: CreditCard },
    { key: 'confirmation', label: 'Confirmação', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const hasPhysicalItems = items.some(item => item.productType === 'physical');
  const hasDigitalItems = items.some(item => item.isDigital || item.productType === 'digital');

  const handleInputChange = (field: string, value: string, addressType: 'billing' | 'shipping' = 'billing') => {
    const [address, fieldName] = field.split('.');
    if (address === 'billing' || address === 'shipping') {
      setFormData(prev => ({
        ...prev,
        [address + 'Address']: {
          ...prev[address + 'Address'],
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      onApplyCoupon?.(couponInput.trim());
    }
  };

  const handlePlaceOrder = () => {
    onPlaceOrder?.(formData);
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key as CheckoutStep);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key as CheckoutStep);
    }
  };

  const renderCartStep = () => (
    <div className="step-content">
      <h2 className="step-title">Revise seu pedido</h2>

      <div className="cart-review">
        {items.map(item => (
          <div key={item.id} className="review-item">
            <img
              src={item.thumbnailUrl || 'https://via.placeholder.com/60x60'}
              alt={item.name}
              className="item-thumb"
            />
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-type">{item.productType === 'digital' ? 'Digital' : 'Físico'}</span>
            </div>
            <div className="item-qty">x{item.quantity}</div>
            <div className="item-price">{formatPrice(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>

      <div className="coupon-input-row">
        <input
          type="text"
          placeholder={couponCode || "Código do cupom"}
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          className="coupon-input"
          disabled={!!couponCode}
        />
        <button onClick={handleApplyCoupon} className="apply-btn" disabled={!!couponCode}>
          {couponCode ? 'Aplicado' : 'Aplicar'}
        </button>
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="step-content">
      <h2 className="step-title">Informações de entrega</h2>

      <div className="address-form">
        <div className="form-section">
          <h3 className="section-title">Endereço de Cobrança</h3>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Logradouro</label>
              <input
                type="text"
                value={formData.billingAddress.street}
                onChange={(e) => handleInputChange('billing.street', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Número</label>
              <input
                type="text"
                value={formData.billingAddress.number}
                onChange={(e) => handleInputChange('billing.number', e.target.value)}
                placeholder="123"
              />
            </div>
            <div className="form-group">
              <label>Complemento</label>
              <input
                type="text"
                value={formData.billingAddress.complement || ''}
                onChange={(e) => handleInputChange('billing.complement', e.target.value)}
                placeholder="Apto, Sala, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bairro</label>
              <input
                type="text"
                value={formData.billingAddress.neighborhood}
                onChange={(e) => handleInputChange('billing.neighborhood', e.target.value)}
                placeholder="Bairro"
              />
            </div>
            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                value={formData.billingAddress.zipCode}
                onChange={(e) => handleInputChange('billing.zipCode', e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                value={formData.billingAddress.city}
                onChange={(e) => handleInputChange('billing.city', e.target.value)}
                placeholder="Cidade"
              />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select
                value={formData.billingAddress.state}
                onChange={(e) => handleInputChange('billing.state', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.sameAsBilling}
            onChange={(e) => setFormData(prev => ({ ...prev, sameAsBilling: e.target.checked }))}
          />
          <span>Endereço de entrega igual ao de cobrança</span>
        </label>
      </div>
    </div>
  );

  const renderShippingStep = () => (
    <div className="step-content">
      <h2 className="step-title">Método de envio</h2>

      <div className="shipping-options">
        <label className={`shipping-option ${formData.shippingMethod === 'standard' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === 'standard'}
            onChange={() => setFormData(prev => ({ ...prev, shippingMethod: 'standard' }))}
          />
          <div className="option-content">
            <Truck className="option-icon" />
            <div className="option-info">
              <span className="option-name">Frete Padrão</span>
              <span className="option-desc">5-10 dias úteis</span>
            </div>
            <span className="option-price">{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
          </div>
        </label>

        <label className={`shipping-option ${formData.shippingMethod === 'express' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === 'express'}
            onChange={() => setFormData(prev => ({ ...prev, shippingMethod: 'express' }))}
          />
          <div className="option-content">
            <Truck className="option-icon express" />
            <div className="option-info">
              <span className="option-name">Frete Expresso</span>
              <span className="option-desc">2-3 dias úteis</span>
            </div>
            <span className="option-price">{formatPrice(shipping * 2)}</span>
          </div>
        </label>

        <label className={`shipping-option ${formData.shippingMethod === 'pickup' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="shipping"
            checked={formData.shippingMethod === 'pickup'}
            onChange={() => setFormData(prev => ({ ...prev, shippingMethod: 'pickup' }))}
          />
          <div className="option-content">
            <Package className="option-icon" />
            <div className="option-info">
              <span className="option-name">Retirada na Loja</span>
              <span className="option-desc">Disponível em 24h</span>
            </div>
            <span className="option-price free">Grátis</span>
          </div>
        </label>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="step-content">
      <h2 className="step-title">Forma de pagamento</h2>

      <div className="payment-options">
        <label className={`payment-option ${formData.paymentMethod === 'credit_card' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === 'credit_card'}
            onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit_card' }))}
          />
          <div className="option-content">
            <CreditCard className="option-icon" />
            <div className="option-info">
              <span className="option-name">Cartão de Crédito</span>
              <span className="option-desc">Parcele em até 12x</span>
            </div>
          </div>
        </label>

        <label className={`payment-option ${formData.paymentMethod === 'pix' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === 'pix'}
            onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'pix' }))}
          />
          <div className="option-content">
            <FileText className="option-icon pix" />
            <div className="option-info">
              <span className="option-name">PIX</span>
              <span className="option-desc">Aprovação imediata</span>
            </div>
          </div>
        </label>

        <label className={`payment-option ${formData.paymentMethod === 'boleto' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="payment"
            checked={formData.paymentMethod === 'boleto'}
            onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'boleto' }))}
          />
          <div className="option-content">
            <FileText className="option-icon" />
            <div className="option-info">
              <span className="option-name">Boleto Bancário</span>
              <span className="option-desc">Vencimento em 3 dias</span>
            </div>
          </div>
        </label>
      </div>

      {formData.paymentMethod === 'credit_card' && (
        <div className="card-form">
          <div className="form-group">
            <label>Número do Cartão</label>
            <input type="text" placeholder="0000 0000 0000 0000" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Validade</label>
              <input type="text" placeholder="MM/AA" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input type="text" placeholder="123" />
            </div>
          </div>
          <div className="form-group">
            <label>Nome no Cartão</label>
            <input type="text" placeholder="Como está no cartão" />
          </div>

          <div className="installment-section">
            <label>Parcelas</label>
            <select
              value={formData.installment}
              onChange={(e) => setFormData(prev => ({ ...prev, installment: parseInt(e.target.value) }))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <option key={num} value={num}>
                  {num}x de {formatPrice(Math.ceil(total / num))} {num === 1 ? '(à vista)' : `(Total: ${formatPrice(total)})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="step-content confirmation">
      <div className="confirmation-icon">
        <CheckCircle className="w-16 h-16" />
      </div>
      <h2 className="step-title">Pedido realizado com sucesso!</h2>
      <p className="order-number">Número do pedido: #123456</p>

      <div className="confirmation-details">
        <div className="detail-item">
          <span className="detail-label">Itens:</span>
          <span className="detail-value">{items.length} produtos</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Subtotal:</span>
          <span className="detail-value">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="detail-item discount">
            <span className="detail-label">Desconto:</span>
            <span className="detail-value">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-label">Frete:</span>
          <span className="detail-value">{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
        </div>
        <div className="detail-item total">
          <span className="detail-label">Total:</span>
          <span className="detail-value">{formatPrice(total)}</span>
        </div>
      </div>

      <p className="confirmation-message">
        Você receberá um e-mail com os detalhes do pedido e informações de rastreamento.
      </p>

      <button onClick={onContinueShopping} className="continue-shopping-btn">
        Continuar Comprando
      </button>
    </div>
  );

  return (
    <div className="checkout-page">
      {/* Progress Steps */}
      <div className="checkout-steps">
        {steps.map((step, idx) => (
          <div
            key={step.key}
            className={`step-indicator ${idx <= currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
          >
            <div className="step-circle">
              {idx < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
            </div>
            <span className="step-label">{step.label}</span>
            {idx < steps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <div className="checkout-grid">
        {/* Main Content */}
        <div className="checkout-main">
          {currentStep === 'cart' && renderCartStep()}
          {currentStep === 'address' && renderAddressStep()}
          {currentStep === 'shipping' && renderShippingStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'confirmation' && renderConfirmationStep()}

          {/* Navigation */}
          {currentStep !== 'confirmation' && (
            <div className="checkout-nav">
              {currentStepIndex > 0 && (
                <button onClick={goToPrevStep} className="nav-btn back">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              )}
              <button
                onClick={currentStep === 'payment' ? handlePlaceOrder : goToNextStep}
                className="nav-btn next"
                disabled={isProcessing}
              >
                <span>{currentStep === 'payment' ? 'Finalizar Pedido' : 'Continuar'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <h3 className="sidebar-title">Resumo do Pedido</h3>

          <div className="sidebar-items">
            {items.map(item => (
              <div key={item.id} className="sidebar-item">
                <img src={item.thumbnailUrl || 'https://via.placeholder.com/40x40'} alt={item.name} />
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-totals">
            <div className="total-line">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="total-line discount">
                <span>Desconto</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="total-line">
              <span>Frete</span>
              <span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
            </div>
            <div className="total-line grand-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="security-badge">
            <Lock className="w-4 h-4" />
            <span>Compra 100% segura</span>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .checkout-steps {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          max-width: 120px;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-secondary, #1e293b);
          border: 2px solid var(--border-color, #334155);
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .step-indicator.active .step-circle {
          border-color: var(--accent-cyan, #06b6d4);
          color: var(--accent-cyan, #06b6d4);
        }

        .step-indicator.completed .step-circle {
          background: var(--accent-cyan, #06b6d4);
          border-color: var(--accent-cyan, #06b6d4);
          color: white;
        }

        .step-label {
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
          text-align: center;
        }

        .step-indicator.active .step-label {
          color: var(--text-primary, #f8fafc);
          font-weight: 500;
        }

        .step-line {
          position: absolute;
          top: 20px;
          left: calc(50% + 24px);
          width: calc(100% - 48px);
          height: 2px;
          background: var(--border-color, #334155);
        }

        .step-indicator.completed .step-line {
          background: var(--accent-cyan, #06b6d4);
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
        }

        .checkout-main {
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 12px;
          padding: 24px;
        }

        .step-content {
          min-height: 400px;
        }

        .step-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
          margin-bottom: 24px;
        }

        .cart-review {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .review-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--surface-tertiary, #0f172a);
          border-radius: 8px;
        }

        .item-thumb {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
        }

        .review-item .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .review-item .item-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        .review-item .item-type {
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
        }

        .review-item .item-qty {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
        }

        .review-item .item-price {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .coupon-input-row {
          display: flex;
          gap: 8px;
          margin-top: 24px;
        }

        .coupon-input {
          flex: 1;
          padding: 12px 16px;
          background: var(--surface-tertiary, #0f172a);
          border: 1px solid var(--border-color, #334155);
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
        }

        .coupon-input:focus {
          outline: none;
          border-color: var(--accent-cyan, #06b6d4);
        }

        .apply-btn {
          padding: 12px 24px;
          background: var(--accent-cyan, #06b6d4);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .apply-btn:disabled {
          opacity: 0.5;
        }

        .address-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
        }

        .form-group input, .form-group select {
          padding: 10px 12px;
          background: var(--surface-tertiary, #0f172a);
          border: 1px solid var(--border-color, #334155);
          border-radius: 6px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: var(--accent-cyan, #06b6d4);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-primary, #f8fafc);
        }

        .checkbox-label input {
          accent-color: var(--accent-cyan, #06b6d4);
        }

        .shipping-options, .payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shipping-option, .payment-option {
          display: flex;
          padding: 16px;
          background: var(--surface-tertiary, #0f172a);
          border: 2px solid var(--border-color, #334155);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .shipping-option:hover, .payment-option:hover {
          border-color: var(--accent-cyan, #06b6d4);
        }

        .shipping-option.selected, .payment-option.selected {
          border-color: var(--accent-cyan, #06b6d4);
          background: rgba(6, 182, 212, 0.1);
        }

        .shipping-option input, .payment-option input {
          display: none;
        }

        .option-content {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .option-icon {
          width: 40px;
          height: 40px;
          padding: 8px;
          background: var(--surface-secondary, #1e293b);
          border-radius: 8px;
          color: var(--text-secondary, #94a3b8);
        }

        .option-icon.express, .option-icon.pix {
          color: var(--accent-cyan, #06b6d4);
        }

        .option-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .option-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .option-desc {
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
        }

        .option-price {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .option-price.free {
          color: var(--accent-green, #22c55e);
        }

        .card-form {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .installment-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .installment-section label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
        }

        .installment-section select {
          padding: 10px 12px;
          background: var(--surface-tertiary, #0f172a);
          border: 1px solid var(--border-color, #334155);
          border-radius: 6px;
          color: var(--text-primary, #f8fafc);
          font-size: 14px;
        }

        .confirmation {
          text-align: center;
          padding: 40px;
        }

        .confirmation-icon {
          color: var(--accent-green, #22c55e);
          margin-bottom: 24px;
        }

        .order-number {
          font-size: 16px;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 24px;
        }

        .confirmation-details {
          background: var(--surface-tertiary, #0f172a);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          text-align: left;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color, #334155);
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
        }

        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        .detail-item.discount .detail-value {
          color: var(--accent-green, #22c55e);
        }

        .detail-item.total {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 2px solid var(--border-color, #334155);
          border-bottom: none;
        }

        .detail-item.total .detail-label {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .detail-item.total .detail-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--accent-green, #22c55e);
        }

        .confirmation-message {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 24px;
        }

        .continue-shopping-btn {
          padding: 12px 32px;
          background: var(--accent-cyan, #06b6d4);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .checkout-nav {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color, #334155);
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn.back {
          background: none;
          border: 1px solid var(--border-color, #334155);
          color: var(--text-primary, #f8fafc);
        }

        .nav-btn.back:hover {
          border-color: var(--accent-cyan, #06b6d4);
          color: var(--accent-cyan, #06b6d4);
        }

        .nav-btn.next {
          background: var(--accent-cyan, #06b6d4);
          border: none;
          color: white;
          margin-left: auto;
        }

        .nav-btn.next:hover {
          background: var(--accent-cyan-dark, #0891b2);
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .checkout-sidebar {
          background: var(--surface-secondary, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 12px;
          padding: 20px;
          height: fit-content;
          position: sticky;
          top: 24px;
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
          margin-bottom: 16px;
        }

        .sidebar-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color, #334155);
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sidebar-item img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 4px;
        }

        .sidebar-item .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-item .item-name {
          font-size: 12px;
          color: var(--text-primary, #f8fafc);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }

        .sidebar-item .item-qty {
          font-size: 10px;
          color: var(--text-secondary, #94a3b8);
        }

        .sidebar-item .item-price {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        .sidebar-totals {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
        }

        .total-line.discount {
          color: var(--accent-green, #22c55e);
        }

        .total-line.grand-total {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color, #334155);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }

        .total-line.grand-total span:last-child {
          color: var(--accent-green, #22c55e);
        }

        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color, #334155);
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
        }

        .security-badge svg {
          color: var(--accent-green, #22c55e);
        }

        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .checkout-sidebar {
            position: static;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .step-line {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplaceCheckout;