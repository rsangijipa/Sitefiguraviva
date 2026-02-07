/**
 * Feature Flags System
 * 
 * Simple, environment-based feature toggles.
 * To enable a feature, set NEXT_PUBLIC_FEATURE_NAME=true in .env
 */

export const FEATURES = {
    // Example features - add new ones here
    NEW_GALLERY_FLOW: 'NEW_GALLERY_FLOW',
    MAINTENANCE_MODE: 'MAINTENANCE_MODE',
    DEBUG_TELEMETRY: 'DEBUG_TELEMETRY',
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Checks if a feature is enabled.
 * Works checking for 'true' string in appropriate env var.
 */
export function isFeatureEnabled(key: FeatureKey): boolean {
    const envKey = `NEXT_PUBLIC_FEATURE_${key}`;

    // Safety check for window/browser environment
    if (typeof window !== 'undefined') {
        // on client, we rely on Next.js public env injection
        return process.env[envKey] === 'true';
    }

    // on server, regular process.env works
    return process.env[envKey] === 'true';
}

/**
 * Hook-like helper for components (can be expanded to a real hook if we add logic)
 */
export function useFeature(key: FeatureKey) {
    return isFeatureEnabled(key);
}
