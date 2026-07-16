import { Link } from "wouter";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

/**
 * Recuperação de acesso segura: não enumera contas e não simula envio de e-mail.
 * Até existir provedor SMTP transacional configurado, abre solicitação por e-mail
 * de suporte com o endereço informado pelo usuário.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);
  const subject = encodeURIComponent("Recuperação de acesso · Nexus Affil'IA'te");
  const body = encodeURIComponent(`Solicito recuperação de acesso para o e-mail: ${email.trim().toLowerCase()}`);
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-4 text-white">
      <Card className="w-full max-w-md border-white/10 bg-slate-900 p-7 shadow-2xl">
        <KeyRound className="h-8 w-8 text-cyan-300" />
        <h1 className="mt-4 text-2xl font-bold">Recuperar acesso</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">Informe o e-mail cadastrado. A solicitação será encaminhada ao suporte sem revelar se existe uma conta associada.</p>
        <div className="mt-6 space-y-3">
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com" className="border-white/15 bg-black/20 text-white" />
          <Button className="w-full" disabled={!email.includes("@")} onClick={() => setRequested(true)}><Mail className="mr-2 h-4 w-4" /> Solicitar recuperação</Button>
        </div>
        {requested && <div className="mt-4 rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm text-cyan-100">Solicitação preparada. <a className="font-semibold underline" href={`mailto:suporte@nexus-saas.com.br?subject=${subject}&body=${body}`}>Abrir e-mail para suporte</a></div>}
        <Link href="/login"><Button variant="ghost" className="mt-5 px-0 text-slate-300 hover:bg-transparent hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao login</Button></Link>
      </Card>
    </main>
  );
}
