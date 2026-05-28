import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Zap,
  Info,
  X,
} from "lucide-react";

const PIX_POLL_INTERVAL_MS = 5_000;

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function QrCodeImage({ payload }: { payload: string }) {
  const encodedPayload = encodeURIComponent(payload);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedPayload}&size=250x250&format=png&ecc=M&margin=8`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white rounded-2xl p-4 shadow-inner border border-gray-100">
        <img
          src={qrUrl}
          alt="QR Code PIX"
          width={250}
          height={250}
          className="rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        Escaneie com qualquer app de banco
      </span>
    </div>
  );
}

type PixStatus = "idle" | "generated" | "polling" | "paid" | "expired" | "error";

interface GeneratedQr {
  qrCodePayload: string;
  txid: string;
  amount: number;
  sandbox: boolean;
  expiresAt: string;
}

export default function PixCheckout() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PixStatus>("idle");
  const [generatedQr, setGeneratedQr] = useState<GeneratedQr | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const configQuery = trpc.pix.config.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  const generateQrMutation = trpc.pix.generateStaticQr.useMutation({
    onSuccess: (data) => {
      setGeneratedQr(data as GeneratedQr);
      setStatus("generated");
      setErrorMsg(null);
      startPolling((data as GeneratedQr).txid);
    },
    onError: (err) => {
      setErrorMsg(err.message);
      setStatus("error");
    },
  });

  const checkStatusQuery = trpc.pix.checkPaymentStatus.useQuery(
    { txid: generatedQr?.txid ?? "" },
    {
      enabled: false,
      retry: false,
    },
  );

  const sandboxConfirmMutation = trpc.pix.sandboxConfirm.useMutation({
    onSuccess: () => {
      setPaymentConfirmed(true);
      setStatus("paid");
      stopPolling();
    },
    onError: (err) => {
      setErrorMsg(err.message);
    },
  });

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (txid: string) => {
      stopPolling();
      setStatus("polling");
      pollRef.current = setInterval(async () => {
        try {
          const result = await checkStatusQuery.refetch();
          if (result.data?.status === "CONCLUIDA") {
            setPaymentConfirmed(true);
            setStatus("paid");
            stopPolling();
          }
        } catch {
          // silent — continue polling
        }
      }, PIX_POLL_INTERVAL_MS);
    },
    [stopPolling, checkStatusQuery],
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleGenerate = () => {
    const amountNumber = parseFloat(amount.replace(",", "."));
    if (isNaN(amountNumber) || amountNumber < 0.01) {
      setErrorMsg("Informe um valor válido (mínimo R$ 0,01).");
      return;
    }
    setStatus("idle");
    setGeneratedQr(null);
    setPaymentConfirmed(false);
    setErrorMsg(null);
    generateQrMutation.mutate({
      amount: amountNumber,
      description: description || undefined,
    });
  };

  const handleCopy = async () => {
    if (!generatedQr?.qrCodePayload) return;
    await navigator.clipboard.writeText(generatedQr.qrCodePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    stopPolling();
    setGeneratedQr(null);
    setStatus("idle");
    setPaymentConfirmed(false);
    setErrorMsg(null);
  };

  const handleSandboxConfirm = () => {
    if (!generatedQr) return;
    const amountNumber = parseFloat(amount.replace(",", "."));
    sandboxConfirmMutation.mutate({
      txid: generatedQr.txid,
      amount: amountNumber,
      payerName: "Teste Sandbox",
    });
  };

  const config = configQuery.data;
  const isSandbox = config?.sandbox ?? true;
  const isConfigured = config?.configured ?? false;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Checkout PIX</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gere QR Codes PIX para receber pagamentos instantâneos
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSandbox && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1">
                <Zap className="h-3 w-3" /> Sandbox
              </Badge>
            )}
            {isConfigured && !isSandbox && (
              <Badge className="bg-green-600 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" /> Produção
              </Badge>
            )}
          </div>
        </div>

        {!isConfigured && !isSandbox && (
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Chave PIX não configurada. Defina a variável <code>PIX_KEY</code> no servidor
              para habilitar pagamentos reais.
            </span>
          </div>
        )}

        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="qr" className="gap-2">
              <QrCode className="h-4 w-4" /> Gerar QR Code
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              <Info className="h-4 w-4" /> Informações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left: form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados da Cobrança</CardTitle>
                  <CardDescription>
                    Informe o valor e uma descrição para gerar o QR Code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0,00"
                        className="pl-9"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={status === "polling" || status === "paid"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Assinatura Nexus Pro"
                      maxLength={72}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={status === "polling" || status === "paid"}
                    />
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleGenerate}
                      disabled={generateQrMutation.isPending || status === "paid"}
                    >
                      {generateQrMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4" />
                          Gerar QR Code
                        </>
                      )}
                    </Button>
                    {generatedQr && (
                      <Button variant="outline" size="icon" onClick={handleReset} title="Novo QR">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {isSandbox && generatedQr && status !== "paid" && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                      onClick={handleSandboxConfirm}
                      disabled={sandboxConfirmMutation.isPending}
                    >
                      {sandboxConfirmMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      Simular Pagamento (Sandbox)
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Right: QR display */}
              <Card className="flex flex-col items-center justify-center">
                <CardContent className="pt-6 w-full">
                  {status === "idle" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-muted-foreground">
                      <QrCode className="h-16 w-16 opacity-20" />
                      <p className="text-sm">
                        Informe o valor ao lado e clique em <strong>Gerar QR Code</strong>
                      </p>
                    </div>
                  )}

                  {(status === "generated" || status === "polling") && generatedQr && !paymentConfirmed && (
                    <div className="flex flex-col items-center gap-4">
                      <QrCodeImage payload={generatedQr.qrCodePayload} />

                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-semibold">{formatBRL(generatedQr.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">TxID:</span>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">
                            {generatedQr.txid}
                          </code>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Expira em:</span>
                          <span className="text-xs text-yellow-600">
                            {new Date(generatedQr.expiresAt).toLocaleTimeString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      <div className="w-full">
                        <p className="text-xs text-muted-foreground mb-1">Código Copia e Cola:</p>
                        <div className="relative">
                          <pre className="text-[10px] bg-muted rounded-md p-2 overflow-auto max-h-20 break-all whitespace-pre-wrap">
                            {generatedQr.qrCodePayload}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 px-2 text-xs"
                            onClick={handleCopy}
                          >
                            {copied ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 animate-pulse text-yellow-500" />
                        Aguardando pagamento...
                      </div>
                    </div>
                  )}

                  {status === "paid" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                      <div className="rounded-full bg-green-100 p-6">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-700">Pagamento Confirmado!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatBRL(generatedQr?.amount ?? 0)} recebido com sucesso
                        </p>
                        {isSandbox && (
                          <Badge variant="outline" className="mt-2 border-yellow-400 text-yellow-600">
                            Simulado — Sandbox
                          </Badge>
                        )}
                      </div>
                      <Button onClick={handleReset} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Nova Cobrança
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuração PIX</CardTitle>
                <CardDescription>Status atual do módulo de pagamentos PIX</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {configQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando configuração...</p>
                ) : config ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Chave PIX configurada</span>
                      <Badge className={config.configured ? "bg-green-600" : "bg-red-500"}>
                        {config.configured ? "Sim" : "Não"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tipo da chave</span>
                      <span className="font-medium uppercase">{config.keyType ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Recebedor</span>
                      <span className="font-medium">{config.receiverName}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Cidade</span>
                      <span className="font-medium">{config.receiverCity}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Modo</span>
                      <Badge
                        variant="outline"
                        className={
                          config.sandbox
                            ? "border-yellow-400 text-yellow-600"
                            : "border-green-400 text-green-700"
                        }
                      >
                        {config.sandbox ? "Sandbox" : "Produção"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">Erro ao carregar configuração.</p>
                )}

                <div className="rounded-lg border bg-muted/40 p-4 text-xs text-muted-foreground space-y-1 mt-4">
                  <p className="font-medium text-foreground mb-2">Como configurar para produção:</p>
                  <p>1. Defina <code>PIX_KEY</code> com sua chave PIX no servidor</p>
                  <p>2. Defina <code>PIX_RECEIVER_NAME</code> com seu nome (máx. 25 chars)</p>
                  <p>3. Defina <code>PIX_RECEIVER_CITY</code> com sua cidade (máx. 15 chars)</p>
                  <p>4. Defina <code>PIX_SANDBOX=false</code> para ativar modo produção</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
