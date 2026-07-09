/**
 * Rotas de Dropshipping - Fase 8
 * API REST para gerenciamento de dropshipping
 *
 * Autor: Nexus-HUB57
 * Versão: 1.0.0
 */

import { Router, Request, Response } from "express";
import { dropshippingService, DropshippingOrderInput } from "../services/dropshippingService";

const router = Router();

// ============================================
// POST /dropshipping/orders - Registrar pedido
// ============================================
router.post("/orders", async (req: Request, res: Response) => {
  try {
    const input: DropshippingOrderInput = req.body;

    // Validar campos obrigatórios
    if (!input.affiliateId || !input.productId || !input.externalOrderId ||
        !input.marketplace || !input.customerName || !input.shippingAddress || !input.amount) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: affiliateId, productId, externalOrderId, marketplace, customerName, shippingAddress, amount",
        required_fields: [
          "affiliateId (number)",
          "productId (number)",
          "externalOrderId (string)",
          "marketplace (string)",
          "customerName (string)",
          "shippingAddress (string)",
          "amount (number)"
        ]
      });
    }

    // Validar amount positivo
    if (input.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount deve ser maior que zero"
      });
    }

    const result = await dropshippingService.registerDropshippingOrder(input);

    if (result.success) {
      return res.status(201).json({
        success: true,
        orderId: result.orderId,
        commissionAmount: result.commissionAmount,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error("[Dropshipping API] Erro ao registrar pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// ============================================
// PATCH /dropshipping/orders/:orderId/status - Atualizar status
// ============================================
router.patch("/orders/:orderId/status", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "orderId deve ser um número válido"
      });
    }

    const { status } = req.body;

    // Validar status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Valores permitidos: ${validStatuses.join(", ")}`
      });
    }

    const result = await dropshippingService.updateDropshippingOrderStatus({
      orderId,
      newStatus: status as any
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        orderId: result.orderId,
        commissionCalculated: result.commissionCalculated,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error("[Dropshipping API] Erro ao atualizar status:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// ============================================
// GET /dropshipping/orders/:orderId - Buscar pedido
// ============================================
router.get("/orders/:orderId", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "orderId deve ser um número válido"
      });
    }

    const order = await dropshippingService.getOrderById(orderId);

    if (order) {
      return res.status(200).json({
        success: true,
        data: order
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado"
      });
    }
  } catch (error) {
    console.error("[Dropshipping API] Erro ao buscar pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// ============================================
// GET /dropshipping/affiliates/:affiliateId/orders - Pedidos do afiliado
// ============================================
router.get("/affiliates/:affiliateId/orders", async (req: Request, res: Response) => {
  try {
    const affiliateId = parseInt(req.params.affiliateId, 10);
    if (isNaN(affiliateId)) {
      return res.status(400).json({
        success: false,
        message: "affiliateId deve ser um número válido"
      });
    }

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const orders = await dropshippingService.getOrdersByAffiliate(affiliateId, limit);

    return res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error("[Dropshipping API] Erro ao buscar pedidos:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// ============================================
// GET /dropshipping/orders - Listar todos os pedidos (admin)
// ============================================
router.get("/orders", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const orders = await dropshippingService.getAllOrders(limit);

    return res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error("[Dropshipping API] Erro ao listar pedidos:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// ============================================
// POST /dropshipping/orders/:orderId/calculate-commission - Calcular comissão
// ============================================
router.post("/orders/:orderId/calculate-commission", async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "orderId deve ser um número válido"
      });
    }

    const result = await dropshippingService.calculateConsumptionCommission(orderId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        commissionAmount: result.commissionAmount,
        message: "Comissão calculada com sucesso"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error("[Dropshipping API] Erro ao calcular comissão:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

export default router;