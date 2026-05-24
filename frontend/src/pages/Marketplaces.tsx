import { useState, useCallback } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import {
  MarketplaceProductCard,
  MarketplaceCatalog,
  MarketplaceCart,
  MarketplaceProductDetail,
  MarketplaceCheckout
} from '@/components/Marketplace';

// Mock data for products
const mockProducts = [
  {
    id: '1',
    name: 'Kit Completo de Templates para Redes Sociais',
    slug: 'kit-templates-redes-sociais',
    price: 9700,
    compareAtPrice: 14900,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=600&fit=crop'
    ],
    shortDescription: 'Mais de 200 templates editáveis para Instagram, Facebook e LinkedIn.',
    stockQuantity: 100,
    status: 'active' as const,
    productType: 'digital' as const,
    rating: 4.8,
    reviewCount: 124,
    salesCount: 1850,
    isFeatured: true,
    tags: ['templates', 'redes-sociais', 'marketing']
  },
  {
    id: '2',
    name: 'E-book: Guia Completo de Marketing Digital',
    slug: 'ebook-marketing-digital',
    price: 4700,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    shortDescription: 'Aprenda estratégias comprovadas para vender mais online.',
    stockQuantity: 50,
    status: 'active' as const,
    productType: 'digital' as const,
    rating: 4.9,
    reviewCount: 89,
    salesCount: 2100,
    isFeatured: true,
    tags: ['ebook', 'marketing', 'vendas']
  },
  {
    id: '3',
    name: 'Consultoria Estratégica de 2 Horas',
    slug: 'consultoria-estrategica',
    price: 49700,
    thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    shortDescription: 'Sessão individual para revisar sua estratégia de marketing.',
    stockQuantity: 10,
    status: 'active' as const,
    productType: 'service' as const,
    rating: 5.0,
    reviewCount: 45,
    salesCount: 320,
    tags: ['consultoria', 'estrategia']
  },
  {
    id: '4',
    name: 'Assinatura Mensal - Acesso VIP',
    slug: 'assinatura-vip-mensal',
    price: 99700,
    compareAtPrice: 14900,
    thumbnailUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop',
    shortDescription: 'Acesso ilimitado a todos os produtos e novos lançamentos.',
    stockQuantity: 999,
    status: 'active' as const,
    productType: 'subscription' as const,
    rating: 4.7,
    reviewCount: 203,
    salesCount: 4500,
    isFeatured: true,
    tags: ['assinatura', 'vip', 'acesso']
  },
  {
    id: '5',
    name: 'Curso de Tráfego Pago do Zero',
    slug: 'curso-trafego-pago',
    price: 99700,
    thumbnailUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop',
    shortDescription: 'Aprenda Facebook Ads, Google Ads e LinkedIn Ads.',
    stockQuantity: 5,
    status: 'active' as const,
    productType: 'digital' as const,
    rating: 4.9,
    reviewCount: 567,
    salesCount: 8900,
    tags: ['curso', 'trafego', 'ads']
  },
  {
    id: '6',
    name: 'Camiseta Premium - Nexus Hub',
    slug: 'camiseta-nexus-hub',
    price: 8900,
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572163474-6866f9c0e5c8?w=400&h=300&fit=crop',
    shortDescription: 'Camiseta 100% algodão com estampa exclusiva.',
    stockQuantity: 0,
    status: 'out_of_stock' as const,
    productType: 'physical' as const,
    rating: 4.5,
    reviewCount: 28,
    salesCount: 156,
    tags: ['camiseta', 'merchandise', 'fisico']
  }
];

const mockCategories = [
  { id: 'cat-1', name: 'Templates', slug: 'templates' },
  { id: 'cat-2', name: 'E-books', slug: 'ebooks' },
  { id: 'cat-3', name: 'Cursos', slug: 'cursos' },
  { id: 'cat-4', name: 'Consultoria', slug: 'consultoria' },
  { id: 'cat-5', name: 'Assinaturas', slug: 'assinaturas' },
  { id: 'cat-6', name: 'Produtos Físicos', slug: 'fisicos' }
];

const mockReviews = [
  {
    id: 'rev-1',
    userId: 'user-1',
    userName: 'Maria Silva',
    rating: 5,
    comment: 'Excelente produto! Superou minhas expectativas. Recomendo a todos.',
    createdAt: '2024-01-15T10:30:00Z',
    verified: true
  },
  {
    id: 'rev-2',
    userId: 'user-2',
    userName: 'João Santos',
    rating: 4,
    comment: 'Muito bom, mas poderia ter mais opções de cores.',
    createdAt: '2024-01-10T14:20:00Z',
    verified: true
  }
];

type ViewMode = 'catalog' | 'cart' | 'detail' | 'checkout';
type SortMode = 'grid' | 'list';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  thumbnailUrl?: string;
  quantity: number;
  maxQuantity: number;
  productType: 'digital' | 'physical' | 'service' | 'subscription';
}

export default function Marketplaces() {
  const [currentView, setCurrentView] = useState<ViewMode>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<SortMode>('grid');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Cart calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discount > 0 ? Math.round(subtotal * (discount / 100)) : 0;
  const shipping = 0; // Free shipping
  const total = subtotal - discountAmount;

  const handleProductClick = useCallback((product: typeof mockProducts[0]) => {
    setSelectedProduct(product);
    setCurrentView('detail');
  }, []);

  const handleAddToCart = useCallback((product: typeof mockProducts[0], quantity: number = 1, _variations?: Record<string, string>) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQuantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          thumbnailUrl: product.thumbnailUrl,
          quantity: quantity,
          maxQuantity: product.stockQuantity,
          productType: product.productType
        }
      ];
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.min(quantity, item.maxQuantity) } : item
      )
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCouponCode('');
    setDiscount(0);
  }, []);

  const handleApplyCoupon = useCallback((code: string) => {
    if (code.toUpperCase() === 'DESCONTO10') {
      setCouponCode(code);
      setDiscount(10);
    } else if (code.toUpperCase() === 'PROMO20') {
      setCouponCode(code);
      setDiscount(20);
    } else {
      alert('Cupom inválido');
    }
  }, []);

  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    setDiscount(0);
  }, []);

  const handleCheckout = useCallback(() => {
    setCurrentView('checkout');
  }, []);

  const handleBack = useCallback(() => {
    if (currentView === 'detail') {
      setCurrentView('catalog');
      setSelectedProduct(null);
    } else if (currentView === 'checkout') {
      setCurrentView('cart');
    }
  }, [currentView]);

  const handlePlaceOrder = useCallback((_data: any) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCartItems([]);
      setCouponCode('');
      setDiscount(0);
      setCurrentView('catalog');
      alert('Pedido realizado com sucesso!');
    }, 2000);
  }, []);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-surface-secondary border-b border-border-color sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Marketplace Nexus</h1>
              <p className="text-sm text-text-secondary">Plataforma de Afiliados</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <button
                onClick={() => setCurrentView('cart')}
                className="relative flex items-center gap-2 px-4 py-2 bg-surface-tertiary rounded-lg hover:bg-accent-cyan/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Carrinho</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-cyan rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {currentView === 'catalog' && (
            <MarketplaceCatalog
              products={mockProducts}
              categories={mockCategories}
              isLoading={isLoading}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              viewMode={viewMode}
              onViewModeChange={(mode) => setViewMode(mode as SortMode)}
            />
          )}

          {currentView === 'detail' && selectedProduct && (
            <MarketplaceProductDetail
              product={selectedProduct}
              reviews={mockReviews}
              onAddToCart={(product, quantity, variations) => {
                handleAddToCart(product, quantity, variations);
                setCurrentView('cart');
              }}
              onAddToWishlist={() => console.log('Added to wishlist')}
              onBack={() => handleBack()}
            />
          )}

          {currentView === 'cart' && (
            <MarketplaceCart
              items={cartItems.map(item => ({
                ...item,
                isDigital: item.productType === 'digital'
              }))}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              onContinueShopping={() => setCurrentView('catalog')}
              couponCode={couponCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              discount={discount}
            />
          )}

          {currentView === 'checkout' && (
            <MarketplaceCheckout
              items={cartItems}
              subtotal={subtotal}
              discount={discountAmount}
              shipping={shipping}
              total={total}
              couponCode={couponCode}
              onApplyCoupon={handleApplyCoupon}
              onPlaceOrder={handlePlaceOrder}
              onBack={() => handleBack()}
              onContinueShopping={() => setCurrentView('catalog')}
              isProcessing={isLoading}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}