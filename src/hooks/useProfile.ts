import { useState, useEffect } from "react";
import { getProfile } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  role: string | null;
  created_at: string;
}

export function useProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    getProfile(user.id).then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, [user, authLoading]);

  return { profile, loading };
}
