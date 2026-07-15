import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, upsertProfile, getProfile } from "@/lib/supabase";
import { db } from "@/lib/db";
import { Music } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Authenticating — Kalakshetra" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      try {
        if (!supabase) {
          navigate({ to: "/login" });
          return;
        }

        // ── Step 1: Wait for session from Supabase Client ──────────────────
        // The Supabase SDK automatically handles hash/code parsing asynchronously.
        // We read it, and if not present, listen to auth state changes until it's set.
        let session = (await supabase.auth.getSession()).data.session;

        if (!session && active) {
          // Wait up to 3 seconds for the client to parse the URL and trigger auth change
          session = await new Promise((resolve) => {
            const timeout = setTimeout(() => {
              subscription.unsubscribe();
              resolve(null);
            }, 3000);

            const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, currentSession) => {
              if (currentSession) {
                clearTimeout(timeout);
                subscription.unsubscribe();
                resolve(currentSession);
              }
            });
          });
        }

        if (!active) return;

        if (!session) {
          setStatus("error");
          setErrorMsg("Authentication failed. Session could not be established. Please try logging in again.");
          return;
        }

        // ── Step 2: Link Supabase user to localStorage account ──────────────
        const email = session.user.email || "";
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          email.split("@")[0];

        const account = db.linkSupabaseUserToAccount(email, name, session.user.id);

        // Upsert profile row (non-blocking)
        getProfile(session.user.id)
          .then((existing) => {
            if (!existing) upsertProfile(session.user.id, { full_name: name });
          })
          .catch(() => {});

        // ── Step 3: Check Supabase for existing workspaces (Chrome fix) ─────
        const TABLES = [
          { table: "artist_applications",           role: "artist",           nameField: "name" },
          { table: "band_applications",             role: "band",             nameField: "band_name" },
          { table: "venue_applications",            role: "venue",            nameField: "venue_name" },
          { table: "production_house_applications", role: "production_house", nameField: "company_name" },
          { table: "volunteer_applications",        role: "volunteer",        nameField: "name" },
          { table: "influencer_applications",       role: "influencer",       nameField: "name" },
          { table: "sponsor_applications",          role: "sponsor",          nameField: "company_name" },
          { table: "event_manager_applications",    role: "event_manager",    nameField: "company_name" },
        ];

        let foundProfile = account.workspaces && account.workspaces.length > 0;

        try {
          const results = await Promise.all(
            TABLES.map(({ table, role, nameField }) =>
              supabase!
                .from(table)
                .select("id, " + nameField)
                .eq("contact_email", email)
                .maybeSingle()
                .then((res) => ({ data: res?.data as any, role, nameField }))
                .catch(() => ({ data: null, role, nameField }))
            )
          );

          for (const { data, role, nameField } of results) {
            if (data?.id) {
              const displayName = data[nameField] || name;
              db.addWorkspaceToAccount(account.id, role, data.id, displayName);
              foundProfile = true;
              break;
            }
          }
        } catch (e) {
          console.warn("Error looking up existing profiles in Supabase", e);
        }

        // ── Step 4: Navigate ────────────────────────────────────────────────
        if (foundProfile) {
          navigate({ to: "/dashboard" });
        } else {
          navigate({ to: "/onboarding" });
        }
      } catch (err: any) {
        if (active) {
          setStatus("error");
          setErrorMsg(err?.message || "Something went wrong. Please try again.");
        }
      }
    }

    handleCallback();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
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
