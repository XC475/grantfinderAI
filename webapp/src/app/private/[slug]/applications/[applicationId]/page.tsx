import { ApplicationPage } from "@/components/applications/ApplicationPage";

interface ApplicationPageProps {
  params: Promise<{ slug: string; applicationId: string }>;
}

export default async function ApplicationPageRoute({
  params,
}: ApplicationPageProps) {
  const { slug, applicationId } = await params;

  return (
    <ApplicationPage applicationId={applicationId} organizationSlug={slug} />
  );
}
