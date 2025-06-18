"use client";

import { supabaseClient } from "@/shared/api/supabaseBrowserClient";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface CustomUser extends User {
  isAdmin?: boolean;
}

export function useSession() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("useSession useEffect ran.");

    const getInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error);
      }
      if (session?.user) {
        // Fetch isAdmin status from our 'profiles' table
        const { data: userData, error: userError } = await supabaseClient
          .from("profiles")
          .select("isAdmin")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          // Если ошибка PGRST116 (нет строки), считаем обычным пользователем
          if (userError.code === "PGRST116") {
            setUser({ ...session.user, isAdmin: false });
          } else {
            console.error("Error fetching isAdmin status:", userError);
            setUser(session.user); // fallback
          }
        } else if (userData) {
          setUser({ ...session.user, isAdmin: userData.isAdmin });
        } else {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session);
        if (session?.user) {
          const { data: userData, error: userError } = await supabaseClient
            .from("profiles")
            .select("isAdmin")
            .eq("id", session.user.id)
            .single();

          if (userError) {
            if (userError.code === "PGRST116") {
              setUser({ ...session.user, isAdmin: false });
            } else {
              console.error(
                "Error fetching isAdmin status on auth change:",
                userError
              );
              setUser(session.user);
            }
          } else if (userData) {
            setUser({ ...session.user, isAdmin: userData.isAdmin });
          } else {
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
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
