"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase'; // Using direct Supabase connection
import CustomCursor from '../components/CustomCursor'; 
import { 
  LayoutDashboard, FolderKanban, Mail, LogOut, Menu, X,
  Search, Bell, ArrowUpRight, Cpu, MousePointer2, 
  ShieldCheck, Fingerprint 
} from 'lucide-react';

const NAV = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Identity', href: '/admin/brand', icon: Fingerprint }, 
  { name: 'Archive', href: '/admin/projects', icon: FolderKanban },
  { name: 'Tech Stack', href: '/admin/stack', icon: Cpu },
  { name: 'Footer & Links', href: '/admin/footer', icon: MousePointer2 },
  { name: 'Inbox', href: '/admin/inbox', icon: Mail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Dynamic Brand State
  const [brand, setBrand] = useState({ name: "STUDIO", logo_url: "", accentColor: "#38BDF8" });

  const fetchBrand = useCallback(async () => {
    const [hero, identity] = await Promise.all([
      supabase.from('site_config').select('content').eq('id', 'hero_content').single(),
      supabase.from('site_config').select('content').eq('id', 'brand_identity').single(),
    ]);
    setBrand({
      name: hero.data?.content?.studio_name || "STUDIO",
      logo_url: hero.data?.content?.logo_url || "",
      accentColor: identity.data?.content?.accentColor || "#38BDF8",
    });
  }, []);

  // Handle Logout Directly
  const handleLogout = async () => {
    if (confirm("Terminate secure session?")) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
      }
      // Clear local session cookie if you use one
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      router.push('/admin/login');
    }
  };

  useEffect(() => {
    fetchBrand();
    setIsMobileMenuOpen(false);
  }, [pathname, fetchBrand]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/admin/login' || pathname === '/admin/reset-password') return <>{children}</>;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1E293B] border-r border-white/5 select-none overflow-y-auto scrollbar-hide">
      {/* BRANDING */}
      <div className="p-6 lg:p-10 mb-4 flex justify-between items-center">
        <Link href="/admin/dashboard" className="flex items-center gap-4 group">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-accent/50 transition-all duration-500">
            {brand.logo_url ? (
                <img src={brand.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
                <span className="text-black font-serif italic text-xl lg:text-2xl">{brand.name[0]}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-light uppercase tracking-[0.4em] text-[9px] lg:text-[10px] text-white">
              {brand.name} <span className="text-neutral-500 italic">Studio</span>
            </span>
            <span className="text-[7px] text-accent/60 uppercase tracking-[0.3em] font-mono mt-1">Admin Engine v2.4</span>
          </div>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-neutral-500"><X size={18} /></button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 lg:px-6 space-y-1 lg:space-y-2">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-4 px-4 lg:px-5 py-3 lg:py-4 rounded-xl text-[9px] uppercase tracking-[0.3em] font-medium transition-all duration-500 group relative ${
                active ? 'text-accent bg-white/[0.03]' : 'text-neutral-500 hover:text-white'
              }`}
            >
              {active && <motion.div layoutId="navActive" className="absolute left-0 w-[2px] h-5 lg:h-6 bg-accent rounded-full" />}
              <item.icon size={16} strokeWidth={active ? 2.5 : 1.5} className={active ? 'text-accent' : 'group-hover:text-accent transition-colors'} /> 
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-6 lg:p-8 space-y-4 border-t border-white/5">
        <div className="px-4 py-4 bg-white/[0.02] border border-white/5 rounded-2xl hidden sm:block overflow-hidden relative group">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[7px] uppercase font-mono text-neutral-500 tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck size={10} className="text-accent" /> System Secure
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-tighter">Live Sync Active</span>
            </div>
        </div>

        <Link href="/" target="_blank" className="flex items-center justify-between p-3 lg:p-4 bg-white/[0.03] border border-white/5 rounded-xl group transition-all hover:border-accent/30">
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">Preview Site</span>
          <ArrowUpRight size={14} className="text-neutral-600 group-hover:text-accent transition-all" />
        </Link>
        
        {/* Updated Logout Button */}
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-2 text-neutral-600 hover:text-red-400 transition-colors text-[9px] font-bold uppercase tracking-widest text-left"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#334155] text-[#e5e5e5] lg:cursor-none selection:bg-accent/30"
      style={{ ['--accent' as string]: brand.accentColor }}
    >
      <div className="hidden lg:block"><CustomCursor /></div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex w-72 flex-col fixed h-full z-50"><SidebarContent /></aside>
      <aside className={`fixed top-0 left-0 h-full w-[280px] z-[70] transition-transform duration-500 lg:hidden bg-[#1E293B] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}><SidebarContent /></aside>

      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-[55] px-4 sm:px-12 py-4 lg:py-6 flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-[#1E293B]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white border border-white/10 rounded-lg"><Menu size={20} /></button>
            <div className="hidden xs:flex flex-col">
              <span className="text-[7px] font-mono uppercase tracking-[0.4em] text-neutral-600">Instance</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_60%,transparent)]" />
                <span className="text-[8px] font-bold uppercase text-neutral-300">Production_v2.4</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative hidden md:block">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={12} />
               <input type="text" placeholder="System Search..." className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-6 text-[9px] font-bold uppercase tracking-widest outline-none focus:border-accent/50 transition-all w-64 text-white" />
            </div>
            <button className="relative p-2.5 lg:p-3 bg-white/5 border border-white/10 rounded-xl hover:border-accent/50 transition-all">
              <Bell size={18} className="text-neutral-400" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-accent rounded-full ring-2 ring-[#1E293B]" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-12 xl:p-16 max-w-[1600px] mx-auto w-full">{children}</main>

        <footer className="p-10 text-center mt-auto border-t border-white/5">
            <p className="text-[7px] lg:text-[8px] font-medium text-neutral-600 uppercase tracking-[0.6em] leading-relaxed">
                {brand.name} Studio // Core Engine // © 2026
            </p>
        </footer>
      </div>
    </div>
  );
}