/**
 * Compatibility boundary while legacy UI timestamp consumers are migrated to
 * ISO strings. Keeping this local prevents shared domain types from pulling
 * the Firebase SDK into the application bundle.
 */
export type Timestamp = any;
