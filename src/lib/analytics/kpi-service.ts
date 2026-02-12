import { adminDb } from "@/lib/firebase/admin";
import { buildAdminDashboardKPIs } from "@/lib/metrics/kpi";

export interface DashboardKPIs {
  activeEnrollments: number;
  completionRate: number;
  billingKpiStatus: "todo_stripe_integration" | "unavailable";
  systemHealth: {
    lastReconciled: Date | null;
    status: "healthy" | "drift_detected" | "unknown";
  };
}

export const KpiService = {
  async getDashboardMetrics(): Promise<DashboardKPIs> {
    try {
      const adminKpis = await buildAdminDashboardKPIs();
      if (!adminKpis.success || !adminKpis.data) {
        throw new Error(adminKpis.error || "Failed to load admin KPI core");
      }

      const activeEnrollments = Number(adminKpis.data.accessGranted || 0);

      // 2. Completion Rate (Sampled for performance or aggregate)
      const sampleSnap = await adminDb
        .collection("enrollments")
        .where("status", "in", ["active", "completed"])
        .limit(100) // Sample size
        .get();

      let totalPercent = 0;
      let count = 0;
      sampleSnap.forEach((doc) => {
        totalPercent += doc.data().progressSummary?.percent || 0;
        count++;
      });
      const completionRate = count > 0 ? Math.round(totalPercent / count) : 0;

      // 3. System Health (from Reconciliation Job)
      const healthDoc = await adminDb
        .collection("system_status")
        .doc("reconciliation_job")
        .get();
      const healthData = healthDoc.data();

      return {
        activeEnrollments,
        completionRate,
        billingKpiStatus: "todo_stripe_integration",
        systemHealth: {
          lastReconciled: healthData?.lastRun?.toDate() || null,
          status: healthData?.status || "unknown",
        },
      };
    } catch (error) {
      console.error("Failed to fetch KPIs:", error);
      return {
        activeEnrollments: 0,
        completionRate: 0,
        billingKpiStatus: "unavailable",
        systemHealth: { lastReconciled: null, status: "unknown" },
      };
    }
  },

  async getEngagementData() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const eventsSnap = await adminDb
        .collection("analytics_events")
        .where("timestamp", ">=", sevenDaysAgo)
        .get();

      const dataMap: Record<string, number> = {};

      // Initialize last 7 days with 0
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        dataMap[key] = 0;
      }

      eventsSnap.forEach((doc) => {
        const timestamp = doc.data().timestamp;
        if (!timestamp) return;

        const date = timestamp.toDate();
        const key = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        if (dataMap[key] !== undefined) {
          dataMap[key]++;
        }
      });

      // Convert map to sorted array of {name, value}
      return Object.entries(dataMap)
        .map(([name, value]) => ({ name, value }))
        .reverse();
    } catch (error) {
      console.error("Failed to fetch engagement data:", error);
      return [];
    }
  },
};
