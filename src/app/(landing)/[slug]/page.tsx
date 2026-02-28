import { notFound } from "next/navigation";
import { LANDING_SUBPAGES } from "@/components/landingpage/subpages";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LandingSubPage({ params }: PageProps) {
  const { slug } = await params;
  const Page = LANDING_SUBPAGES[slug];
  if (!Page) notFound();
  return <Page />;
}
