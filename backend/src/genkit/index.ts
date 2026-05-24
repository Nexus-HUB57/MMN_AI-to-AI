import "dotenv/config";

console.log("[genkit] Bootstrap placeholder ativo.");
console.log("[genkit] Nenhum flow registrado ainda. Próxima etapa: religar genkit-integration.ts ao runtime.");

setInterval(() => {
  console.log(`[genkit] heartbeat ${new Date().toISOString()}`);
}, 60000);
