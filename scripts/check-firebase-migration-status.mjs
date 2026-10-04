import { runNoFirebaseAudit } from "./check-no-firebase.mjs";

// Informational migration gate: this deliberately succeeds while legacy reads
// are being retired. CI can switch to audit:no-firebase only at final cutover.
const { violations } = runNoFirebaseAudit();
const runtime = violations.filter((entry) => entry.startsWith("src/"));
const tooling = violations.filter((entry) => !entry.startsWith("src/"));
console.log(JSON.stringify({ status: runtime.length ? "migration-pending" : "ready-for-cutover", runtimeReferences: runtime, toolingReferences: tooling }, null, 2));
