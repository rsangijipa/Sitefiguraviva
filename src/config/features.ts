/**
 * Feature Flags Configuration
 * Allows for controlled rollout and remote kill switches.
 * Implementation follows strictly the 'Enterprise-Ready' version:
 * 1. Default local flags.
 * 2. Ability to be overridden by Firestore/Remote Config (Phase 0.1).
 */

export const FEATURE_FLAGS = {
  realtimeCommunity: true,
  audioPlayer: true,
  marketplaceTenancy: false, // In development
  retentionAnalyticsV2: false, // In development
  premiumAnimations: true,
};

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Helper to check if a feature is enabled.
 * Can be extended to check remote state.
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  // Logic to potentially check remote config can be added here
  return FEATURE_FLAGS[feature] ?? false;
}
