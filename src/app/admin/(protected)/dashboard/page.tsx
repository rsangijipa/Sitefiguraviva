import { KpiService } from "@/lib/analytics/kpi-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Activity,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { EngagementChart } from "@/components/admin/analytics/EngagementChart";

export default async function AdminDashboardPage() {
  const kpis = await KpiService.getDashboardMetrics();
  const engagementData = await KpiService.getEngagementData();

  return (
    <div className="space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-serif text-stone-800">Visão Geral</h1>
        <p className="text-stone-500">
          Monitoramento em tempo real do ecossistema.
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Enrollments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Matrículas ativas no momento
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Média de progresso dos alunos
            </p>
          </CardContent>
        </Card>

        {/* Revenue (Est) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Estimada
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {kpis.totalRevenue.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em ticket médio
            </p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card
          className={
            kpis.systemHealth.status === "drift_detected"
              ? "border-red-200 bg-red-50"
              : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saúde do Sistema
            </CardTitle>
            {kpis.systemHealth.status === "drift_detected" ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {kpis.systemHealth.status === "drift_detected"
                ? "Drift Detectado"
                : "Saudável"}
            </div>
            <p className="text-xs text-muted-foreground">
              Última verificação:{" "}
              {kpis.systemHealth.lastReconciled
                ? kpis.systemHealth.lastReconciled.toLocaleDateString()
                : "Nunca"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <EngagementChart data={engagementData} />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.systemHealth.status === "drift_detected" ? (
                <div className="flex items-center gap-2 p-3 bg-white rounded border border-red-100 shadow-sm">
                  <AlertTriangle size={16} className="text-red-500" />
                  <div className="text-sm">
                    <p className="font-bold text-red-800">
                      Inconsistência de Dados
                    </p>
                    <p className="text-red-600">
                      Execute o script de reconciliação.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-stone-500 italic">
                  Nenhum alerta crítico.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
