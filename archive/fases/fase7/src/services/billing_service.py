"""
Serviço de Gerenciamento de Billing e Pagamentos

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 4 Billing Integration
"""

import uuid
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from decimal import Decimal

from ..models.billing import (
    Subscription, SubscriptionStatus, BillingCycle,
    Payment, PaymentStatus, PaymentMethod,
    Invoice, InvoiceItem,
    Coupon, CouponType, CouponType,
    Provider, SavedPaymentMethod, PaymentMethodInfo,
    UpgradeDowngradeRequest, UpgradeDowngradeResponse, PricePreview,
    UsageMetrics, BillingSummary
)
from ..models.plan import Plan, PlanFeatures

logger = logging.getLogger(__name__)


class BillingService:
    """Serviço para gerenciamento completo de billing"""

    # Plan prices (would come from config in production)
    PLAN_PRICES = {
        "starter": {"monthly": 49.90, "yearly": 479.00},
        "professional": {"monthly": 149.90, "yearly": 1439.00},
        "business": {"monthly": 349.90, "yearly": 3359.00},
        "enterprise": {"monthly": 999.90, "yearly": 9599.00}
    }

    def __init__(self):
        self._subscriptions: Dict[str, Subscription] = {}
        self._payments: Dict[str, Payment] = {}
        self._invoices: Dict[str, Invoice] = {}
        self._coupons: Dict[str, Coupon] = {}
        self._payment_methods: Dict[str, List[SavedPaymentMethod]] = {}
        self._invoice_counter = 0

    # ==================== SUBSCRIPTION METHODS ====================

    def create_subscription(
        self,
        instance_id: str,
        plan_id: str,
        billing_cycle: BillingCycle = BillingCycle.MONTHLY,
        trial_days: int = 14
    ) -> Subscription:
        """Cria nova assinatura para instância"""
        subscription_id = f"sub_{uuid.uuid4().hex[:16]}"

        # Calculate trial end and period
        now = datetime.utcnow()
        trial_end = now + timedelta(days=trial_days) if trial_days > 0 else None

        period_start = trial_end if trial_days > 0 else now
        if billing_cycle == BillingCycle.MONTHLY:
            period_end = period_start + timedelta(days=30)
        elif billing_cycle == BillingCycle.YEARLY:
            period_end = period_start + timedelta(days=365)
        else:
            period_end = datetime(2099, 12, 31)

        subscription = Subscription(
            id=subscription_id,
            instance_id=instance_id,
            plan_id=plan_id,
            status=SubscriptionStatus.TRIAL if trial_days > 0 else SubscriptionStatus.ACTIVE,
            billing_cycle=billing_cycle,
            current_period_start=period_start,
            current_period_end=period_end,
            trial_end=trial_end,
            provider=Provider.INTERNAL
        )

        self._subscriptions[subscription_id] = subscription
        logger.info(f"Subscription created: {subscription_id} for instance {instance_id}")

        return subscription

    def get_subscription(self, subscription_id: str) -> Optional[Subscription]:
        """Obtém assinatura por ID"""
        return self._subscriptions.get(subscription_id)

    def get_subscription_by_instance(self, instance_id: str) -> Optional[Subscription]:
        """Obtém assinatura ativa de uma instância"""
        for sub in self._subscriptions.values():
            if sub.instance_id == instance_id and sub.is_active:
                return sub
        return None

    def get_all_subscriptions(self, instance_id: Optional[str] = None) -> List[Subscription]:
        """Lista todas as assinaturas, opcionalmente filtradas por instância"""
        subs = list(self._subscriptions.values())
        if instance_id:
            subs = [s for s in subs if s.instance_id == instance_id]
        return subs

    def update_subscription(
        self,
        subscription_id: str,
        plan_id: Optional[str] = None,
        billing_cycle: Optional[BillingCycle] = None
    ) -> Optional[Subscription]:
        """Atualiza assinatura (upgrade/downgrade)"""
        subscription = self._subscriptions.get(subscription_id)
        if not subscription:
            return None

        if plan_id:
            subscription.plan_id = plan_id
        if billing_cycle:
            subscription.billing_cycle = billing_cycle
            if billing_cycle == BillingCycle.MONTHLY:
                subscription.current_period_end = subscription.current_period_start + timedelta(days=30)
            elif billing_cycle == BillingCycle.YEARLY:
                subscription.current_period_end = subscription.current_period_start + timedelta(days=365)

        subscription.updated_at = datetime.utcnow()
        logger.info(f"Subscription updated: {subscription_id}")

        return subscription

    def cancel_subscription(
        self,
        subscription_id: str,
        immediate: bool = False
    ) -> Optional[Subscription]:
        """Cancela assinatura"""
        subscription = self._subscriptions.get(subscription_id)
        if not subscription:
            return None

        if immediate:
            subscription.status = SubscriptionStatus.CANCELED
            subscription.canceled_at = datetime.utcnow()
        else:
            subscription.cancel_at_period_end = True

        subscription.updated_at = datetime.utcnow()
        logger.info(f"Subscription canceled: {subscription_id}, immediate={immediate}")

        return subscription

    def reactivate_subscription(self, subscription_id: str) -> Optional[Subscription]:
        """Reativa assinatura cancelada"""
        subscription = self._subscriptions.get(subscription_id)
        if not subscription:
            return None

        subscription.status = SubscriptionStatus.ACTIVE
        subscription.cancel_at_period_end = False
        subscription.canceled_at = None
        subscription.updated_at = datetime.utcnow()

        logger.info(f"Subscription reactivated: {subscription_id}")
        return subscription

    def change_plan(
        self,
        instance_id: str,
        new_plan_id: str,
        immediate: bool = True
    ) -> Optional[UpgradeDowngradeResponse]:
        """Realiza upgrade ou downgrade de plano"""
        subscription = self.get_subscription_by_instance(instance_id)
        if not subscription:
            return None

        current_plan_id = subscription.plan_id
        current_prices = self.PLAN_PRICES.get(current_plan_id, {})
        new_prices = self.PLAN_PRICES.get(new_plan_id, {})

        # Determine change type
        change_type = "upgrade" if self._compare_plans(current_plan_id, new_plan_id) > 0 else "downgrade"

        # Calculate proration
        prorated_amount = 0
        if immediate and change_type == "downgrade":
            current_price = current_prices.get("monthly", 0)
            new_price = new_prices.get("monthly", 0)
            days_remaining = subscription.days_until_expiration
            daily_rate = (current_price - new_price) / 30
            prorated_amount = max(0, daily_rate * days_remaining)

        # Apply change
        subscription.plan_id = new_plan_id
        subscription.updated_at = datetime.utcnow()

        return UpgradeDowngradeResponse(
            subscription_id=subscription.id,
            change_type=change_type,
            current_plan=current_plan_id,
            new_plan=new_plan_id,
            effective_date=datetime.utcnow() if immediate else subscription.current_period_end,
            proration_amount=prorated_amount,
            next_billing_amount=new_prices.get("monthly", 0),
            change_summary=f"{change_type.title()} de {current_plan_id} para {new_plan_id}"
        )

    def _compare_plans(self, plan1: str, plan2: str) -> int:
        """Compara dois planos (-1 if plan1 < plan2, 0 if equal, 1 if plan1 > plan2)"""
        plan_order = ["starter", "professional", "business", "enterprise"]
        try:
            p1_idx = plan_order.index(plan1) if plan1 in plan_order else 0
            p2_idx = plan_order.index(plan2) if plan2 in plan_order else 0
            return p1_idx - p2_idx
        except ValueError:
            return 0

    # ==================== PAYMENT METHODS ====================

    def add_payment_method(
        self,
        instance_id: str,
        payment_method: PaymentMethod,
        provider: Provider,
        provider_id: str,
        card_brand: Optional[str] = None,
        last4: Optional[str] = None,
        is_default: bool = True
    ) -> SavedPaymentMethod:
        """Adiciona método de pagamento para instância"""
        if instance_id not in self._payment_methods:
            self._payment_methods[instance_id] = []

        # If setting as default, unset others
        if is_default:
            for pm in self._payment_methods[instance_id]:
                pm.is_default = False

        method = SavedPaymentMethod(
            payment_method=payment_method,
            provider=provider,
            provider_payment_method_id=provider_id,
            card_brand=card_brand,
            last4=last4,
            is_default=is_default
        )

        self._payment_methods[instance_id].append(method)
        logger.info(f"Payment method added for instance {instance_id}")

        return method

    def get_payment_methods(self, instance_id: str) -> List[SavedPaymentMethod]:
        """Lista métodos de pagamento da instância"""
        return self._payment_methods.get(instance_id, [])

    def get_default_payment_method(self, instance_id: str) -> Optional[SavedPaymentMethod]:
        """Obtém método de pagamento padrão"""
        methods = self._payment_methods.get(instance_id, [])
        for method in methods:
            if method.is_default:
                return method
        return methods[0] if methods else None

    def remove_payment_method(self, instance_id: str, method_id: str) -> bool:
        """Remove método de pagamento"""
        methods = self._payment_methods.get(instance_id, [])
        for i, method in enumerate(methods):
            if method.id == method_id:
                methods.pop(i)
                logger.info(f"Payment method removed: {method_id}")
                return True
        return False

    # ==================== PAYMENT METHODS ====================

    def create_payment(
        self,
        subscription_id: str,
        amount: float,
        payment_method: PaymentMethod,
        description: Optional[str] = None
    ) -> Payment:
        """Cria novo pagamento"""
        subscription = self.get_subscription(subscription_id)
        if not subscription:
            raise ValueError("Subscription not found")

        payment_id = f"pay_{uuid.uuid4().hex[:16]}"

        payment = Payment(
            id=payment_id,
            subscription_id=subscription_id,
            instance_id=subscription.instance_id,
            amount=amount,
            payment_method=payment_method,
            description=description or f"Payment for {subscription.plan_id} plan"
        )

        self._payments[payment_id] = payment
        logger.info(f"Payment created: {payment_id}, amount: {amount}")

        return payment

    def process_payment(self, payment_id: str) -> Optional[Payment]:
        """Processa pagamento (simula gateway)"""
        payment = self._payments.get(payment_id)
        if not payment:
            return None

        payment.status = PaymentStatus.PROCESSING

        # Simulate payment processing
        # In production, this would call Stripe/Pagarme API
        payment.status = PaymentStatus.COMPLETED
        payment.processed_at = datetime.utcnow()
        payment.provider_payment_id = f"pi_{uuid.uuid4().hex[:24]}"

        logger.info(f"Payment processed: {payment_id}")

        return payment

    def refund_payment(self, payment_id: str, reason: Optional[str] = None) -> Optional[Payment]:
        """Estorna pagamento"""
        payment = self._payments.get(payment_id)
        if not payment or not payment.is_successful:
            return None

        payment.status = PaymentStatus.REFUNDED
        payment.metadata["refund_reason"] = reason
        payment.metadata["refunded_at"] = datetime.utcnow().isoformat()

        logger.info(f"Payment refunded: {payment_id}")

        return payment

    def get_payment(self, payment_id: str) -> Optional[Payment]:
        """Obtém pagamento por ID"""
        return self._payments.get(payment_id)

    def get_payments_by_instance(self, instance_id: str) -> List[Payment]:
        """Lista pagamentos de uma instância"""
        return [
            p for p in self._payments.values()
            if p.instance_id == instance_id
        ]

    # ==================== INVOICE METHODS ====================

    def create_invoice(
        self,
        subscription_id: str,
        items: List[Dict[str, Any]],
        due_date: Optional[datetime] = None
    ) -> Invoice:
        """Cria nova fatura"""
        subscription = self.get_subscription(subscription_id)
        if not subscription:
            raise ValueError("Subscription not found")

        self._invoice_counter += 1
        invoice_id = f"inv_{uuid.uuid4().hex[:16]}"
        invoice_number = f"INV-{datetime.utcnow().year}-{self._invoice_counter:06d}"

        total_amount = sum(item.get("amount", 0) for item in items)

        invoice = Invoice(
            id=invoice_id,
            subscription_id=subscription_id,
            instance_id=subscription.instance_id,
            invoice_number=invoice_number,
            amount=total_amount,
            due_date=due_date or (datetime.utcnow() + timedelta(days=7)),
            items=items,
            status="open"
        )

        self._invoices[invoice_id] = invoice
        logger.info(f"Invoice created: {invoice_number}, amount: {total_amount}")

        return invoice

    def generate_subscription_invoice(self, subscription_id: str) -> Optional[Invoice]:
        """Gera fatura para assinatura"""
        subscription = self.get_subscription(subscription_id)
        if not subscription:
            return None

        plan_prices = self.PLAN_PRICES.get(subscription.plan_id, {})
        amount = plan_prices.get("monthly" if subscription.billing_cycle == BillingCycle.MONTHLY else "yearly", 0)

        items = [{
            "description": f"{subscription.plan_id.title()} Plan - {subscription.billing_cycle.value}",
            "amount": amount,
            "quantity": 1,
            "period_start": subscription.current_period_start.isoformat(),
            "period_end": subscription.current_period_end.isoformat()
        }]

        return self.create_invoice(subscription_id, items)

    def get_invoice(self, invoice_id: str) -> Optional[Invoice]:
        """Obtém fatura por ID"""
        return self._invoices.get(invoice_id)

    def get_invoices_by_instance(self, instance_id: str) -> List[Invoice]:
        """Lista faturas de uma instância"""
        return sorted(
            [inv for inv in self._invoices.values() if inv.instance_id == instance_id],
            key=lambda x: x.created_at,
            reverse=True
        )

    def mark_invoice_paid(self, invoice_id: str) -> Optional[Invoice]:
        """Marca fatura como paga"""
        invoice = self._invoices.get(invoice_id)
        if not invoice:
            return None

        invoice.status = "paid"
        invoice.paid_at = datetime.utcnow()
        logger.info(f"Invoice marked as paid: {invoice.invoice_number}")

        return invoice

    # ==================== COUPON METHODS ====================

    def create_coupon(
        self,
        code: str,
        coupon_type: CouponType,
        value: float,
        max_redemptions: int = -1,
        valid_days: Optional[int] = None
    ) -> Coupon:
        """Cria novo cupom"""
        coupon_id = f"cpn_{uuid.uuid4().hex[:16]}"

        coupon = Coupon(
            id=coupon_id,
            code=code,
            coupon_type=coupon_type,
            value=value,
            max_redemptions=max_redemptions,
            valid_until=datetime.utcnow() + timedelta(days=valid_days) if valid_days else None
        )

        self._coupons[code] = coupon
        logger.info(f"Coupon created: {code}")

        return coupon

    def validate_coupon(self, code: str, instance_id: Optional[str] = None, plan_id: Optional[str] = None) -> Optional[Coupon]:
        """Valida cupom para uso"""
        coupon = self._coupons.get(code)
        if not coupon:
            return None

        if not coupon.is_valid:
            return None

        # Check plan applicability
        if coupon.applicable_plans and plan_id not in coupon.applicable_plans:
            return None

        # Check instance applicability
        if coupon.applicable_instances and instance_id not in coupon.applicable_instances:
            return None

        return coupon

    def apply_coupon(self, code: str, instance_id: str, plan_id: str) -> Optional[float]:
        """Aplica cupom e retorna desconto"""
        coupon = self.validate_coupon(code, instance_id, plan_id)
        if not coupon:
            return None

        plan_prices = self.PLAN_PRICES.get(plan_id, {})
        amount = plan_prices.get("monthly", 0)

        discounted = coupon.apply_discount(amount)
        discount = amount - discounted

        # Increment redemption
        coupon.current_redemptions += 1

        logger.info(f"Coupon applied: {code}, discount: {discount}")

        return discount

    # ==================== PRICING METHODS ====================

    def get_plan_price(self, plan_id: str, billing_cycle: BillingCycle) -> Optional[float]:
        """Obtém preço de plano"""
        prices = self.PLAN_PRICES.get(plan_id, {})
        if billing_cycle == BillingCycle.MONTHLY:
            return prices.get("monthly")
        elif billing_cycle == BillingCycle.YEARLY:
            return prices.get("yearly")
        return None

    def preview_price(
        self,
        plan_id: str,
        billing_cycle: BillingCycle,
        coupon_code: Optional[str] = None,
        instance_id: Optional[str] = None
    ) -> PricePreview:
        """Gera preview de preço com descontos"""
        original_amount = self.get_plan_price(plan_id, billing_cycle) or 0

        discount_amount = 0
        discount_description = None
        applied_coupon = None

        if coupon_code:
            coupon = self.validate_coupon(coupon_code, instance_id, plan_id)
            if coupon:
                discount_amount = original_amount - coupon.apply_discount(original_amount)
                discount_description = f"{coupon.value}% off" if coupon.coupon_type == CouponType.PERCENTAGE else f"R$ {coupon.value} off"
                applied_coupon = coupon_code

        return PricePreview(
            plan_id=plan_id,
            original_amount=original_amount,
            discount_amount=discount_amount,
            discount_description=discount_description,
            final_amount=original_amount - discount_amount,
            billing_cycle=billing_cycle,
            coupon_applied=applied_coupon
        )

    # ==================== BILLING SUMMARY ====================

    def get_billing_summary(self, instance_id: str) -> BillingSummary:
        """Obtém resumo completo de billing da instância"""
        subscription = self.get_subscription_by_instance(instance_id)

        payment_methods = self.get_payment_methods(instance_id)
        invoices = self.get_invoices_by_instance(instance_id)[:5]  # Last 5 invoices

        outstanding = sum(
            inv.amount for inv in invoices
            if not inv.is_paid and inv.is_overdue
        )

        next_payment = None
        current_plan = None

        if subscription:
            current_plan = subscription.plan_id
            next_payment = {
                "amount": self.get_plan_price(subscription.plan_id, subscription.billing_cycle) or 0,
                "due_date": subscription.current_period_end.isoformat()
            }

        return BillingSummary(
            instance_id=instance_id,
            subscription=subscription,
            current_plan_id=current_plan,
            current_period={
                "start": subscription.current_period_start.isoformat() if subscription else None,
                "end": subscription.current_period_end.isoformat() if subscription else None
            } if subscription else None,
            next_payment=next_payment,
            payment_methods=payment_methods,
            recent_invoices=invoices,
            outstanding_balance=outstanding,
            payment_status=subscription.status.value if subscription else "no_subscription"
        )

    # ==================== USAGE & METRICS ====================

    def get_usage_metrics(
        self,
        instance_id: str,
        period_start: datetime,
        period_end: datetime
    ) -> UsageMetrics:
        """Obtém métricas de uso para período"""
        # In production, this would come from actual usage tracking
        metrics = UsageMetrics(
            instance_id=instance_id,
            period_start=period_start,
            period_end=period_end,
            users_count=0,
            domains_count=0,
            api_calls=0,
            storage_used_gb=0,
            bandwidth_used_gb=0,
            overage_charges=0,
            estimated_amount=0
        )

        subscription = self.get_subscription_by_instance(instance_id)
        if subscription:
            base_price = self.get_plan_price(subscription.plan_id, subscription.billing_cycle) or 0
            metrics.estimated_amount = base_price

        return metrics

    # ==================== WEBHOOK HANDLING ====================

    def handle_webhook(self, event_data: Dict[str, Any], provider: Provider) -> bool:
        """Processa webhook de gateway de pagamento"""
        event_type = event_data.get("type", "")

        try:
            if event_type.startswith("payment."):
                return self._handle_payment_webhook(event_data, provider)
            elif event_type.startswith("subscription."):
                return self._handle_subscription_webhook(event_data, provider)
            else:
                logger.warning(f"Unknown webhook event type: {event_type}")
                return False
        except Exception as e:
            logger.error(f"Webhook processing failed: {e}")
            return False

    def _handle_payment_webhook(self, event_data: Dict[str, Any], provider: Provider) -> bool:
        """Processa webhook de pagamento"""
        payment_intent_id = event_data.get("data", {}).get("object", {}).get("id")

        if event_type := event_data.get("type") == "payment_intent.succeeded":
            # Find and update payment
            for payment in self._payments.values():
                if payment.provider_payment_id == payment_intent_id:
                    payment.status = PaymentStatus.COMPLETED
                    payment.processed_at = datetime.utcnow()
                    logger.info(f"Payment confirmed via webhook: {payment.id}")
                    return True

        return False

    def _handle_subscription_webhook(self, event_data: Dict[str, Any], provider: Provider) -> bool:
        """Processa webhook de assinatura"""
        # Handle subscription events
        event_type = event_data.get("type", "")
        subscription_id = event_data.get("data", {}).get("object", {}).get("metadata", {}).get("subscription_id")

        if not subscription_id:
            return False

        subscription = self.get_subscription(subscription_id)
        if not subscription:
            return False

        if event_type == "customer.subscription.updated":
            subscription.updated_at = datetime.utcnow()
            logger.info(f"Subscription updated via webhook: {subscription_id}")
            return True
        elif event_type == "customer.subscription.deleted":
            subscription.status = SubscriptionStatus.CANCELED
            subscription.canceled_at = datetime.utcnow()
            logger.info(f"Subscription canceled via webhook: {subscription_id}")
            return True

        return False