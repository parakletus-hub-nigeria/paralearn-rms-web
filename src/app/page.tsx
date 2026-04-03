"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/landingpage/page";
import { extractSubdomainFromURL } from "@/lib/subdomainManager";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Detect subdomain on the client side
    const detected = extractSubdomainFromURL();
    setSubdomain(detected);

    // 2. Redirection logic
    if (detected) {
      const lower = detected.toLowerCase();
      // If it's a known non-tenant subdomain, stay on landing
      if (lower === "www") {
        setLoading(false);
      }
      // If it's SabiNote, show specialized landing (don't redirect to signin immediately)
      else if (lower === "sabinote") {
        setLoading(false);
      }
      // If it's a school subdomain (e.g. brightfuture.pln.ng or testschool.localhost)
      // Redirect to signin directly
      else {
        router.replace(routespath.SIGNIN);
      }
    } else {
      // Root domain (e.g. pln.ng or localhost:3000)
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  // Render specialised SabiNote landing
  if (subdomain?.toLowerCase() === "sabinote") {
    return <SabiNoteLanding />;
  }

  // Render general platform landing
  return <LandingPage />;
}
