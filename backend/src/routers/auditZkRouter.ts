import { z } from "zod";
import { router, publicProcedure } from "../config/trpc";
import { ProverService } from "../domains/audit/zk/proverService";

export const auditZkRouter = router({
  generate: publicProcedure
    .input(z.object({
      commissionId: z.string(),
      ruleSetVersion: z.string().default("v1"),
      referralPath: z.array(z.string()).max(10),
      amountCents: z.number().int().min(1),
    }))
    .mutation(async ({ input }) => {
      const stmt = { ...input, ts: Date.now() };
      const proof = ProverService.prove(stmt);
      return { ok: true, proof, statement: stmt };
    }),
  verify: publicProcedure
    .input(z.object({
      proof: z.object({
        statement: z.string(), proofHex: z.string(),
        prover: z.string(), generatedAt: z.number(),
      }),
      statement: z.object({
        commissionId: z.string(), ruleSetVersion: z.string(),
        referralPath: z.array(z.string()), amountCents: z.number(),
        ts: z.number(),
      })
    }))
    .query(({ input }) => ({ valid: ProverService.verify(input.proof, input.statement) })),
});
