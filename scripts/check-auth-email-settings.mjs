import dotenv from "dotenv";
import { validateSupabaseKey } from "../src/infrastructure/supabase/environment.js";
dotenv.config({path:[".env.local",".env"],quiet:true});
// Read-only public Auth settings. Never prints keys or uses service_role.
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
try {
  if(!url||!key)throw new Error("Configure the public Supabase URL and key.");
  validateSupabaseKey(url,key,"public");
  const response=await fetch(new URL("/auth/v1/settings",url),{headers:{apikey:key},signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error("Auth settings HTTP "+response.status);
  const settings=await response.json();
  const result={checkedAt:new Date().toISOString(),project:new URL(url).hostname,emailEnabled:settings.external?.email===true,signupEnabled:settings.disable_signup===false,requiresEmailConfirmation:settings.mailer_autoconfirm===false};
  console.log(JSON.stringify(result,null,2));
  if(!result.emailEnabled||!result.signupEnabled||!result.requiresEmailConfirmation)process.exitCode=1;
} catch(error) {
  console.error(error.message);
  process.exitCode=1;
}
