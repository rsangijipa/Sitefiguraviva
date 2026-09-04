import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or Supabase Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const targetId = process.argv[2] || "0a837dc2-7162-420c-82d4-acc204a6f721";
const targetEmail = process.argv[3] || "liliangusmao@figuraviva.com";

async function setAdmin() {
  console.log(`Setting admin role for ${targetEmail} (${targetId})...`);

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: targetId,
      email: targetEmail,
      display_name: "Lilian Gusmão",
      role: "admin",
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error("❌ Failed to update profile role in Supabase:", error);
    process.exit(1);
  }

  console.log(`✅ Success! Profile ${targetEmail} (${targetId}) is now an admin:`, data);
}

setAdmin().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
