import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, upsertProfile, getProfile } from "@/lib/supabase";
import { db } from "@/lib/db";
import { Music } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Authenticating � Kalakshetra" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!supabase) {
          navigate({ to: "/login" });
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          setStatus("error");
          setErrorMsg(error?.message || "Authentication failed. Please try again.");
          return;
        }

        const email = session.user.email || "";
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          email.split("@")[0];

        // Link the Supabase-authenticated user to the localStorage account system
        const account = db.linkSupabaseUserToAccount(email, name, session.user.id);

        // Create a profiles row for OAuth users who don't have one yet
        try {
          const existing = await getProfile(session.user.id);
          if (!existing) {
            await upsertProfile(session.user.id, { full_name: name });
          }
        } catch {
          // Non-critical — proceed to redirect regardless
        }

        // --- Key fix: check Supabase for an existing artist/band record by email ---
        // This ensures the same user on any device/browser gets linked to their profile
        const TABLES = [
          { table: "artist_applications", role: "artist", nameField: "name" },
          { table: "band_applications",   role: "band",   nameField: "band_name" },
          { table: "venue_applications",  role: "venue",  nameField: "venue_name" },
          { table: "production_house_applications", role: "production_house", nameField: "company_name" },
          { table: "volunteer_applications",        role: "volunteer",        nameField: "name" },
          { table: "influencer_applications",       role: "influencer",       nameField: "name" },
          { table: "sponsor_applications",          role: "sponsor",          nameField: "company_name" },
          { table: "event_manager_applications",    role: "event_manager",    nameField: "company_name" },
        ];

        let foundProfile = false;
        for (const { table, role, nameField } of TABLES) {
          try {
            const { data } = await supabase
              .from(table)
              .select("id, " + nameField)
              .eq("contact_email", email)
              .maybeSingle();

            if (data?.id) {
              const displayName = data[nameField] || name;
              // Auto-link workspace so dashboard shows correctly on this device
              if (!account.workspaces.some((w: any) => w.id === data.id)) {
                db.addWorkspaceToAccount(account.id, role, data.id, displayName);
              }
              foundProfile = true;
              break;
            }
          } catch {
            // table might not exist, continue
          }
        }

        // Redirect: if they have a workspace (locally or just found in Supabase), go to dashboard
        const freshAccount = db.getCurrentAccount();
        if (freshAccount?.workspaces && freshAccount.workspaces.length > 0) {
          navigate({ to: "/dashboard" });
        } else {
          // No profile found anywhere — send to onboarding to pick role and register
          navigate({ to: "/onboarding" });
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || "Something went wrong.");
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Music size={20} className="text-primary-glow" />
          </div>
          <span className="text-lg font-display font-bold text-white">Kalakshetra</span>
        </div>

        {status === "loading" ? (
          <>
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Authenticating your account</p>
              <p className="text-xs text-muted-foreground">Please wait while we set up your workspace...</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-red-400">{errorMsg}</p>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md text-xs font-bold"
            >
              Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
