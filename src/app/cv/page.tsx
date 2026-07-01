'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Download, ArrowLeft, Mail, MapPin, Github, Linkedin,
  Instagram, Twitter, Globe, Loader2
} from 'lucide-react';

interface Project {
  title?: string;
  category?: string;
  description?: string;
  stack?: string[];
  featured?: boolean;
  live_link?: string;
  order_index?: number;
}

export default function CVPage() {
  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const [aboutRes, heroRes, brandRes, projectsRes] = await Promise.all([
        supabase.from('site_config').select('content').eq('id', 'about_page_content').maybeSingle(),
        supabase.from('site_config').select('content, footer_json').eq('id', 'hero_content').maybeSingle(),
        supabase.from('site_config').select('content').eq('id', 'brand_identity').maybeSingle(),
        supabase.from('projects').select('*').order('order_index', { ascending: true }),
      ]);

      const about = aboutRes.data?.content || {};
      const hero = heroRes.data?.content || {};
      const footer = (heroRes.data as any)?.footer_json || {};
      const brandRoot = brandRes.data?.content || {};
      const brand = brandRoot.brand || {};
      const allProjects: Project[] = projectsRes.data || [];

      // Featured first, then by order — keep the CV concise.
      const projects = [...allProjects]
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
        .slice(0, 6);

      // Last resort: derive a name from the copyright string ("© 2026 Studio" -> "Studio").
      const fromCopyright = (footer.copyright || '').replace(/^©?\s*\d{0,4}\s*/, '').trim();

      setCv({
        name: brand.studio_name || hero.brand_name || fromCopyright || 'Studio',
        role: about.subheading || hero.hero_title || hero.mainTitleLine1 || 'Digital Experience Studio',
        accent: brandRoot.accentColor || about.accentColor || '#38BDF8',
        logo: brand.logo_url || hero.logo_url || '',
        logoInitial: brand.logo_initial || '',
        email: footer.email || hero.contact_email || '',
        location: footer.location || hero.hero_location || '',
        availability: footer.availability || hero.availability || '',
        socials: footer.socials || {},
        narrative: about.philosophy || footer.narrative || '',
        experienceYears: about.experienceYears || '',
        capabilities: about.capabilities || [],
        projects,
      });
    } catch (err) {
      console.error('CV fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#334155] text-[#38BDF8]">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#334155] text-[#94A3B8] font-mono text-[10px] uppercase tracking-[0.4em]">
        [CV_DATA_UNAVAILABLE]
      </div>
    );
  }

  const accent = cv.accent;
  const socialLinks = [
    { icon: <Github size={13} />, href: cv.socials.github, label: 'GitHub' },
    { icon: <Linkedin size={13} />, href: cv.socials.linkedin, label: 'LinkedIn' },
    { icon: <Instagram size={13} />, href: cv.socials.instagram, label: 'Instagram' },
    { icon: <Twitter size={13} />, href: cv.socials.twitter, label: 'Twitter' },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen bg-[#334155] py-10 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Toolbar — hidden when printing */}
      <div className="no-print max-w-[820px] mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/philosophy"
          className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors text-[10px] font-mono uppercase tracking-[0.3em]"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-black transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: accent }}
        >
          <Download size={15} /> Download PDF
        </button>
      </div>

      {/* The Resume Sheet */}
      <article
        className="cv-sheet max-w-[820px] mx-auto bg-white text-[#1E293B] shadow-2xl rounded-sm overflow-hidden"
        style={{ ['--accent' as string]: accent }}
      >
        {/* Header */}
        <header className="px-10 sm:px-14 pt-12 pb-8" style={{ borderTop: `6px solid ${accent}` }}>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="font-montserrat font-black uppercase tracking-tight text-4xl sm:text-5xl leading-[0.9] text-[#0f172a]">
                {cv.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#475569] uppercase tracking-[0.25em] font-light">
                {cv.role}
              </p>
            </div>
            {cv.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cv.logo} alt="Logo" className="w-16 h-16 object-contain shrink-0" />
            ) : (
              <div
                className="w-16 h-16 shrink-0 flex items-center justify-center rounded-2xl font-serif italic text-2xl text-white uppercase"
                style={{ backgroundColor: accent }}
              >
                {cv.logoInitial || String(cv.name)[0]}
              </div>
            )}
          </div>

          {/* Contact row */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[#475569] font-mono">
            {cv.email && (
              <a href={`mailto:${cv.email}`} className="flex items-center gap-2 hover:text-[#0f172a]">
                <Mail size={13} style={{ color: accent }} /> {cv.email}
              </a>
            )}
            {cv.location && (
              <span className="flex items-center gap-2">
                <MapPin size={13} style={{ color: accent }} /> {cv.location}
              </span>
            )}
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-[#0f172a]"
              >
                <span style={{ color: accent }}>{s.icon}</span> {s.label}
              </a>
            ))}
          </div>
        </header>

        <div className="px-10 sm:px-14 pb-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Main column */}
          <div className="md:col-span-2 space-y-10">
            {cv.narrative && (
              <section>
                <SectionTitle accent={accent}>Profile</SectionTitle>
                <p className="text-sm leading-relaxed text-[#334155]">{cv.narrative}</p>
              </section>
            )}

            {cv.projects.length > 0 && (
              <section>
                <SectionTitle accent={accent}>Selected Work</SectionTitle>
                <div className="space-y-6">
                  {cv.projects.map((p: Project, i: number) => (
                    <div key={i} className="break-inside-avoid">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-montserrat font-bold text-[#0f172a] text-base uppercase tracking-tight">
                          {p.title}
                        </h3>
                        {p.category && (
                          <span
                            className="text-[9px] font-mono uppercase tracking-[0.2em] shrink-0"
                            style={{ color: accent }}
                          >
                            {p.category}
                          </span>
                        )}
                      </div>
                      {p.description && (
                        <p className="mt-1 text-[13px] leading-relaxed text-[#475569]">{p.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {(p.stack || []).map((t, j) => (
                          <span
                            key={j}
                            className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569]"
                          >
                            {t}
                          </span>
                        ))}
                        {p.live_link && (
                          <a
                            href={p.live_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] font-mono uppercase tracking-wider flex items-center gap-1"
                            style={{ color: accent }}
                          >
                            <Globe size={11} /> Live
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            {cv.experienceYears && (
              <section>
                <SectionTitle accent={accent}>Experience</SectionTitle>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black leading-none text-[#0f172a] tabular-nums">
                    {cv.experienceYears}
                  </span>
                  <span className="pb-1 text-[10px] font-mono uppercase tracking-widest text-[#475569] leading-tight">
                    Years of
                    <br />
                    industry craft
                  </span>
                </div>
                {cv.availability && (
                  <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#475569]">
                    <span style={{ color: accent }}>●</span> {cv.availability}
                  </p>
                )}
              </section>
            )}

            {cv.capabilities.length > 0 && (
              <section>
                <SectionTitle accent={accent}>Capabilities</SectionTitle>
                <ul className="space-y-2">
                  {cv.capabilities.map((c: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-[12px] text-[#334155]">
                      <span className="font-mono text-[9px]" style={{ color: accent }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="uppercase tracking-wide">{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {/* Footer strip */}
        <div
          className="px-10 sm:px-14 py-4 text-[9px] font-mono uppercase tracking-[0.3em] text-white flex justify-between"
          style={{ backgroundColor: '#0f172a' }}
        >
          <span>{cv.name} // Curriculum Vitae</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </article>
    </div>
  );
}

function SectionTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-[2px]" style={{ backgroundColor: accent }} />
      <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[#0f172a]">
        {children}
      </h2>
    </div>
  );
}
