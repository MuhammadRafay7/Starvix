import { supabase } from '@/lib/supabase';
import Hero from '@/components/Hero';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomeData() {
  const [heroRes, brandRes, projectsRes] = await Promise.all([
    supabase.from('site_config').select('content').eq('id', 'hero_content').maybeSingle(),
    supabase.from('site_config').select('content').eq('id', 'brand_identity').maybeSingle(),
    supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
  ]);

  const hero = heroRes.data?.content || {
    upperLabel: "SYSTEM_ID // 01",
    mainTitleLine1: "ARCHITECTING",
    mainTitleLine2: "DIGITAL SUPREMACY",
    subtext: "High-end engineering & modern digital platforms.",
    location: "29.35° N, 71.69° E",
    availability: "SYSTEM_ONLINE"
  };

  // Unify the hero with the brand accent so it matches the footer/admin/CV.
  hero.accentColor = brandRes.data?.content?.accentColor || hero.accentColor || "#38BDF8";

  return {
    hero,
    projects: projectsRes.data || []
  };
}

export default async function Page() {
  const { hero, projects } = await getHomeData();

  return (
    <main className="min-h-screen relative">
      {/* 1. This is the Hero from your screenshot - KEEP THIS */}
      <Hero data={hero} />
      
      {/* 2. Modified HomeClient call: 
             We keep initialProjects so the grid shows up, 
             but we comment out or remove heroData to hide the repeated title. 
      */}
      <HomeClient 
        initialProjects={projects} 
        /* heroData={hero} */ 
      />
    </main>
  );
}