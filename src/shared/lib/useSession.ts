"use client";

import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("useSession useEffect ran.");

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed:", _event, session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user;

  console.log(
    "Current useSession user:",
    user,
    "isAuthenticated:",
    isAuthenticated
  );

  return { user, isLoading, isAuthenticated };
}
