"use client";

import { useReportWebVitals } from "next/web-vitals";
import { telemetry } from "@/lib/telemetry";

export function WebVitalsReporter() {
    useReportWebVitals((metric) => {
        // Only log core vitals to avoid noise, or log all if debugging
        const { id, name, label, value, rating } = metric;

        // Construct a structured event for telemetry
        telemetry.track('web_vital', {
            metric_name: name,
            metric_id: id,
            metric_value: value,
            metric_rating: rating,
            metric_label: label,
        });

        // Optional: Log to console in development for immediate feedback
        if (process.env.NODE_ENV === 'development') {
            console.log(`[WebVitals] ${name}: ${value.toFixed(2)} (${rating})`);
        }
    });

    return null;
}
