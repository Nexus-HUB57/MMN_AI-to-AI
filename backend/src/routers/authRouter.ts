import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as llm from "./llm";
import { dashboardRouter } from "./dashboardRouter";
import { mmnRouter } from "../services/mmn";

// ============ AGENTS ROUTER ============

const agentsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input || {};
      return db.listAgents(limit, offset);
    }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const agent = await db.getAgentById(input);
    if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
    const skills = await db.getAgentSkills(input);
    return { ...agent, skills };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        specialization: z.string(),
        dna: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const agent = await db.createAgent({
        name: input.name,
        specialization: input.specialization,
        dna: input.dna,
        status: "active",
        reputation: "0",
      });

      await db.logAudit(ctx.user.id, "CREATE_AGENT", "agents", undefined, { agentName: input.name });

      return agent;
    }),

  updateVitals: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        brainPulse: z.string(),
        energy: z.string(),
        creativity: z.string(),
        focus: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const agent = await db.getAgentById(input.agentId);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

      const vital = {
        brainPulse: input.brainPulse,
        energy: input.energy,
        creativity: input.creativity,
        focus: input.focus,
      };
      await db.recordAgentVital(input.agentId, vital);

      await db.logAudit(ctx.user.id, "UPDATE_VITALS", "agent_vitals", input.agentId, {
        brainPulse: input.brainPulse,
      });

      return { success: true };
    }),

  getVitalsHistory: publicProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return db.getAgentVitalsHistory(input.agentId, input.limit);
    }),

  addSkill: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        skill: z.string(),
        proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const agent = await db.getAgentById(input.agentId);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

      await db.addAgentSkill(input.agentId, input.skill, input.proficiency);

      await db.logAudit(ctx.user.id, "ADD_SKILL", "agent_skills", input.agentId, {
        skill: input.skill,
      });

      return { success: true };
    }),

  analyze: protectedProcedure.input(z.number()).query(async ({ input }) => {
    const agent = await db.getAgentById(input);
    if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

    const skills = await db.getAgentSkills(input);
    const vitalsHistory = await db.getAgentVitalsHistory(input, 1);
    const recentVitals = vitalsHistory[0];

    const analysis = await llm.analyzeAgentBehavior({
      name: agent.name,
      specialization: agent.specialization,
      reputation: agent.reputation,
      skills: skills.map((s) => ({ skill: s.skill, proficiency: s.proficiency })),
      recentVitals: recentVitals
        ? {
            brainPulse: recentVitals.brainPulse,
            energy: recentVitals.energy,
            creativity: recentVitals.creativity,
            focus: recentVitals.focus,
          }
        : undefined,
    });

    return analysis;
  }),

  fuseAgents: protectedProcedure
    .input(
      z.object({
        agent1Id: z.number(),
        agent2Id: z.number(),
        mutationFocus: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const agent1 = await db.getAgentById(input.agent1Id);
      const agent2 = await db.getAgentById(input.agent2Id);

      if (!agent1 || !agent2) throw new TRPCError({ code: "NOT_FOUND", message: "One or both agents not found" });

      const fusedAgent = await llm.dnafusion(
        { name: agent1.name, specialization: agent1.specialization, dna: agent1.dna as Record<string, any> },
        { name: agent2.name, specialization: agent2.specialization, dna: agent2.dna as Record<string, any> },
        input.mutationFocus
      );

      const newAgent = await db.createAgent({
        name: fusedAgent.name,
        specialization: fusedAgent.specialization,
        dna: fusedAgent.dna,
        status: "active",
        reputation: "50",
      });

      await db.logAudit(ctx.user.id, "DNA_FUSION", "agents", undefined, {
        parent1: agent1.name,
        parent2: agent2.name,
        newAgent: fusedAgent.name,
      });

      return newAgent;
    }),
});

// ============ STARTUPS ROUTER ============

const startupsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input || {};
      return db.listStartups(limit, offset);
    }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const startup = await db.getStartupById(input);
    if (!startup) throw new TRPCError({ code: "NOT_FOUND", message: "Startup not found" });
    return startup;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        leadAgentId: z.number(),
        collaborators: z.array(z.number()).default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startup = await db.createStartup({
        name: input.name,
        description: input.description,
        leadAgentId: input.leadAgentId,
        status: "ideation",
        vitals: { momentum: 0, viability: 0, teamStrength: 0 },
        collaborators: input.collaborators,
        fundingRaised: "0",
      });

      await db.logAudit(ctx.user.id, "CREATE_STARTUP", "startups", undefined, { startupName: input.name });

      return startup;
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ideation", "development", "beta", "launched", "archived"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startup = await db.getStartupById(input.id);
      if (!startup) throw new TRPCError({ code: "NOT_FOUND", message: "Startup not found" });

      await db.updateStartupStatus(input.id, input.status);

      await db.logAudit(ctx.user.id, "UPDATE_STARTUP_STATUS", "startups", input.id, {
        status: input.status,
      });

      return { success: true };
    }),

  analyze: protectedProcedure.input(z.number()).query(async ({ input }) => {
    const startup = await db.getStartupById(input);
    if (!startup) throw new TRPCError({ code: "NOT_FOUND", message: "Startup not found" });

    const analysis = await llm.analyzeStartupPerformance({
      name: startup.name,
      description: startup.description || "",
      status: startup.status,
      fundingRaised: startup.fundingRaised,
      collaborators: (startup.collaborators as any[]).length || 0,
      vitals: startup.vitals as any,
    });

    return analysis;
  }),
});

// ============ MISSIONS ROUTER ============

const missionsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input || {};
      return db.listMissions(limit, offset);
    }),

  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const mission = await db.getMissionById(input);
    if (!mission) throw new TRPCError({ code: "NOT_FOUND", message: "Mission not found" });
    return mission;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        requiredSkills: z.array(z.string()),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        reward: z.string().default("0"),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const mission = await db.createMission({
        title: input.title,
        description: input.description,
        requiredSkills: input.requiredSkills,
        creatorAgentId: ctx.user.id,
        status: "open",
        priority: input.priority,
        reward: input.reward,
        dueDate: input.dueDate,
      });

      await db.logAudit(ctx.user.id, "CREATE_MISSION", "missions", undefined, {
        missionTitle: input.title,
      });

      return mission;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "assigned", "in_progress", "completed", "failed"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const mission = await db.getMissionById(input.id);
      if (!mission) throw new TRPCError({ code: "NOT_FOUND", message: "Mission not found" });

      await db.updateMissionStatus(input.id, input.status);

      await db.logAudit(ctx.user.id, "UPDATE_MISSION_STATUS", "missions", input.id, {
        status: input.status,
      });

      return { success: true };
    }),
});

// ============ FUNDING ROUTER ============

const fundingRouter = router({
  listRequests: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input || {};
      return db.listFundingRequests(limit, offset);
    }),

  requestFunds: protectedProcedure
    .input(
      z.object({
        startupId: z.number(),
        requestedAmount: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const startup = await db.getStartupById(input.startupId);
      if (!startup) throw new TRPCError({ code: "NOT_FOUND", message: "Startup not found" });

      await db.createFundingRequest({
        startupId: input.startupId,
        requestedAmount: input.requestedAmount,
        description: input.description,
        status: "pending",
      });

      await db.logAudit(ctx.user.id, "REQUEST_FUNDING", "funding_requests", input.startupId, {
        startupId: input.startupId,
        amount: input.requestedAmount,
      });

      return { success: true };
    }),

  approveFunding: adminProcedure
    .input(
      z.object({
        fundingRequestId: z.number(),
        approvedAmount: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const request = await db.getFundingRequestById(input.fundingRequestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Funding request not found" });

      await db.approveFundingRequest(input.fundingRequestId, input.approvedAmount, ctx.user.id);

      const startup = await db.getStartupById(request.startupId);
      if (!startup) throw new TRPCError({ code: "NOT_FOUND", message: "Startup not found" });

      // Create notification for startup lead
      // Note: In a real app, we'd get the lead agent's user ID
      // For now, we'll skip this notification

      await db.logAudit(ctx.user.id, "APPROVE_FUNDING", "funding_requests", input.fundingRequestId, {
        approvedAmount: input.approvedAmount,
      });

      return { success: true };
    }),

  allocateFunds: adminProcedure
    .input(
      z.object({
        fundingRequestId: z.number(),
        amount: z.string(),
        walletAddress: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const request = await db.getFundingRequestById(input.fundingRequestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Funding request not found" });

      if (request.status !== "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Funding request must be approved first" });
      }

      await db.createFundingAllocation({
        fundingRequestId: input.fundingRequestId,
        amount: input.amount,
        walletAddress: input.walletAddress,
        status: "pending",
      });

      await db.logAudit(ctx.user.id, "ALLOCATE_FUNDS", "funding_allocations", input.fundingRequestId, {
        amount: input.amount,
        walletAddress: input.walletAddress,
      });

      return { success: true };
    }),

  broadcastTransaction: adminProcedure
    .input(
      z.object({
        allocationId: z.number(),
        txHex: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // This would integrate with mempool.space API
      // For now, we'll just update the status
      await db.updateAllocationStatus(input.allocationId, "broadcasted");

      await db.logAudit(ctx.user.id, "BROADCAST_TX", "funding_allocations", input.allocationId, {
        txHex: input.txHex.substring(0, 20) + "...",
      });

      return { success: true };
    }),
});

// ============ COMMUNICATIONS ROUTER ============

const communicationsRouter = router({
  postMoltbook: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const agent = await db.getAgentById(input.agentId);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

      const post = await db.postCommunication(input.agentId, "moltbook", input.content, {
        timestamp: new Date(),
        reactions: [],
      });

      await db.logAudit(ctx.user.id, "POST_MOLTBOOK", "agent_communications", input.agentId, {
        contentPreview: input.content.substring(0, 100),
      });

      return { success: true };
    }),

  postGnox: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        content: z.string(),
        encrypted: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const agent = await db.getAgentById(input.agentId);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });

      const post = await db.postCommunication(input.agentId, "gnox", input.content, {
        encrypted: input.encrypted,
        timestamp: new Date(),
      });

      await db.logAudit(ctx.user.id, "POST_GNOX", "agent_communications", input.agentId, {
        encrypted: input.encrypted,
      });

      return { success: true };
    }),

  getFeed: publicProcedure
    .input(
      z
        .object({
          type: z.enum(["moltbook", "gnox", "alert"]).optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { type, limit = 50, offset = 0 } = input || {};
      return db.getFeed(limit, offset, type);
    }),
});

// ============ TELEMETRY ROUTER ============

const telemetryRouter = router({
  recordMetric: protectedProcedure
    .input(
      z.object({
        metric: z.enum(["rRPC_Core", "Sigma_Sync", "DeFAI_Link", "Burn_Engine"]),
        value: z.string(),
        status: z.enum(["nominal", "active", "warning", "critical"]).default("nominal"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.recordNetworkTelemetry(input.metric, input.value, input.status);

      await db.logAudit(ctx.user.id, "RECORD_METRIC", "network_telemetry", undefined, {
        metric: input.metric,
        value: input.value,
      });

      return { success: true };
    }),

  getMetricsHistory: publicProcedure
    .input(
      z.object({
        metric: z.enum(["rRPC_Core", "Sigma_Sync", "DeFAI_Link", "Burn_Engine"]),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      return db.getNetworkTelemetryHistory(input.metric, input.limit);
    }),

  recordBrainPulse: protectedProcedure
    .input(
      z.object({
        averageBrainPulse: z.string(),
        averageEnergy: z.string(),
        averageCreativity: z.string(),
        totalAgents: z.number(),
        activeAgents: z.number(),
        totalMissions: z.number(),
        completedMissions: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.recordBrainPulse({
        averageBrainPulse: input.averageBrainPulse,
        averageEnergy: input.averageEnergy,
        averageCreativity: input.averageCreativity,
        totalAgents: input.totalAgents,
        activeAgents: input.activeAgents,
        totalMissions: input.totalMissions,
        completedMissions: input.completedMissions,
      });

      return { success: true };
    }),

  getBrainPulseHistory: publicProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 100;
      return db.getBrainPulseHistory(limit);
    }),
});

// ============ MAIN ROUTER ============

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const COOKIE_NAME = "app_session_id";
      (ctx.res as any).clearCookie(COOKIE_NAME, {
        secure: true,
        sameSite: "none",
        httpOnly: true,
        path: "/",
      });
      return { success: true } as const;
    }),
  }),

  agents: agentsRouter,
  startups: startupsRouter,
  missions: missionsRouter,
  funding: fundingRouter,
  communications: communicationsRouter,
  telemetry: telemetryRouter,
  dashboard: dashboardRouter,
  mmn: mmnRouter,
});

export type AppRouter = typeof appRouter;
