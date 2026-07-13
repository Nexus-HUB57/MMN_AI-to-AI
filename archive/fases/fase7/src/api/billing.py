"""
Rotas de Billing e Pagamentos

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 4 Billing Integration
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from typing import Optional
from datetime import datetime

from ..models.billing import (
    Subscription, SubscriptionStatus, BillingCycle,
    Payment, PaymentStatus, PaymentMethod, Provider,
    Invoice, Coupon, CouponType,
    SubscriptionCreateRequest, SubscriptionUpdateRequest,
    UpgradeDowngradeRequest, UpgradeDowngradeResponse, PricePreview,
    SavedPaymentMethod, BillingSummary, UsageMetrics
)
from ..services.billing_service import BillingService
from ..middleware.rate_limit import rate_limit, RateLimits

router = APIRouter(prefix="/billing", tags=["Billing"])

def get_billing_service(request: Request) -> BillingService:
    """Dependency para obter billing service"""
    return request.app.state.billing_service


# ==================== SUBSCRIPTION ENDPOINTS ====================

@router.post("/subscriptions", response_model=dict, status_code=201)
@rate_limit(*RateLimits.CREATE_SUBSCRIPTION)
async def create_subscription(
    request: Request,
    data: SubscriptionCreateRequest
):
    """Cria nova assinatura para instância"""
    service = get_billing_service(request)

    try:
        subscription = service.create_subscription(
            instance_id=data.instance_id,
            plan_id=data.plan_id,
            billing_cycle=data.billing_cycle,
            trial_days=data.trial_days
        )
        return subscription.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail={
            "error": "SUBSCRIPTION_CREATE_FAILED",
            "message": str(e)
        })


@router.get("/subscriptions/{subscription_id}", response_model=dict)
async def get_subscription(
    request: Request,
    subscription_id: str
):
    """Obtém detalhes da assinatura"""
    service = get_billing_service(request)

    subscription = service.get_subscription(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Assinatura não encontrada"
        })

    return subscription.dict()


@router.get("/subscriptions/instance/{instance_id}", response_model=dict)
async def get_subscription_by_instance(
    request: Request,
    instance_id: str
):
    """Obtém assinatura ativa da instância"""
    service = get_billing_service(request)

    subscription = service.get_subscription_by_instance(instance_id)
    if not subscription:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Nenhuma assinatura ativa encontrada"
        })

    return subscription.dict()


@router.get("/subscriptions", response_model=dict)
async def list_subscriptions(
    request: Request,
    instance_id: Optional[str] = None
):
    """Lista assinaturas (opcionalmente filtradas por instância)"""
    service = get_billing_service(request)

    subscriptions = service.get_all_subscriptions(instance_id)
    return {
        "data": [s.dict() for s in subscriptions],
        "total": len(subscriptions)
    }


@router.patch("/subscriptions/{subscription_id}", response_model=dict)
async def update_subscription(
    request: Request,
    subscription_id: str,
    data: SubscriptionUpdateRequest
):
    """Atualiza assinatura"""
    service = get_billing_service(request)

    subscription = service.update_subscription(
        subscription_id=subscription_id,
        plan_id=data.plan_id,
        billing_cycle=data.billing_cycle
    )

    if not subscription:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Assinatura não encontrada"
        })

    return subscription.dict()


@router.post("/subscriptions/{subscription_id}/cancel")
async def cancel_subscription(
    request: Request,
    subscription_id: str,
    immediate: bool = False
):
    """Cancela assinatura"""
    service = get_billing_service(request)

    subscription = service.cancel_subscription(subscription_id, immediate)
    if not subscription:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Assinatura não encontrada"
        })

    return {
        "message": "Assinatura cancelada",
        "effective_date": subscription.canceled_at.isoformat() if subscription.canceled_at else subscription.current_period_end.isoformat(),
        "subscription": subscription.dict()
    }


@router.post("/subscriptions/{subscription_id}/reactivate")
async def reactivate_subscription(
    request: Request,
    subscription_id: str
):
    """Reativa assinatura cancelada"""
    service = get_billing_service(request)

    subscription = service.reactivate_subscription(subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Assinatura não encontrada"
        })

    return {
        "message": "Assinatura reativada",
        "subscription": subscription.dict()
    }


@router.post("/instances/{instance_id}/change-plan", response_model=dict)
async def change_plan(
    request: Request,
    instance_id: str,
    data: UpgradeDowngradeRequest
):
    """Upgrade ou downgrade de plano"""
    service = get_billing_service(request)

    result = service.change_plan(
        instance_id=instance_id,
        new_plan_id=data.new_plan_id,
        immediate=data.immediate
    )

    if not result:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Assinatura não encontrada"
        })

    return result.dict()


# ==================== PAYMENT ENDPOINTS ====================

@router.post("/payments", response_model=dict, status_code=201)
@rate_limit(*RateLimits.CREATE_PAYMENT)
async def create_payment(
    request: Request,
    data: dict
):
    """Cria novo pagamento"""
    service = get_billing_service(request)

    try:
        payment = service.create_payment(
            subscription_id=data.get("subscription_id"),
            amount=data.get("amount"),
            payment_method=PaymentMethod(data.get("payment_method", "credit_card")),
            description=data.get("description")
        )
        return payment.dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail={
            "error": "PAYMENT_CREATE_FAILED",
            "message": str(e)
        })


@router.get("/payments/{payment_id}", response_model=dict)
async def get_payment(
    request: Request,
    payment_id: str
):
    """Obtém detalhes do pagamento"""
    service = get_billing_service(request)

    payment = service.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Pagamento não encontrado"
        })

    return payment.dict()


@router.post("/payments/{payment_id}/process")
async def process_payment(
    request: Request,
    payment_id: str
):
    """Processa pagamento"""
    service = get_billing_service(request)

    payment = service.process_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Pagamento não encontrado"
        })

    return {
        "message": "Pagamento processado",
        "payment": payment.dict()
    }


@router.post("/payments/{payment_id}/refund")
async def refund_payment(
    request: Request,
    payment_id: str,
    reason: Optional[str] = None
):
    """Estorna pagamento"""
    service = get_billing_service(request)

    payment = service.refund_payment(payment_id, reason)
    if not payment:
        raise HTTPException(status_code=400, detail={
            "error": "REFUND_FAILED",
            "message": "Pagamento não pode ser estornado"
        })

    return {
        "message": "Pagamento estornado",
        "payment": payment.dict()
    }


@router.get("/instances/{instance_id}/payments", response_model=dict)
async def list_payments(
    request: Request,
    instance_id: str
):
    """Lista pagamentos da instância"""
    service = get_billing_service(request)

    payments = service.get_payments_by_instance(instance_id)
    return {
        "data": [p.dict() for p in payments],
        "total": len(payments)
    }


# ==================== INVOICE ENDPOINTS ====================

@router.post("/invoices", response_model=dict, status_code=201)
async def create_invoice(
    request: Request,
    data: dict
):
    """Cria nova fatura"""
    service = get_billing_service(request)

    try:
        invoice = service.create_invoice(
            subscription_id=data.get("subscription_id"),
            items=data.get("items", []),
            due_date=datetime.fromisoformat(data["due_date"]) if data.get("due_date") else None
        )
        return invoice.dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail={
            "error": "INVOICE_CREATE_FAILED",
            "message": str(e)
        })


@router.get("/invoices/{invoice_id}", response_model=dict)
async def get_invoice(
    request: Request,
    invoice_id: str
):
    """Obtém detalhes da fatura"""
    service = get_billing_service(request)

    invoice = service.get_invoice(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Fatura não encontrada"
        })

    return invoice.dict()


@router.get("/instances/{instance_id}/invoices", response_model=dict)
async def list_invoices(
    request: Request,
    instance_id: str
):
    """Lista faturas da instância"""
    service = get_billing_service(request)

    invoices = service.get_invoices_by_instance(instance_id)
    return {
        "data": [inv.dict() for inv in invoices],
        "total": len(invoices)
    }


@router.post("/invoices/{invoice_id}/mark-paid")
async def mark_invoice_paid(
    request: Request,
    invoice_id: str
):
    """Marca fatura como paga"""
    service = get_billing_service(request)

    invoice = service.mark_invoice_paid(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Fatura não encontrada"
        })

    return {
        "message": "Fatura marcada como paga",
        "invoice": invoice.dict()
    }


# ==================== COUPON ENDPOINTS ====================

@router.post("/coupons", response_model=dict, status_code=201)
async def create_coupon(
    request: Request,
    data: dict
):
    """Cria novo cupom"""
    service = get_billing_service(request)

    coupon = service.create_coupon(
        code=data.get("code"),
        coupon_type=CouponType(data.get("type", "percentage")),
        value=data.get("value"),
        max_redemptions=data.get("max_redemptions", -1),
        valid_days=data.get("valid_days")
    )

    return coupon.dict()


@router.get("/coupons/validate/{code}")
async def validate_coupon(
    request: Request,
    code: str,
    instance_id: Optional[str] = None,
    plan_id: Optional[str] = None
):
    """Valida cupom"""
    service = get_billing_service(request)

    coupon = service.validate_coupon(code, instance_id, plan_id)
    if not coupon:
        raise HTTPException(status_code=404, detail={
            "error": "COUPON_INVALID",
            "message": "Cupom inválido ou expirado"
        })

    return {
        "valid": True,
        "code": coupon.code,
        "type": coupon.coupon_type.value,
        "value": coupon.value,
        "is_valid": coupon.is_valid
    }


@router.post("/coupons/apply")
async def apply_coupon(
    request: Request,
    data: dict
):
    """Aplica cupom e retorna desconto"""
    service = get_billing_service(request)

    discount = service.apply_coupon(
        code=data.get("code"),
        instance_id=data.get("instance_id"),
        plan_id=data.get("plan_id")
    )

    if discount is None:
        raise HTTPException(status_code=400, detail={
            "error": "COUPON_APPLY_FAILED",
            "message": "Não foi possível aplicar o cupom"
        })

    return {
        "code": data.get("code"),
        "discount": discount
    }


# ==================== PRICING ENDPOINTS ====================

@router.get("/pricing/{plan_id}/{billing_cycle}", response_model=dict)
async def get_plan_price(
    request: Request,
    plan_id: str,
    billing_cycle: str
):
    """Obtém preço de plano"""
    service = get_billing_service(request)

    price = service.get_plan_price(plan_id, BillingCycle(billing_cycle))
    if price is None:
        raise HTTPException(status_code=404, detail={
            "error": "PLAN_NOT_FOUND",
            "message": "Plano não encontrado"
        })

    preview = service.preview_price(
        plan_id=plan_id,
        billing_cycle=BillingCycle(billing_cycle),
        coupon_code=None
    )

    return preview.dict()


@router.post("/pricing/preview", response_model=dict)
async def preview_price(
    request: Request,
    data: dict
):
    """Gera preview de preço com descontos"""
    service = get_billing_service(request)

    preview = service.preview_price(
        plan_id=data.get("plan_id"),
        billing_cycle=BillingCycle(data.get("billing_cycle", "monthly")),
        coupon_code=data.get("coupon_code"),
        instance_id=data.get("instance_id")
    )

    return preview.dict()


# ==================== SUMMARY ENDPOINTS ====================

@router.get("/instances/{instance_id}/summary", response_model=dict)
async def get_billing_summary(
    request: Request,
    instance_id: str
):
    """Obtém resumo de billing da instância"""
    service = get_billing_service(request)

    summary = service.get_billing_summary(instance_id)
    return summary.dict()


@router.get("/instances/{instance_id}/usage", response_model=dict)
async def get_usage_metrics(
    request: Request,
    instance_id: str,
    period_start: Optional[str] = None,
    period_end: Optional[str] = None
):
    """Obtém métricas de uso"""
    service = get_billing_service(request)

    start = datetime.fromisoformat(period_start) if period_start else datetime.utcnow()
    end = datetime.fromisoformat(period_end) if period_end else datetime.utcnow()

    metrics = service.get_usage_metrics(instance_id, start, end)
    return metrics.dict()


# ==================== PAYMENT METHODS ENDPOINTS ====================

@router.get("/instances/{instance_id}/payment-methods", response_model=dict)
async def list_payment_methods(
    request: Request,
    instance_id: str
):
    """Lista métodos de pagamento da instância"""
    service = get_billing_service(request)

    methods = service.get_payment_methods(instance_id)
    return {
        "data": [m.dict() for m in methods],
        "total": len(methods)
    }


@router.post("/instances/{instance_id}/payment-methods", response_model=dict, status_code=201)
async def add_payment_method(
    request: Request,
    instance_id: str,
    data: dict
):
    """Adiciona método de pagamento"""
    service = get_billing_service(request)

    method = service.add_payment_method(
        instance_id=instance_id,
        payment_method=PaymentMethod(data.get("type", "credit_card")),
        provider=Provider(data.get("provider", "internal")),
        provider_id=data.get("provider_id"),
        card_brand=data.get("card_brand"),
        last4=data.get("last4"),
        is_default=data.get("is_default", True)
    )

    return method.dict()


@router.delete("/instances/{instance_id}/payment-methods/{method_id}")
async def remove_payment_method(
    request: Request,
    instance_id: str,
    method_id: str
):
    """Remove método de pagamento"""
    service = get_billing_service(request)

    success = service.remove_payment_method(instance_id, method_id)
    if not success:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Método de pagamento não encontrado"
        })

    return {"message": "Método de pagamento removido"}


# ==================== WEBHOOK ENDPOINT ====================

@router.post("/webhook/{provider}")
async def handle_webhook(
    request: Request,
    provider: str,
    payload: dict
):
    """Recebe webhook de gateway de pagamento (Stripe/Pagarme)"""
    service = get_billing_service(request)

    success = service.handle_webhook(payload, Provider(provider))
    if not success:
        raise HTTPException(status_code=400, detail={
            "error": "WEBHOOK_PROCESSING_FAILED",
            "message": "Falha ao processar webhook"
        })

    return {"message": "Webhook processado com sucesso"}