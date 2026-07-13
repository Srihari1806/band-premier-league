import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { 
  Instagram, 
  Youtube, 
  Music, 
  Users, 
  Play, 
  Ticket, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Award,
  Globe,
  ChevronLeft
} from "lucide-react";
import { db, type BandApplication } from "@/lib/db";
import bandImg from "@/assets/band-1.jpg";

export const Route = createFileRoute("/bands/$bandId")({
  loader: async ({ params }) => {
    // API-Level Security Check: Fetch only if approved
    const band = await db.getApprovedRecordById("band", params.bandId);
    if (!band) {
      throw notFound();
    }
    return band as BandApplication;
  },
  component: BandProfilePage,
});

function BandProfilePage() {
  const band = Route.useLoaderData();
  
  // Custom BPL ID Generation
  const bplId = `BPL-BAND-${band.id.slice(0, 6).toUpperCase()}`;

  return (
    <PageShell>
      {/* Back button */}
      <div className="bg-background border-b border-border/40 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link to="/bands" className="text-xs text-muted-foreground hover:text-primary-glow flex items-center gap-1 transition">
            <ChevronLeft size={14} /> Back to Bands Directory
          </Link>
        </div>
      </div>

      {/* Profile Cover Banner */}
      <section className="relative">
        <div className="h-64 md:h-80 w-full overflow-hidden bg-slate-900">
          <img src={band.banner_image} alt={`${band.band_name} Banner`} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Profile Identity Details (overlapping banner bottom) */}
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-surface shrink-0">
              <img src={band.profile_image} alt={`${band.band_name} Profile`} className="h-full w-full object-cover" />
            </div>
            
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest bg-primary/20 text-primary-glow border border-primary/40 px-2 py-0.5 rounded font-bold">
                  {bplId}
                </span>
                <span className="text-[10px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                  <Award size={10} /> Verified Artist
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
                {band.band_name}
              </h1>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                <span className="text-primary-glow font-bold uppercase tracking-wider">{band.genre}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {band.home_city}</span>
                {band.formed_year && (
                  <span className="flex items-center gap-1"><Calendar size={12} /> Formed {band.formed_year}</span>
                )}
                {band.original_covers && (
                  <span className="text-white/60">· {band.original_covers}</span>
                )}
              </div>
            </div>

            {/* Social handles links (opens in new tabs) */}
            <div className="sm:ml-auto flex gap-2 pt-2 sm:pt-0">
              <a 
                href={band.instagram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-full border border-border bg-surface hover:text-primary-glow px-3 py-2.5 text-xs flex items-center gap-1.5 transition text-white"
              >
                <Instagram size={14} /> Instagram
              </a>
              {band.youtube_url && (
                <a 
                  href={band.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="rounded-full border border-border bg-surface hover:text-primary-glow px-3 py-2.5 text-xs flex items-center gap-1.5 transition text-white"
                >
                  <Youtube size={14} /> YouTube
                </a>
              )}
              {band.spotify_url && (
                <a 
                  href={band.spotify_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="rounded-full border border-border bg-surface hover:text-primary-glow px-3 py-2.5 text-xs flex items-center gap-1.5 transition text-white"
                >
                  <Music size={14} /> Spotify
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile details grids */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          
          {/* About / Bio */}
          <Panel title="About / Story">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="italic text-white/95 text-base">"{band.bio}"</p>
              {band.mission && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-primary-glow font-bold mt-4">Mission</h4>
                  <p className="mt-1">{band.mission}</p>
                </div>
              )}
              {band.musical_style && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-primary-glow font-bold mt-4">Musical Style</h4>
                  <p className="mt-1">{band.musical_style}</p>
                </div>
              )}
              {band.influences && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-primary-glow font-bold mt-4">Influences</h4>
                  <p className="mt-1">{band.influences}</p>
                </div>
              )}
            </div>
          </Panel>

          {/* Members */}
          {band.members && band.members.length > 0 && (
            <Panel title="Band Lineup">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {band.members.map((m) => (
                  <div key={m.name} className="text-center p-3 rounded-lg bg-surface/30 border border-border/50">
                    <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border border-border bg-slate-800">
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs"><User size={20} className="text-muted-foreground" /></div>
                      )}
                    </div>
                    <p className="mt-2.5 font-semibold text-sm text-white truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                    {m.experience && (
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{m.experience}</p>
                    )}
                    {m.instagram && (
                      <a 
                        href={`https://instagram.com/${m.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary-glow hover:underline truncate block mt-1"
                      >
                        @{m.instagram.replace('@', '')}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Performance Photos */}
          {band.performance_photos && band.performance_photos.length > 0 && (
            <Panel title="Gig Gallery">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {band.performance_photos.map((p, idx) => (
                  <img 
                    key={idx} 
                    src={p} 
                    alt={`Gig ${idx + 1}`} 
                    className="aspect-square object-cover rounded-lg border border-border hover:scale-[1.02] transition duration-200 cursor-pointer" 
                    onClick={() => window.open(p, "_blank")}
                  />
                ))}
              </div>
            </Panel>
          )}

          {/* Stage Rider / Specs */}
          {(band.stage_rider || band.technical_requirements) && (
            <Panel title="Technical Specs">
              <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                {band.stage_rider && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-primary-glow font-bold mb-1">Stage Rider Summary</h4>
                    <p className="bg-secondary/40 border border-border p-3 rounded text-white/90">{band.stage_rider}</p>
                  </div>
                )}
                {band.technical_requirements && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-primary-glow font-bold mb-1">Technical Requirements</h4>
                    <p className="bg-secondary/40 border border-border p-3 rounded text-white/90">{band.technical_requirements}</p>
                  </div>
                )}
              </div>
            </Panel>
          )}

        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
          
          {/* League status metadata */}
          <Panel title="League Details">
            <div className="space-y-3 pt-1 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">League Status</span>
                <span className="text-emerald-400 font-semibold uppercase text-xs">Active Catalog</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Season Joined</span>
                <span className="text-white font-semibold text-xs">Season 2026</span>
              </div>
              {band.languages && (
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Languages</span>
                  <span className="text-white font-semibold text-xs truncate max-w-[150px]">{band.languages}</span>
                </div>
              )}
              {band.preferred_cities && (
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Tour Cities</span>
                  <span className="text-white font-semibold text-xs truncate max-w-[150px]">{band.preferred_cities}</span>
                </div>
              )}
              {band.fee_range && (
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Preferred Fee</span>
                  <span className="text-primary-glow font-bold text-xs">{band.fee_range}</span>
                </div>
              )}
            </div>
          </Panel>

          {/* Social Links buttons */}
          <Panel title="Schedules & Bookings">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect with the BPL Management team to book this artist for college festivals, lounge gigs, and brand activations.
              </p>
              <a 
                href={`mailto:bookings@bpl.in?subject=Booking Inquiry: ${band.band_name}`}
                className="btn-primary btn-primary-hover block text-center rounded-md px-6 py-3.5 text-sm font-semibold text-white"
              >
                Inquire Booking
              </a>
            </div>
          </Panel>

          {/* Extra handles */}
          {(band.saavn_url || band.apple_url || band.website_url) && (
            <Panel title="External Links">
              <div className="space-y-2 pt-1">
                {band.saavn_url && (
                  <a href={band.saavn_url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center text-xs text-muted-foreground hover:text-primary-glow transition border-b border-border/40 pb-2">
                    <span>JioSaavn Artist Link</span> <ExternalLink size={12} />
                  </a>
                )}
                {band.apple_url && (
                  <a href={band.apple_url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center text-xs text-muted-foreground hover:text-primary-glow transition border-b border-border/40 pb-2">
                    <span>Apple Music Artist Link</span> <ExternalLink size={12} />
                  </a>
                )}
                {band.website_url && (
                  <a href={band.website_url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center text-xs text-muted-foreground hover:text-primary-glow transition pb-1">
                    <span>Official Website</span> <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </Panel>
          )}

        </aside>
      </div>

    </PageShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bpl-card p-6">
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}
