import { PortalResourcePage } from "@/features/interactive-resources/v2/portal-page.server";
import type { Metadata } from "next";
export const metadata:Metadata={title:"Sons para Awareness",robots:{index:false,follow:false},alternates:{canonical:"/portal/recursos/sons-para-awareness"}};
export default function SoundsPage({searchParams}:{searchParams:Promise<{modo?:string;previa?:string;versao?:string}>}) { return PortalResourcePage({params:Promise.resolve({slug:"sons-para-awareness"}),searchParams}); }
