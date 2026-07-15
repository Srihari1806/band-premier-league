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
    async function handleCallback() {
      try {
        if (!supabase) {
          navigate({ to: "/login" });
          return;
        }

        // ── Step 1: Exchange the OAuth code for a session ──────────────────
        // With PKCE flow (detectSessionInUrl: true), the callback URL has
        // ?code=… which must be exchanged. getSession() alone can be too early.
        let session: any = null;

        const params = new URLSearchParams(window.location.search);
        
        // Parse hash params in case of implicit flow errors or redirects
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1) // remove the leading '#'
        );

        // Check for error parameters in query or hash
        const urlError = params.get("error") || hashParams.get("error");
        const urlErrorDesc = params.get("error_description") || hashParams.get("error_description");
        const urlErrorCode = params.get("error_code") || hashParams.get("error_code");

        if (urlError) {
          setStatus("error");
          setErrorMsg(`Supabase Auth Error: ${urlErrorDesc || urlError} (Code: ${urlErrorCode || "unknown"})`);
          return;
        }

        const code = params.get("code");

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus("error");
            setErrorMsg(`Code Exchange Error: ${error.message}`);
            return;
          }
          session = data.session;
        } else {
          // Implicit / already-exchanged flow — just read existing session
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            setStatus("error");
            setErrorMsg(`Get Session Error: ${error.message}`);
            return;
          }
          session = data.session;
        }

        // If session still null, listen to auth state changes briefly (in case SDK is processing hash in BG)
        if (!session) {
          session = await new Promise((resolve) => {
            const timeout = setTimeout(() => {
              subscription.unsubscribe();
              resolve(null);
            }, 2500);

            const { data: { subscription } } = supabase!.auth.onAuthStateChange((event, currentSession) => {
              if (currentSession) {
                clearTimeout(timeout);
                subscription.unsubscribe();
                resolve(currentSession);
              }
            });
          });
        }

        // Final check
        if (!session) {
          setStatus("error");
          const searchDebug = window.location.search ? `Query: ${window.location.search}` : "No query parameters";
          const hashDebug = window.location.hash ? `Hash: ${window.location.hash.substring(0, 100)}...` : "No hash parameters";
          setErrorMsg(`Authentication failed. Session could not be established.\nDebug: ${searchDebug} | ${hashDebug}`);
          return;
        }


        // ── Step 2: Link Supabase user to local account system ─────────────
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

        // ── Step 3: Check all tables in parallel for an existing profile ────
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

        // Start with workspaces already in localStorage as the baseline
        let foundProfile = account.workspaces && account.workspaces.length > 0;

        const results = await Promise.all(
          TABLES.map(({ table, role, nameField }) =>
            Promise.resolve(
              supabase!
                .from(table)
                .select("id, " + nameField)
                .eq("contact_email", email)
                .maybeSingle()
            )
              .then((res) => ({ data: res.data as any, role, nameField }))
              .catch(() => ({ data: null as any, role, nameField }))
          )
        );

        for (const { data, role, nameField } of results) {
          if (data?.id) {
            const displayName = (data as any)[nameField] || name;
            db.addWorkspaceToAccount(account.id, role, data.id, displayName);
            foundProfile = true;
            break;
          }
        }

        // ── Step 4: Redirect ───────────────────────────────────────────────
        if (foundProfile) {
          navigate({ to: "/dashboard" });
        } else {
          navigate({ to: "/onboarding" });
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || "Something went wrong. Please try again.");
      }
    }

    handleCallback();
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
