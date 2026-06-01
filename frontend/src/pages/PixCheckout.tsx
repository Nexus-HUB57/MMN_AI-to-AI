import { useEffect, useMemo, useState } from "react";
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
  ExternalLink,
  Info,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
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
        <p className="max-w-sm text-sm leading-6">Informe um valor e gere o checkout para visualizar o QR Code PIX.</p>
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
  const [copiedPixCode, setCopiedPixCode] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<MarketplaceCheckoutSession | null>(null);
  const [hasRequestedCheckout, setHasRequestedCheckout] = useState(false);

  const createCheckoutMutation = trpc.pix.createMarketplaceCheckout.useMutation();

  useEffect(() => {
    if (user?.email) setPayerEmail((current) => current || user.email);
    if (user?.cpf) setPayerDocument((current) => current || user.cpf || "");
  }, [user?.cpf, user?.email]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!copiedPixCode) return;
    const timer = window.setTimeout(() => setCopiedPixCode(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copiedPixCode]);

  const returnUrl = getMarketplaceReturnUrl(checkoutIntent?.source);
  const amountNumber = Number.parseFloat(amount.replace(",", "."));
  const hasValidAmount = Number.isFinite(amountNumber) && amountNumber >= 0.01;
  const amountCents = hasValidAmount ? Math.round(amountNumber * 100) : 0;
  const absoluteReturnUrl = typeof window !== "undefined" ? `${window.location.origin}${returnUrl}` : undefined;

  const paymentContext = useMemo(
    () => ({
      source: checkoutIntent?.source ?? "checkout-manual",
      type: checkoutIntent?.type ?? "produto",
      slug: checkoutIntent?.slug ?? "checkout-manual",
      name: checkoutIntent?.name ?? "Pagamento Nexus",
      description: description || checkoutIntent?.description || checkoutIntent?.name || "Pagamento Nexus",
      subscriptionId: checkoutIntent?.subscriptionId,
      termMonths: checkoutIntent?.termMonths,
    }),
    [checkoutIntent, description],
  );

  const fallbackPixPayload = useMemo(() => {
    if (!hasValidAmount || !hasRequestedCheckout) return null;
    return generateMarketplacePixPayload({
      amountCents,
      description: paymentContext.description,
    });
  }, [amountCents, hasRequestedCheckout, hasValidAmount, paymentContext.description]);

  const pixCode = hasRequestedCheckout ? checkoutSession?.pix.qrCode || fallbackPixPayload?.qrCodePayload || null : null;
  const pixBase64 = hasRequestedCheckout ? checkoutSession?.pix.qrCodeBase64 || null : null;
  const hasMercadoPagoLink = Boolean(checkoutSession?.mercadoPago.initPoint);

  const isSubscriptionCheckout = checkoutIntent?.type === "subscription";
  const title = checkoutIntent
    ? isSubscriptionCheckout
      ? "Assinatura Nexus Partners"
      : "Área de pagamentos do Marketplace"
    : "Checkout PIX";
  const subtitle = checkoutIntent
    ? isSubscriptionCheckout
      ? "Revise a licença contratual, gere o checkout seguro no servidor e conclua a ativação da assinatura do Nexus Partners."
      : "Revise o item, gere o checkout seguro no servidor e pague por QR Code PIX ou código copia e cola."
    : "Use este checkout para cobranças avulsas do ecossistema Nexus com geração segura de PIX.";

  const handleGenerateCheckout = async () => {
    if (!hasValidAmount) {
      setFeedback("Informe um valor válido para gerar o checkout PIX.");
      return;
    }

    setHasRequestedCheckout(true);
    setFeedback(null);

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
        subscriptionId: paymentContext.subscriptionId,
        termMonths: paymentContext.termMonths,
      })) as MarketplaceCheckoutSession;

      setCheckoutSession(session);
      setFeedback("Checkout PIX gerado com sucesso.");
    } catch (error) {
      setCheckoutSession(null);
      setFeedback(error instanceof Error ? error.message : "Não foi possível preparar o checkout agora.");
    }
  };

  const handleCopyPixCode = async () => {
    if (!pixCode) {
      setFeedback("Gere o checkout antes de copiar o código PIX.");
      return;
    }

    try {
      await navigator.clipboard.writeText(pixCode);
      setCopiedPixCode(true);
      setFeedback("Código PIX copiado com sucesso.");
    } catch {
      setFeedback("Não foi possível copiar automaticamente. Faça a cópia manual do código exibido.");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  {checkoutIntent ? (isSubscriptionCheckout ? "Assinatura originada do Marketplace" : "Compra originada do Marketplace") : "Checkout avulso"}
                </Badge>
                <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-200">
                  PIX + Mercado Pago
                </Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-300">
                  Sem exibir chave PIX na interface
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
                    O checkout é gerado no backend. A interface exibe somente QR Code ou código PIX copia e cola.
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
                      Use este checkout para cobranças manuais quando não houver um item pré-selecionado do Marketplace.
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
                      <Label htmlFor="payerDocument">CPF/CNPJ para geração do checkout</Label>
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
                      <span>Informe um valor válido para liberar o QR Code PIX e o código copia e cola.</span>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Valor final</p>
                      <p className="mt-2 text-lg font-semibold text-white">{hasValidAmount ? formatBRL(amountCents / 100) : "—"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Modo de exibição</p>
                      <p className="mt-2 text-sm font-medium text-white">Somente QR Code e código PIX</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="gradient-btn" onClick={handleGenerateCheckout} disabled={!hasValidAmount || createCheckoutMutation.isPending}>
                      {createCheckoutMutation.isPending ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="mr-2 h-4 w-4" />
                      )}
                      Gerar checkout seguro
                    </Button>

                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      disabled={!hasMercadoPagoLink || createCheckoutMutation.isPending}
                      onClick={() => {
                        if (!checkoutSession?.mercadoPago.initPoint) {
                          setFeedback("O link do Mercado Pago ainda não está disponível para este item.");
                          return;
                        }
                        window.open(checkoutSession.mercadoPago.initPoint, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir checkout Mercado Pago
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <QrCode className="h-5 w-5 text-quantum-cyan" />
                    QR Code e código PIX
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    O sistema prioriza o QR dinâmico do Mercado Pago e, quando necessário, mantém somente o código PIX como fallback visual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <QrCodeImage payload={pixCode} base64={pixBase64} />

                  {createCheckoutMutation.isPending && hasValidAmount && (
                    <div className="flex items-center gap-2 rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/10 p-3 text-sm text-quantum-cyan">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Preparando QR Code e código PIX no servidor...
                    </div>
                  )}

                  {hasRequestedCheckout && hasValidAmount && (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">Código PIX copia e cola</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                            disabled={!pixCode}
                            onClick={handleCopyPixCode}
                          >
                            {copiedPixCode ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copiar código
                          </Button>
                        </div>
                        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-black/30 p-3 text-[10px] text-slate-300">
                          {pixCode || "Gere o checkout para visualizar o código PIX."}
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
                    <p><strong className="text-white">1.</strong> Confira item, valor e dados do comprador.</p>
                    <p className="mt-1"><strong className="text-white">2.</strong> Clique em <strong>Gerar checkout seguro</strong>.</p>
                    <p className="mt-1"><strong className="text-white">3.</strong> Pague usando somente o QR Code ou o código PIX copia e cola.</p>
                    <p className="mt-1"><strong className="text-white">4.</strong> Se desejar, abra o checkout do Mercado Pago quando o link estiver disponível.</p>
                  </div>
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100">
                    A interface não mostra a chave PIX manual nem outros dados fixos de recebimento. O foco visual fica restrito ao QR Code e ao código PIX.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Segurança do checkout</CardTitle>
                  <CardDescription className="text-slate-400">
                    Proteção aplicada no fluxo de pagamento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="inline-flex items-center gap-2 font-semibold text-white">
                      <ShieldCheck className="h-4 w-4 text-quantum-cyan" />
                      Token protegido no servidor
                    </p>
                    <p className="mt-2 leading-6">
                      O navegador recebe apenas o link de checkout e os dados mínimos necessários para concluir o pagamento.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="font-semibold text-white">Exibição reduzida</p>
                    <p className="mt-2 leading-6">
                      Dados sensíveis do recebimento não são mostrados na tela. O usuário opera apenas com QR Code e código PIX copia e cola.
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
