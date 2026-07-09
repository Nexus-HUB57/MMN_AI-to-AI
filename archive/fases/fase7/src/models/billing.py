"""
Modelos de Billing e Pagamentos

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 4 Billing Integration
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum


class BillingCycle(str, Enum):
    """Ciclo de cobrança"""
    MONTHLY = "monthly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"


class SubscriptionStatus(str, Enum):
    """Status da assinatura"""
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    EXPIRED = "expired"


class PaymentStatus(str, Enum):
    """Status do pagamento"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class PaymentMethod(str, Enum):
    """Método de pagamento"""
    CREDIT_CARD = "credit_card"
    PIX = "pix"
    BOLETO = "boleto"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"


class Provider(str, Enum):
    """Provedor de pagamento"""
    STRIPE = "stripe"
    PAGARME = "pagarme"
    INTERNAL = "internal"


# ==================== SUBSCRIPTION MODELS ====================

class Subscription(BaseModel):
    """Modelo de assinatura"""
    id: str = Field(default_factory=lambda: f"sub_{uuid.uuid4().hex[:16]}")
    instance_id: str
    plan_id: str
    status: SubscriptionStatus = SubscriptionStatus.TRIAL
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    current_period_start: datetime = Field(default_factory=datetime.utcnow)
    current_period_end: datetime
    cancel_at_period_end: bool = False
    canceled_at: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    provider: Provider = Provider.INTERNAL
    provider_subscription_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def __init__(self, **data):
        super().__init__(**data)
        # Set default period end based on billing cycle
        if self.billing_cycle == BillingCycle.MONTHLY:
            self.current_period_end = self.current_period_start + timedelta(days=30)
        elif self.billing_cycle == BillingCycle.YEARLY:
            self.current_period_end = self.current_period_start + timedelta(days=365)
        else:  # lifetime
            self.current_period_end = datetime(2099, 12, 31)

    @property
    def is_active(self) -> bool:
        """Verifica se assinatura está ativa"""
        return self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]

    @property
    def days_until_expiration(self) -> int:
        """Dias até expiração"""
        delta = self.current_period_end - datetime.utcnow()
        return max(0, delta.days)

    def renew(self) -> None:
        """Renova assinatura para próximo período"""
        if self.billing_cycle == BillingCycle.MONTHLY:
            self.current_period_start = self.current_period_end
            self.current_period_end = self.current_period_start + timedelta(days=30)
        elif self.billing_cycle == BillingCycle.YEARLY:
            self.current_period_start = self.current_period_end
            self.current_period_end = self.current_period_start + timedelta(days=365)
        self.updated_at = datetime.utcnow()


class SubscriptionCreateRequest(BaseModel):
    """Request para criar assinatura"""
    instance_id: str
    plan_id: str
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    payment_method: PaymentMethod = PaymentMethod.CREDIT_CARD
    coupon_code: Optional[str] = None
    trial_days: int = Field(14, ge=0, le=90, description="Dias de trial")


class SubscriptionUpdateRequest(BaseModel):
    """Request para atualizar assinatura"""
    plan_id: Optional[str] = None
    billing_cycle: Optional[BillingCycle] = None
    cancel_at_period_end: Optional[bool] = None


# ==================== PAYMENT MODELS ====================

class Payment(BaseModel):
    """Modelo de pagamento"""
    id: str = Field(default_factory=lambda: f"pay_{uuid.uuid4().hex[:16]}")
    subscription_id: str
    instance_id: str
    amount: float = Field(..., gt=0, description="Valor em centavos")
    currency: str = Field("BRL", max_length=3)
    status: PaymentStatus = PaymentStatus.PENDING
    payment_method: PaymentMethod
    provider: Provider = Provider.INTERNAL
    provider_payment_id: Optional[str] = None
    description: Optional[str] = None
    receipt_url: Optional[str] = None
    failed_reason: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

    @property
    def amount_formatted(self) -> str:
        """Valor formatado"""
        return f"R$ {self.amount:.2f}" if self.currency == "BRL" else f"{self.amount:.2f} {self.currency}"

    @property
    def is_successful(self) -> bool:
        """Verifica se pagamento foi bem-sucedido"""
        return self.status == PaymentStatus.COMPLETED


class PaymentCreateRequest(BaseModel):
    """Request para criar pagamento"""
    subscription_id: str
    amount: float
    payment_method: PaymentMethod
    card_token: Optional[str] = None  # For Stripe
    pix_expiration: Optional[int] = Field(3600, ge=300, le=86400)  # 5min to 24h


class PaymentMethodInfo(BaseModel):
    """Informações do método de pagamento"""
    type: PaymentMethod
    last4: Optional[str] = None
    brand: Optional[str] = None  # visa, mastercard, etc
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    is_default: bool = False


class SavedPaymentMethod(BaseModel):
    """Método de pagamento salvo"""
    id: str = Field(default_factory=lambda: f"pm_{uuid.uuid4().hex[:16]}")
    instance_id: str
    payment_method: PaymentMethod
    provider: Provider
    provider_payment_method_id: str
    card_brand: Optional[str] = None
    last4: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== INVOICE MODELS ====================

class Invoice(BaseModel):
    """Modelo de fatura"""
    id: str = Field(default_factory=lambda: f"inv_{uuid.uuid4().hex[:16]}")
    subscription_id: str
    instance_id: str
    invoice_number: str
    amount: float = Field(..., gt=0)
    currency: str = Field("BRL", max_length=3)
    status: str = Field("draft", description="draft, open, paid, void, uncollectible")
    due_date: datetime
    paid_at: Optional[datetime] = None
    items: List[Dict[str, Any]] = Field(default_factory=list)
    pdf_url: Optional[str] = None
    provider_invoice_id: Optional[str] = None
    notes: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def is_paid(self) -> bool:
        """Verifica se fatura foi paga"""
        return self.status == "paid"

    @property
    def is_overdue(self) -> bool:
        """Verifica se fatura está atrasada"""
        return not self.is_paid and self.due_date < datetime.utcnow()


class InvoiceItem(BaseModel):
    """Item de fatura"""
    description: str
    amount: float
    quantity: int = 1
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


# ==================== COUPON MODELS ====================

class CouponType(str, Enum):
    """Tipo de cupom"""
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    TRIAL_EXTENSION = "trial_extension"


class Coupon(BaseModel):
    """Modelo de cupom de desconto"""
    id: str = Field(default_factory=lambda: f"cpn_{uuid.uuid4().hex[:16]}")
    code: str
    coupon_type: CouponType
    value: float = Field(..., description="Percentual (0-100) ou valor fixo")
    currency: Optional[str] = Field("BRL", max_length=3)  # Only for fixed type
    max_redemptions: int = Field(-1, description="-1 para ilimitado")
    current_redemptions: int = 0
    valid_from: datetime = Field(default_factory=datetime.utcnow)
    valid_until: Optional[datetime] = None
    applicable_plans: List[str] = Field(default_factory=list, description="Plan IDs ou empty para todos")
    applicable_instances: List[str] = Field(default_factory=list)
    is_active: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def is_valid(self) -> bool:
        """Verifica se cupom é válido"""
        if not self.is_active:
            return False
        if self.max_redemptions > 0 and self.current_redemptions >= self.max_redemptions:
            return False
        if self.valid_until and datetime.utcnow() > self.valid_until:
            return False
        return True

    def apply_discount(self, amount: float) -> float:
        """Aplica desconto ao valor"""
        if self.coupon_type == CouponType.PERCENTAGE:
            return amount * (1 - self.value / 100)
        elif self.coupon_type == CouponType.FIXED:
            return max(0, amount - self.value)
        return amount


# ==================== PRICING MODELS ====================

class PlanPricing(BaseModel):
    """Preços de um plano"""
    monthly: float = Field(..., ge=0)
    yearly: float = Field(..., ge=0)
    currency: str = Field("BRL", max_length=3)

    @property
    def yearly_monthly_equivalent(self) -> float:
        """Preço yearly convertido para mensal"""
        return self.yearly / 12

    @property
    def yearly_savings(self) -> float:
        """Economia do plano yearly vs monthly (em %%)"""
        monthly_total = self.monthly * 12
        return ((monthly_total - self.yearly) / monthly_total) * 100 if monthly_total > 0 else 0


class PricePreview(BaseModel):
    """Preview de preço com descontos aplicados"""
    plan_id: str
    original_amount: float
    discount_amount: float = 0
    discount_description: Optional[str] = None
    final_amount: float
    billing_cycle: BillingCycle
    currency: str = "BRL"
    coupon_applied: Optional[str] = None


# ==================== UPGRADE/DOWNGRADE MODELS ====================

class PlanChange(BaseModel):
    """Modelo de mudança de plano"""
    instance_id: str
    current_plan_id: str
    new_plan_id: str
    change_type: str = Field(..., description="upgrade, downgrade")
    effective_date: datetime
    prorated_amount: float = 0
    description: str = ""


class UpgradeDowngradeRequest(BaseModel):
    """Request para upgrade/downgrade"""
    new_plan_id: str
    immediate: bool = Field(True, description="Aplicar imediatamente ou no fim do período")
    proration: bool = Field(True, description="Calcular proração")


class UpgradeDowngradeResponse(BaseModel):
    """Response de upgrade/downgrade"""
    subscription_id: str
    change_type: str
    current_plan: str
    new_plan: str
    effective_date: datetime
    proration_amount: float
    next_billing_amount: float
    change_summary: str


# ==================== WEBHOOK MODELS ====================

class BillingWebhookEvent(BaseModel):
    """Evento de webhook de billing"""
    id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:16]}")
    event_type: str = Field(..., description="payment.succeeded, subscription.updated, etc")
    provider: Provider
    provider_event_id: str
    data: Dict[str, Any]
    processed: bool = False
    processed_at: Optional[datetime] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== BILLING SUMMARY ====================

class BillingSummary(BaseModel):
    """Resumo de billing da instância"""
    instance_id: str
    subscription: Optional[Subscription]
    current_plan_id: Optional[str]
    current_period: Optional[Dict[str, str]] = None
    next_payment: Optional[Dict[str, Any]] = None
    payment_methods: List[SavedPaymentMethod] = Field(default_factory=list)
    recent_invoices: List[Invoice] = Field(default_factory=list)
    outstanding_balance: float = 0
    payment_status: str = "active"


class UsageMetrics(BaseModel):
    """Métricas de uso para billing"""
    instance_id: str
    period_start: datetime
    period_end: datetime
    users_count: int = 0
    domains_count: int = 0
    api_calls: int = 0
    storage_used_gb: float = 0
    bandwidth_used_gb: float = 0
    overage_charges: float = 0
    estimated_amount: float = 0