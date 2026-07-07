export class OttoService {
  static async getFinancialSnapshot() {
    return { mrr: 0, arr: 0, cashInBank: 0, monthlyExpenses: 0, runwayMonths: 0, pixLast24h: 0, source: 'stub' };
  }
  static async getUnitEconomics() {
    return { cac: 0, ltv: 0, ltvCacRatio: 0, paybackMonths: 0, grossMarginPct: 0, source: 'stub' };
  }
  static async getCashflowProjection(_horizonDays = 90) {
    return { horizonDays: _horizonDays, projection: [], source: 'stub' };
  }
  static async getRunwayForecast() { return await this.getCashflowProjection(); }
  static async persistDailySnapshot() {
    return { ok: true, saved: true, source: 'stub' };
  }
}
