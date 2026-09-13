import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import ResourcesSection from "@/components/ResourcesSection";
import { resourceCatalog } from "@/components/resources/resourceCatalog";

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = resourceCatalog.find((item) => item.slug === slug);

  if (!resource || resource.status !== "available") return {};

  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: `/recursos/${resource.slug}` },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = resourceCatalog.find((item) => item.slug === slug);

  // Pending resources deliberately have no route: their catalog card is informational only.
  if (!resource || resource.status !== "available") notFound();

  return (
    <PublicSiteFrame>
      <ResourcesSection initialActiveSlug={resource.slug} />
    </PublicSiteFrame>
  );
}
