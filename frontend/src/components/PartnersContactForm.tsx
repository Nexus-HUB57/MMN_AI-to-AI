import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planName: string;
  termMonths: number;
};

export default function PartnersContactForm({ open, onOpenChange, planId, planName, termMonths }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = (trpc as any)?.partnersIntake?.submitProposal?.useMutation?.();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    const payload = { planId, planName, termMonths, name, email, whatsapp, company, message, source: "subscriptions" };
    try {
      if (submit?.mutateAsync) {
        const result = await submit.mutateAsync(payload);
        setFeedback(result?.message || "Proposta registrada com sucesso. O time Nexus retornará em breve.");
      } else {
        // Fallback HTTP direto, caso o trpc client ainda não tenha o procedimento mapeado em tempo de build.
        const res = await fetch("/api/trpc/partnersIntake.submitProposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setFeedback("Proposta registrada com sucesso. O time Nexus retornará em breve.");
      }
      setName(""); setEmail(""); setWhatsapp(""); setCompany(""); setMessage("");
    } catch (err: any) {
      setFeedback("Não foi possível enviar agora. Tente novamente em instantes ou contate equipenexus@oneverso.com.br.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-white/10 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle>Solicitar proposta · {planName}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha seus dados e a equipe Nexus retornará pelos canais informados.
            Prazo selecionado: <span className="text-white">{termMonths} meses</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ppk-name">Nome completo</Label>
            <Input id="ppk-name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ppk-email">E-mail</Label>
              <Input id="ppk-email" required type="email" maxLength={180} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppk-whats">WhatsApp</Label>
              <Input id="ppk-whats" required minLength={8} maxLength={40} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 11 9 0000-0000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ppk-company">Empresa (opcional)</Label>
            <Input id="ppk-company" maxLength={160} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa ou marca" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ppk-msg">Mensagem (opcional)</Label>
            <textarea
              id="ppk-msg"
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conte rapidamente o cenário e o objetivo da proposta."
              className="min-h-[88px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            />
          </div>

          {feedback && (
            <p className="rounded border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-2 text-xs text-quantum-cyan">{feedback}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-btn" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar para equipenexus@oneverso.com.br"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
