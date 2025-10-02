"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { user, clear } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    clear();
    router.push("/login");
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Welcome, {user?.name || user?.email}!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>You are logged in as: {user?.email}</p>
        <p>Your role: {user?.role}</p>
        <Button onClick={handleSignOut} className="w-full">
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
