
import { adminDb } from '@/lib/firebase/admin';

export interface DashboardKPIs {
    activeEnrollments: number;
    completionRate: number;
    totalRevenue: number; // Placeholder/Estimated
    systemHealth: {
        lastReconciled: Date | null;
        status: 'healthy' | 'drift_detected' | 'unknown';
    };
}

export const KpiService = {
    async getDashboardMetrics(): Promise<DashboardKPIs> {
        try {
            // 1. Active Enrollments
            const enrollmentsSnap = await adminDb.collection('enrollments')
                .where('status', '==', 'active')
                .count()
                .get();

            const activeEnrollments = enrollmentsSnap.data().count;

            // 2. Completion Rate (Sampled for performance or aggregate)
            // For now, let's just average the percent field of active enrollments
            // Note: In scale, this should be pre-aggregated by a cloud function trigger
            const sampleSnap = await adminDb.collection('enrollments')
                .where('status', '==', 'active')
                .limit(100) // Sample size
                .get();

            let totalPercent = 0;
            let count = 0;
            sampleSnap.forEach(doc => {
                totalPercent += (doc.data().progressSummary?.percent || 0);
                count++;
            });
            const completionRate = count > 0 ? Math.round(totalPercent / count) : 0;

            // 3. System Health (from Reconciliation Job)
            const healthDoc = await adminDb.collection('system_status').doc('reconciliation_job').get();
            const healthData = healthDoc.data();

            // 4. Revenue (Placeholder logic - replace with Stripe API or Orders collection later)
            // Assume Average Ticket ~ R$ 97
            const totalRevenue = activeEnrollments * 97;

            return {
                activeEnrollments,
                completionRate,
                totalRevenue,
                systemHealth: {
                    lastReconciled: healthData?.lastRun?.toDate() || null,
                    status: healthData?.status || 'unknown'
                }
            };

        } catch (error) {
            console.error("Failed to fetch KPIs:", error);
            return {
                activeEnrollments: 0,
                completionRate: 0,
                totalRevenue: 0,
                systemHealth: { lastReconciled: null, status: 'unknown' }
            };
        }
    }
};
