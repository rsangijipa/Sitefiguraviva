import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/server";
import { PrivateHistory } from "@/features/interactive-resources/v2/PrivateHistory";
export const metadata:Metadata={title:"Meus registros",robots:{index:false,follow:false},alternates:{canonical:"/portal/recursos/meus-registros"}};
export default async function PrivateHistoryPage(){await requireSession("/auth?next=/portal/recursos/meus-registros");return <PrivateHistory />;}
