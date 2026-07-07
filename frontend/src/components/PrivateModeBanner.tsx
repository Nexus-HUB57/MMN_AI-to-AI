import { AlertTriangle } from "lucide-react";

export function PrivateModeBanner() {
  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3 text-amber-200 text-xs sm:text-sm">
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          <strong>Nexus Affil&apos;IA&apos;te · Modo Convite Privado</strong> · Sistema em auditoria pós-Go Live inicial.
          Cadastros externos temporariamente pausados enquanto a jornada real do afiliado é validada ponta-a-ponta.
          Fundadores autorizados: acessem via link direto.
        </span>
      </div>
    </div>
  );
}
