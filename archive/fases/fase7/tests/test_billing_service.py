"""
Testes para Billing Service

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 4 Billing Integration
"""

import pytest
from datetime import datetime, timedelta

from fase7.src.services.billing_service import BillingService
from fase7.src.models.billing import (
    SubscriptionStatus, BillingCycle, PaymentMethod, PaymentStatus,
    CouponType, Provider, SubscriptionCreateRequest
)


class TestBillingService:
    """Suite de testes para BillingService"""

    @pytest.fixture
    def service(self):
        """Fixture que cria instância do serviço"""
        return BillingService()

    @pytest.fixture
    def instance_id(self):
        """ID de instância mock"""
        return "inst_test_billing_123"

    # ==================== SUBSCRIPTION TESTS ====================

    def test_create_subscription_success(self, service, instance_id):
        """Testa criação de assinatura"""
        subscription = service.create_subscription(
            instance_id=instance_id,
            plan_id="starter",
            billing_cycle=BillingCycle.MONTHLY,
            trial_days=14
        )

        assert subscription is not None
        assert subscription.instance_id == instance_id
        assert subscription.plan_id == "starter"
        assert subscription.status == SubscriptionStatus.TRIAL
        assert subscription.trial_end is not None

    def test_create_subscription_no_trial(self, service, instance_id):
        """Testa criação de assinatura sem trial"""
        subscription = service.create_subscription(
            instance_id=instance_id,
            plan_id="professional",
            billing_cycle=BillingCycle.MONTHLY,
            trial_days=0
        )

        assert subscription.status == SubscriptionStatus.ACTIVE

    def test_get_subscription(self, service, instance_id):
        """Testa busca de assinatura"""
        created = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)
        found = service.get_subscription(created.id)

        assert found is not None
        assert found.id == created.id

    def test_get_subscription_by_instance(self, service, instance_id):
        """Testa busca de assinatura por instância"""
        service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)

        subscription = service.get_subscription_by_instance(instance_id)

        assert subscription is not None
        assert subscription.instance_id == instance_id

    def test_get_all_subscriptions(self, service, instance_id):
        """Testa listagem de todas as assinaturas"""
        service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)
        service.create_subscription("other_instance", "professional", BillingCycle.YEARLY)

        all_subs = service.get_all_subscriptions()
        instance_subs = service.get_all_subscriptions(instance_id)

        assert len(all_subs) >= 2
        assert len(instance_subs) == 1
        assert instance_subs[0].instance_id == instance_id

    def test_update_subscription_plan(self, service, instance_id):
        """Testa atualização de plano da assinatura"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)

        updated = service.update_subscription(subscription.id, plan_id="professional")

        assert updated is not None
        assert updated.plan_id == "professional"

    def test_cancel_subscription_immediate(self, service, instance_id):
        """Testa cancelamento imediato"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)

        canceled = service.cancel_subscription(subscription.id, immediate=True)

        assert canceled is not None
        assert canceled.status == SubscriptionStatus.CANCELED
        assert canceled.canceled_at is not None

    def test_cancel_subscription_end_of_period(self, service, instance_id):
        """Testa cancelamento no fim do período"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)

        canceled = service.cancel_subscription(subscription.id, immediate=False)

        assert canceled is not None
        assert canceled.cancel_at_period_end is True
        assert canceled.status != SubscriptionStatus.CANCELED

    def test_reactivate_subscription(self, service, instance_id):
        """Testa reativação de assinatura"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)
        service.cancel_subscription(subscription.id, immediate=True)

        reactivated = service.reactivate_subscription(subscription.id)

        assert reactivated is not None
        assert reactivated.status == SubscriptionStatus.ACTIVE
        assert reactivated.canceled_at is None

    # ==================== PLAN CHANGE TESTS ====================

    def test_change_plan_upgrade(self, service, instance_id):
        """Testa upgrade de plano"""
        service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY)

        result = service.change_plan(instance_id, "professional", immediate=False)

        assert result is not None
        assert result.change_type == "upgrade"
        assert result.current_plan == "starter"
        assert result.new_plan == "professional"

    def test_change_plan_downgrade(self, service, instance_id):
        """Testa downgrade de plano"""
        service.create_subscription(instance_id, "business", BillingCycle.MONTHLY)

        result = service.change_plan(instance_id, "starter", immediate=True)

        assert result is not None
        assert result.change_type == "downgrade"
        assert result.proration_amount >= 0

    # ==================== PAYMENT METHOD TESTS ====================

    def test_add_payment_method(self, service, instance_id):
        """Testa adição de método de pagamento"""
        method = service.add_payment_method(
            instance_id=instance_id,
            payment_method=PaymentMethod.CREDIT_CARD,
            provider=Provider.STRIPE,
            provider_id="pm_test123",
            card_brand="visa",
            last4="4242"
        )

        assert method is not None
        assert method.card_brand == "visa"
        assert method.last4 == "4242"
        assert method.is_default is True

    def test_get_payment_methods(self, service, instance_id):
        """Testa listagem de métodos de pagamento"""
        service.add_payment_method(instance_id, PaymentMethod.CREDIT_CARD, Provider.STRIPE, "pm_1")
        service.add_payment_method(instance_id, PaymentMethod.PIX, Provider.PAGARME, "pm_2")

        methods = service.get_payment_methods(instance_id)

        assert len(methods) == 2

    def test_get_default_payment_method(self, service, instance_id):
        """Testa busca de método padrão"""
        method1 = service.add_payment_method(instance_id, PaymentMethod.CREDIT_CARD, Provider.STRIPE, "pm_1")
        service.add_payment_method(instance_id, PaymentMethod.PIX, Provider.PAGARME, "pm_2", is_default=False)

        default = service.get_default_payment_method(instance_id)

        assert default is not None
        assert default.id == method1.id

    def test_remove_payment_method(self, service, instance_id):
        """Testa remoção de método de pagamento"""
        method = service.add_payment_method(instance_id, PaymentMethod.CREDIT_CARD, Provider.STRIPE, "pm_1")

        result = service.remove_payment_method(instance_id, method.id)

        assert result is True
        assert len(service.get_payment_methods(instance_id)) == 0

    # ==================== PAYMENT TESTS ====================

    def test_create_payment(self, service, instance_id):
        """Testa criação de pagamento"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY, trial_days=0)

        payment = service.create_payment(
            subscription_id=subscription.id,
            amount=49.90,
            payment_method=PaymentMethod.CREDIT_CARD,
            description="Test payment"
        )

        assert payment is not None
        assert payment.amount == 49.90
        assert payment.status == PaymentStatus.PENDING

    def test_process_payment(self, service, instance_id):
        """Testa processamento de pagamento"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY, trial_days=0)
        payment = service.create_payment(subscription.id, 49.90, PaymentMethod.CREDIT_CARD)

        processed = service.process_payment(payment.id)

        assert processed is not None
        assert processed.status == PaymentStatus.COMPLETED
        assert processed.processed_at is not None

    def test_refund_payment(self, service, instance_id):
        """Testa estorno de pagamento"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY, trial_days=0)
        payment = service.create_payment(subscription.id, 49.90, PaymentMethod.CREDIT_CARD)
        service.process_payment(payment.id)

        refunded = service.refund_payment(payment.id, "Customer request")

        assert refunded is not None
        assert refunded.status == PaymentStatus.REFUNDED

    # ==================== INVOICE TESTS ====================

    def test_create_invoice(self, service, instance_id):
        """Testa criação de fatura"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY, trial_days=0)

        invoice = service.create_invoice(
            subscription_id=subscription.id,
            items=[{
                "description": "Starter Plan",
                "amount": 49.90,
                "quantity": 1
            }]
        )

        assert invoice is not None
        assert invoice.amount == 49.90
        assert invoice.status == "open"

    def test_generate_subscription_invoice(self, service, instance_id):
        """Testa geração de fatura para assinatura"""
        subscription = service.create_subscription(instance_id, "professional", BillingCycle.MONTHLY, trial_days=0)

        invoice = service.generate_subscription_invoice(subscription.id)

        assert invoice is not None
        assert invoice.amount > 0
        assert len(invoice.items) > 0

    def test_mark_invoice_paid(self, service, instance_id):
        """Testa marcação de fatura como paga"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY, trial_days=0)
        invoice = service.create_invoice(subscription.id, [{"description": "Test", "amount": 49.90, "quantity": 1}])

        paid = service.mark_invoice_paid(invoice.id)

        assert paid is not None
        assert paid.status == "paid"
        assert paid.paid_at is not None

    # ==================== COUPON TESTS ====================

    def test_create_coupon(self, service):
        """Testa criação de cupom"""
        coupon = service.create_coupon(
            code="DESCONTO20",
            coupon_type=CouponType.PERCENTAGE,
            value=20,
            max_redemptions=100,
            valid_days=30
        )

        assert coupon is not None
        assert coupon.code == "DESCONTO20"
        assert coupon.value == 20
        assert coupon.is_valid is True

    def test_validate_coupon_valid(self, service):
        """Testa validação de cupom válido"""
        coupon = service.create_coupon("VALIDO10", CouponType.PERCENTAGE, 10, valid_days=30)

        validated = service.validate_coupon("VALIDO10")

        assert validated is not None
        assert validated.code == "VALIDO10"

    def test_validate_coupon_expired(self, service):
        """Testa validação de cupom expirado"""
        coupon = service.create_coupon("EXPIRADO", CouponType.PERCENTAGE, 10, valid_days=0)

        validated = service.validate_coupon("EXPIRADO")

        assert validated is None

    def test_apply_coupon_discount(self, service):
        """Testa aplicação de cupom e desconto"""
        service.create_coupon("PROMO15", CouponType.PERCENTAGE, 15)

        discount = service.apply_coupon("PROMO15", "instance1", "starter")

        assert discount is not None
        assert discount > 0

    # ==================== PRICING TESTS ====================

    def test_get_plan_price_monthly(self, service):
        """Testa obtenção de preço mensal"""
        price = service.get_plan_price("starter", BillingCycle.MONTHLY)

        assert price == 49.90

    def test_get_plan_price_yearly(self, service):
        """Testa obtenção de preço anual"""
        price = service.get_plan_price("professional", BillingCycle.YEARLY)

        assert price == 1439.00

    def test_preview_price_with_coupon(self, service):
        """Testa preview de preço com cupom"""
        service.create_coupon("DESCONTO20", CouponType.PERCENTAGE, 20)

        preview = service.preview_price(
            plan_id="starter",
            billing_cycle=BillingCycle.MONTHLY,
            coupon_code="DESCONTO20"
        )

        assert preview.original_amount == 49.90
        assert preview.discount_amount > 0
        assert preview.final_amount < preview.original_amount

    # ==================== BILLING SUMMARY TESTS ====================

    def test_get_billing_summary(self, service, instance_id):
        """Testa obtenção de resumo de billing"""
        subscription = service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY, trial_days=0)
        service.add_payment_method(instance_id, PaymentMethod.CREDIT_CARD, Provider.STRIPE, "pm_test")

        summary = service.get_billing_summary(instance_id)

        assert summary is not None
        assert summary.instance_id == instance_id
        assert summary.subscription is not None
        assert len(summary.payment_methods) > 0

    # ==================== USAGE METRICS TESTS ====================

    def test_get_usage_metrics(self, service, instance_id):
        """Testa obtenção de métricas de uso"""
        service.create_subscription(instance_id, "starter", BillingCycle.MONTHLY, trial_days=0)

        now = datetime.utcnow()
        metrics = service.get_usage_metrics(
            instance_id,
            now - timedelta(days=30),
            now
        )

        assert metrics is not None
        assert metrics.instance_id == instance_id
        assert metrics.estimated_amount > 0

    # ==================== WEBHOOK TESTS ====================

    def test_handle_webhook_valid(self, service):
        """Testa processamento de webhook válido"""
        webhook_data = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test123"
                }
            }
        }

        result = service.handle_webhook(webhook_data, Provider.STRIPE)

        # May return False as no payment has this provider ID, but shouldn't raise
        assert result is not None


class TestSubscriptionModel:
    """Testes para modelo de Subscription"""

    def test_subscription_is_active_trial(self):
        """Testa verificação de ativo para trial"""
        from fase7.src.models.billing import Subscription

        sub = Subscription(
            instance_id="test",
            plan_id="starter",
            status=SubscriptionStatus.TRIAL
        )

        assert sub.is_active is True

    def test_subscription_is_active_canceled(self):
        """Testa verificação de ativo para cancelado"""
        from fase7.src.models.billing import Subscription

        sub = Subscription(
            instance_id="test",
            plan_id="starter",
            status=SubscriptionStatus.CANCELED
        )

        assert sub.is_active is False

    def test_subscription_renew(self):
        """Testa renovação de assinatura"""
        from fase7.src.models.billing import Subscription

        sub = Subscription(
            instance_id="test",
            plan_id="starter",
            billing_cycle=BillingCycle.MONTHLY
        )

        original_end = sub.current_period_end
        sub.renew()

        assert sub.current_period_start == original_end


class TestCouponModel:
    """Testes para modelo de Coupon"""

    def test_coupon_is_valid(self):
        """Testa validação de cupom"""
        from fase7.src.models.billing import Coupon

        coupon = Coupon(
            code="TEST10",
            coupon_type=CouponType.PERCENTAGE,
            value=10,
            is_active=True
        )

        assert coupon.is_valid is True

    def test_coupon_expired(self):
        """Testa cupom expirado"""
        from fase7.src.models.billing import Coupon

        coupon = Coupon(
            code="EXPIRED",
            coupon_type=CouponType.PERCENTAGE,
            value=10,
            is_active=True,
            valid_until=datetime.utcnow() - timedelta(days=1)
        )

        assert coupon.is_valid is False

    def test_apply_percentage_discount(self):
        """Testa aplicação de desconto percentual"""
        from fase7.src.models.billing import Coupon

        coupon = Coupon(
            code="PERCENT20",
            coupon_type=CouponType.PERCENTAGE,
            value=20
        )

        result = coupon.apply_discount(100)

        assert result == 80

    def test_apply_fixed_discount(self):
        """Testa aplicação de desconto fixo"""
        from fase7.src.models.billing import Coupon

        coupon = Coupon(
            code="FIXED30",
            coupon_type=CouponType.FIXED,
            value=30,
            currency="BRL"
        )

        result = coupon.apply_discount(100)

        assert result == 70