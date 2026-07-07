export class NikoSandbox {
  static async status() {
    return { active: true, sandbox: 'niko-sandbox', operations: 0, memory: 0, source: 'stub' };
  }
  static async recall(_limit = 20) {
    return { total: 0, memories: [], source: 'stub' };
  }
  static async remember(_input: any) {
    return { ok: true, saved: false, source: 'stub' };
  }
  static async currentBalance() {
    return { balanceBRL: 0, balanceBTC: 0, availableForOps: 0, source: 'stub' };
  }
  static async listTransactions(_limit = 20) {
    return { total: 0, transactions: [], source: 'stub' };
  }
  static async execute(_op: any) {
    return { ok: false, reason: 'stub', source: 'stub' };
  }
}
