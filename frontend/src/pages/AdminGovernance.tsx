import AdminDashboardLayout from "@/pages/AdminDashboardLayout";

/**
 * AdminGovernance — Nexus AffilIAte
 * Stub inicial · Owner: Helena Nexus (CMO/AI)
 * TODO(D24): Implementação completa com integração API
 */
export default function AdminGovernance() {
  return (
    <AdminDashboardLayout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Governança Nexus
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Políticas de compliance, auditoria e conformidade regulatória.</p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 rounded-lg p-4">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            🚧 Módulo em desenvolvimento (D24). Interface completa em breve.
          </p>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
