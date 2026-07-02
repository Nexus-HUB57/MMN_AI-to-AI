/**
 * meetingRouter — Nexus AffilIAte
 * Stub tRPC · Owner: Helena Nexus (CMO/AI)
 * TODO(D24): Implementação completa com meeting_signals
 */
import { z } from "zod";
import { publicProcedure, router } from "../config/trpc";

export const meetingRouter = router({
  listSignals: publicProcedure
    .input(z.object({}).optional())
    .query(async () => {
      // Placeholder: retorna sinais C-level estáticos
      return {
        signals: [
          { role: "ceo", status: "active" },
          { role: "cfo", status: "active" },
          { role: "cmo", status: "active" },
          { role: "coo", status: "active" },
          { role: "cpo", status: "active" },
          { role: "cto", status: "active" },
        ],
      };
    }),

  health: publicProcedure.query(() => ({ ok: true, service: "meetings" })),
});
