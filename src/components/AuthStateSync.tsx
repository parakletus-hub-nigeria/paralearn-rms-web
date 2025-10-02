"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function AuthStateSync() {
  const { data: session } = useSession();
  const { setUser, clear } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role,
        accessToken: (session.user as any).accessToken,
      });
    } else {
      clear();
    }
  }, [session, setUser, clear]);

  return null;
}
