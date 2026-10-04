import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PublicSiteFrame from "@/features/public-site/components/PublicSiteFrame";
import ResourcesSection from "@/components/ResourcesSection";
import { resourceCatalog, resolveResourceSlug } from "@/components/resources/resourceCatalog";

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = resolveResourceSlug(slug);
  const resource = resourceCatalog.find((item) => item.slug === canonicalSlug);

  if (!resource || resource.status !== "available") return {};

  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: `/recursos/${resource.slug}` },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const canonicalSlug = resolveResourceSlug(slug);
  const resource = resourceCatalog.find((item) => item.slug === canonicalSlug);

  if (canonicalSlug !== slug) redirect(`/recursos/${canonicalSlug}`);

  // Retired and unimplemented resources are no longer published.
  if (!resource || resource.status !== "available") notFound();

  return (
    <PublicSiteFrame>
      <ResourcesSection initialActiveSlug={resource.slug} />
    </PublicSiteFrame>
  );
}
