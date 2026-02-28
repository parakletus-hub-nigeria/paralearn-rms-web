import ResetPasswordPage from "@/components/landingpage/subLandingPage/ResetPasswordPage";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function ResetPassword({ params }: PageProps) {
  const { code } = await params;
  return <ResetPasswordPage code={code} />;
}
