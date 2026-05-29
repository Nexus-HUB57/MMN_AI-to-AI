import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Info,
  Landmark,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  MARKETPLACE_PIX_BANK_LABEL,
  MARKETPLACE_PIX_KEY,
  MARKETPLACE_PIX_KEY_TYPE_LABEL,
  buildMarketplaceCheckoutUrl,
  formatCurrencyFromCents,
  generateMarketplacePixPayload,
  getMarketplaceReturnUrl,
  readMarketplaceCheckoutIntent,
} from "@/lib/marketplace-payments";

interface MarketplaceCheckoutSession {
  amount: number;
  amountCents: number;
  externalReference: string;
  mercadoPago: {
    configured: boolean;
    preferenceId: string | null;
    initPoint: string | null;
    sandboxInitPoint: string | null;
  };
  pix: {
    provider: "manual_key" | "mercado_pago";
    paymentId: string | null;
    status: string | null;
    qrCode: string | null;
    qrCodeBase64: string | null;
    ticketUrl: string | null;
    expiresAt: string | null;
    fallback: {
      pixKey: string;
      keyType: string | null;
      receiverName: string;
      receiverCity: string;
      bankLabel: string;
    };
  };
  warnings: string[];
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function QrCodeImage({ payload, base64 }: { payload: string | null; base64?: string | null }) {
  const imageSrc = base64
    ? `data:image/png;base64,${base64}`
    : payload
      ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payload)}&size=280x280&format=png&ecc=M&margin=8`
      : null;

  if (!imageSrc) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 text-center text-slate-400">
        <QrCode className="h-14 w-14 opacity-20" />
        <p className="max-w-sm text-sm leading-6">Preencha um valor válido para gerar o QR Code do pagamento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-3xl border border-white/10 bg-white p-4 shadow-inner shadow-black/10">
        <img src={imageSrc} alt="QR Code PIX" width={280} height={280} className="rounded-xl" />
      </div>
      <span className="text-xs text-slate-400">Escaneie com o app do seu banco</span>
    </div>
  );
}

export default function PixCheckout() {
  const { user } = useAuth();
  const checkoutIntent = useMemo(() => readMarketplaceCheckoutIntent(), []);
  const defaultAmount = checkoutIntent?.amountCents ? (checkoutIntent.amountCents / 100).toFixed(2) : "";
  const defaultDescription = checkoutIntent?.description ?? checkoutIntent?.name ?? "";

  const [amount, setAmount] = useState(defaultAmount);
  const [description, setDescription] = useState(defaultDescription);
  const [payerEmail, setPayerEmail] = useState(user?.email ?? "");
  const [payerDocument, setPayerDocument] = useState(user?.cpf ?? "");
  const [copiedState, setCopiedState] = useState<"pix" | "key" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<MarketplaceCheckoutSession | null>(null);

  const requestIdRef = useRef(0);
  const createCheckoutMutation = trpc.pix.createMarketplaceCheckout.useMutation();

  useEffect(() => {
    if (user?.email) setPayerEmail((current) => current || user.email);
    if (user?.cpf) setPayerDocument((current) => current || user.cpf || "");
  }, [user?.cpf, user?.email]);

  const returnUrl = getMarketplaceReturnUrl(checkoutIntent?.source);
  const amountNumber = Number.parseFloat(amount.replace(",", "."));
  const hasValidAmount = Number.isFinite(amountNumber) && amountNumber >= 0.01;
  const amountCents = hasValidAmount ? Math.round(amountNumber * 100) : 0;
  const absoluteReturnUrl = typeof window !== "undefined" ? `${window.location.origin}${returnUrl}` : undefined;

  const paymentContext = useMemo(() => ({
    source: checkoutIntent?.source ?? "checkout-manual",
    type: checkoutIntent?.type ?? "produto",
    slug: checkoutIntent?.slug ?? "checkout-manual",
    name: checkoutIntent?.name ?? "Pagamento Nexus",
    description: description || checkoutIntent?.description || checkoutIntent?.name || "Pagamento Nexus",
    amountCents: hasValidAmount ? amountCents : checkoutIntent?.amountCents,
  }), [amountCents, checkoutIntent, description, hasValidAmount]);

  const fallbackPixPayload = useMemo(() => {
    if (!hasValidAmount) return null;
    return generateMarketplacePixPayload({
      amountCents,
      description: description || checkoutIntent?.name || "Pagamento Nexus",
    });
  }, [amountCents, checkoutIntent?.name, description, hasValidAmount]);

  useEffect(() => {
    if (!hasValidAmount) {
      setCheckoutSession(null);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const session = (await createCheckoutMutation.mutateAsync({
          source: paymentContext.source,
          type: paymentContext.type,
          slug: paymentContext.slug,
          name: paymentContext.name,
          description: paymentContext.description,
          amountCents,
          returnUrl: absoluteReturnUrl,
          payerEmail: payerEmail || undefined,
          payerName: user?.name || undefined,
          payerDocument: payerDocument || undefined,
        })) as MarketplaceCheckoutSession;

        if (requestIdRef.current === currentRequestId) {
          setCheckoutSession(session);
        }
      } catch (error) {
        if (requestIdRef.current === currentRequestId) {
          setCheckoutSession(null);
          setFeedback(error instanceof Error ? error.message : "Não foi possível preparar o checkout agora.");
        }
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [absoluteReturnUrl, amountCents, createCheckoutMutation, hasValidAmount, payerDocument, payerEmail, paymentContext.description, paymentContext.name, paymentContext.slug, paymentContext.source, paymentContext.type, user?.name]);

  useEffect(() => {
    if (!copiedState) return;
    const timer = window.setTimeout(() => setCopiedState(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copiedState]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleCopy = async (value: string, type: "pix" | "key") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(type);
      setFeedback(type === "pix" ? "Código PIX copiado com sucesso." : "Chave PIX copiada com sucesso.");
    } catch {
      setFeedback("Não foi possível copiar automaticamente. Faça a cópia manual.");
    }
  };

  const pixCode = checkoutSession?.pix.qrCode || fallbackPixPayload?.qrCodePayload || null;
  const pixBase64 = checkoutSession?.pix.qrCodeBase64 || null;
  const pixKey = checkoutSession?.pix.fallback.pixKey || MARKETPLACE_PIX_KEY;
  const pixBank = checkoutSession?.pix.fallback.bankLabel || MARKETPLACE_PIX_BANK_LABEL;
  const pixReceiver = checkoutSession?.pix.fallback.receiverName || "ONEVERSO MMN AI";
  const pixCity = checkoutSession?.pix.fallback.receiverCity || "SAO PAULO";
  const hasMercadoPagoLink = Boolean(checkoutSession?.mercadoPago.initPoint);
  const isGeneratingCheckout = createCheckoutMutation.isPending;

  const title = checkoutIntent ? "Área de pagamentos do Marketplace" : "Checkout PIX";
  const subtitle = checkoutIntent
    ? "Revise o item, gere o checkout server-side do Mercado Pago e pague por QR Code PIX ou link de checkout."
    : "Use este checkout para cobranças avulsas do ecossistema Nexus com Mercado Pago e PIX.";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  {checkoutIntent ? "Compra originada do Marketplace" : "Checkout avulso"}
                </Badge>
                <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-200">
                  PIX + Mercado Pago
                </Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-300">
                  Token protegido no servidor
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={returnUrl}>
                <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              {checkoutIntent && (
                <Link href={buildMarketplaceCheckoutUrl(checkoutIntent)}>
                  <Button variant="outline" className="border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan hover:bg-quantum-cyan/15">
                    <Wallet className="mr-2 h-4 w-4" />
                    Reabrir checkout
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {feedback && (
          <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 px-4 py-3 text-sm text-quantum-cyan">
            {feedback}
          </div>
        )}

        {checkoutSession?.warnings?.length ? (
          <div className="space-y-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            {checkoutSession.warnings.map((warning) => (
              <p key={warning} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{warning}</span>
              </p>
            ))}
          </div>
        ) : null}

        <Tabs defaultValue="checkout" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="checkout" className="gap-2">
              <Wallet className="h-4 w-4" /> Checkout
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              <Info className="h-4 w-4" /> Informações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkout" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Wallet className="h-5 w-5 text-quantum-cyan" />
                    Dados do pagamento
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    O checkout é preparado no backend e o Access Token do Mercado Pago permanece fora do cliente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {checkoutIntent ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Item selecionado</p>
                          <p className="mt-2 text-lg font-semibold text-white">{checkoutIntent.name}</p>
                          <p className="mt-1 text-sm text-slate-300">
                            {checkoutIntent.description || "Pedido gerado a partir do Marketplace Nexus."}
                          </p>
                        </div>
                        <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan uppercase">
                          {checkoutIntent.type}
                        </Badge>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Origem</p>
                          <p className="mt-2 text-sm font-medium text-white">{checkoutIntent.source || "marketplace"}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Valor sugerido</p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {typeof checkoutIntent.amountCents === "number" ? formatCurrencyFromCents(checkoutIntent.amountCents) : "Definir manualmente"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                      Use este checkout para cobranças manuais ou acessos diretos ao PIX quando não houver um item pré-selecionado do Marketplace.
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">R$</span>
                        <Input
                          id="amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="0,00"
                          className="border-white/10 bg-white/5 pl-9 text-white"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        placeholder="Ex: Pack Agente Afiliado A²"
                        maxLength={72}
                        className="border-white/10 bg-white/5 text-white"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="payerEmail">E-mail do comprador</Label>
                      <Input
                        id="payerEmail"
                        type="email"
                        placeholder="seu@email.com"
                        className="border-white/10 bg-white/5 text-white"
                        value={payerEmail}
                        onChange={(event) => setPayerEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="payerDocument">CPF/CNPJ para PIX Mercado Pago</Label>
                      <Input
                        id="payerDocument"
                        placeholder="Opcional"
                        className="border-white/10 bg-white/5 text-white"
                        value={payerDocument}
                        onChange={(event) => setPayerDocument(event.target.value)}
                      />
                    </div>
                  </div>

                  {!hasValidAmount && (
                    <div className="flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Informe um valor válido para liberar o QR Code PIX e levar o valor correto para o fluxo de pagamento.</span>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-white">
                        <CreditCard className="h-4 w-4 text-sky-300" />
                        <p className="font-semibold">Mercado Pago</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        O backend cria a preferência de checkout e devolve o link pronto para o usuário concluir a compra.
                      </p>
                      <Button
                        className="mt-4 w-full gradient-btn"
                        disabled={!hasMercadoPagoLink || !hasValidAmount || isGeneratingCheckout}
                        onClick={() => {
                          if (!checkoutSession?.mercadoPago.initPoint) {
                            setFeedback("O link do Mercado Pago ainda não está disponível para este item.");
                            return;
                          }
                          window.open(checkoutSession.mercadoPago.initPoint, "_blank", "noopener,noreferrer");
                        }}
                      >
                        {isGeneratingCheckout ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                        Abrir checkout Mercado Pago
                      </Button>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
                        <p className="font-medium text-white">Status</p>
                        <p className="mt-1">
                          {isGeneratingCheckout
                            ? "Gerando preferência de pagamento no servidor..."
                            : hasMercadoPagoLink
                              ? "Checkout pronto para abertura."
                              : "Aguardando configuração do token ou retorno da API."}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 p-4">
                      <div className="flex items-center gap-2 text-white">
                        <QrCode className="h-4 w-4 text-quantum-cyan" />
                        <p className="font-semibold">PIX direto</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Chave {MARKETPLACE_PIX_KEY_TYPE_LABEL.toLowerCase()} {pixKey} · {pixBank}. Se o QR dinâmico do Mercado Pago não estiver disponível, o checkout mantém a chave PIX manual como fallback.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 w-full border-quantum-cyan/30 bg-quantum-cyan/5 text-quantum-cyan hover:bg-quantum-cyan/10"
                        onClick={() => handleCopy(pixKey, "key")}
                      >
                        {copiedState === "key" ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        Copiar chave PIX
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <QrCode className="h-5 w-5 text-quantum-cyan" />
                    QR Code e dados PIX
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    O checkout prioriza o QR dinâmico do Mercado Pago e faz fallback para a chave celular Nubank quando necessário.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <QrCodeImage payload={pixCode} base64={pixBase64} />

                  {isGeneratingCheckout && hasValidAmount && (
                    <div className="flex items-center gap-2 rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 p-3 text-sm text-quantum-cyan">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Preparando QR Code e link do checkout no servidor...
                    </div>
                  )}

                  {hasValidAmount && (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Valor</p>
                          <p className="mt-2 text-lg font-semibold text-white">{formatBRL(amountCents / 100)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Recebedor</p>
                          <p className="mt-2 text-sm font-semibold text-white">{pixReceiver}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                          <p className="inline-flex items-center gap-2 font-medium text-white">
                            <Smartphone className="h-4 w-4 text-quantum-cyan" />
                            Tipo da chave
                          </p>
                          <p className="mt-2">{MARKETPLACE_PIX_KEY_TYPE_LABEL}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                          <p className="inline-flex items-center gap-2 font-medium text-white">
                            <Landmark className="h-4 w-4 text-quantum-cyan" />
                            Banco / Cidade
                          </p>
                          <p className="mt-2">{pixBank} · {pixCity}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">Código PIX copia e cola</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                            disabled={!pixCode}
                            onClick={() => pixCode && handleCopy(pixCode, "pix")}
                          >
                            {copiedState === "pix" ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copiar código
                          </Button>
                        </div>
                        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-black/30 p-3 text-[10px] text-slate-300">
                          {pixCode || "Defina um valor para gerar o código PIX."}
                        </pre>
                      </div>

                      {checkoutSession?.pix.ticketUrl && (
                        <a href={checkoutSession.pix.ticketUrl} target="_blank" rel="noreferrer" className="block">
                          <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Abrir ticket PIX do Mercado Pago
                          </Button>
                        </a>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Como pagar</CardTitle>
                  <CardDescription className="text-slate-400">
                    Fluxo recomendado para packs e produtos do Marketplace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p><strong className="text-white">1.</strong> Confira o item, o valor e os dados do comprador.</p>
                    <p className="mt-1"><strong className="text-white">2.</strong> O backend gera a preferência do Mercado Pago e tenta retornar o QR PIX dinâmico.</p>
                    <p className="mt-1"><strong className="text-white">3.</strong> Se o QR dinâmico não vier, use a chave PIX manual e o código copia e cola exibidos na tela.</p>
                    <p className="mt-1"><strong className="text-white">4.</strong> Após o pagamento, o fluxo administrativo pode validar/liberar o item adquirido.</p>
                  </div>
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100">
                    O QR PIX do Mercado Pago pode exigir dados do comprador, como e-mail e CPF/CNPJ. Por isso esses campos ficam disponíveis no checkout.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Dados fixos do recebimento</CardTitle>
                  <CardDescription className="text-slate-400">
                    Informações públicas exibidas para o comprador no checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <span>Chave PIX</span>
                    <span className="font-semibold text-white">{pixKey}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <span>Tipo</span>
                    <span className="font-semibold text-white">{MARKETPLACE_PIX_KEY_TYPE_LABEL}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <span>Banco</span>
                    <span className="font-semibold text-white">{pixBank}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <span>Recebedor</span>
                    <span className="font-semibold text-white">{pixReceiver}</span>
                  </div>
                  <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 p-4 text-xs leading-6 text-slate-200">
                    <p className="inline-flex items-center gap-2 font-semibold text-white">
                      <ShieldCheck className="h-4 w-4 text-quantum-cyan" />
                      Segurança do token
                    </p>
                    <p className="mt-1">
                      O Access Token do Mercado Pago não aparece no frontend. O navegador recebe apenas o link de checkout e os dados públicos necessários para o pagamento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
