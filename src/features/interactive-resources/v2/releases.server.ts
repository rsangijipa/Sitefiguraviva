import "server-only";
import { resourceDatabase } from "./database.server";
import { publishedEditorial } from "./editorial.server";
export const LEARNING_PILOTS=["laboratorio-fenomenologico","atelie-do-experimento","escuta-dialogica"] as const;
export async function releasedLearningResources():Promise<string[]> {
 try {
  const db=resourceDatabase();
  const [pilots,versions]=await Promise.all([
   db.from("resource_pilots").select("resource_key,content_version").not("passed_at","is",null),
   Promise.all(LEARNING_PILOTS.map(key=>publishedEditorial(key))),
  ]);
  if(pilots.error) return [];
  return LEARNING_PILOTS.filter((key,index)=>!!versions[index] && pilots.data?.some(pilot=>pilot.resource_key===key && pilot.content_version===versions[index]?.id));
 } catch {return [];}
}
