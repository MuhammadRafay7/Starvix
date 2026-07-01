"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Copyright, Type, ArrowLeft, CheckCircle2, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '@/lib/supabase';

// --- PORTAL ENGINE ---
function GlobalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

// --- LUXURY MODAL ---
function ModalShell({ isOpen, onClose, children }: any) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <GlobalPortal>
      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-crosshair" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[#1E293B] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px] -mr-16 -mt-16" />
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GlobalPortal>
  );
}

export default function ManageFooter() {
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [footerData, setFooterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Footer Data from Supabase
  const fetchFooter = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_config')
      .select('footer_json')
      .eq('id', 'hero_content') // Ensuring consistency with other config queries
      .single();
    
    if (!error && data) {
      setFooterData(data.footer_json);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFooter();
  }, [fetchFooter]);

  // 2. Direct Sync Logic
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);

    const updatedFooter = {
      copyright: formData.get('copyright'),
      narrative: formData.get('narrative'),
      email: formData.get('email'),
      location: formData.get('location'),
      availability: formData.get('availability'),
      socials: {
        github: formData.get('github'),
        linkedin: formData.get('linkedin'),
        instagram: formData.get('instagram'),
        twitter: formData.get('twitter'),
      }
    };

    try {
      const { error } = await supabase
        .from('site_config')
        .upsert({
          id: 'hero_content',
          footer_json: updatedFooter,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setShowSuccess(true);
      fetchFooter();
    } catch (err: any) {
      alert("Footer sync failed: " + err.message);
    } finally {
      setIsPending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-accent" size={32} />
      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Accessing Global Interface</p>
    </div>
  );

  const socials = footerData?.socials || {};

  return (
    <main className="min-h-screen bg-[#1E293B] text-white pt-20 pb-40 px-6 overflow-hidden">
      
      <ModalShell isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <CheckCircle2 className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4">Synchronized</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-10 leading-relaxed">Global footer interface and social ecosystem have been updated.</p>
        <button onClick={() => setShowSuccess(false)} className="w-full bg-white hover:bg-accent text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em] transition-all">Confirm Changes</button>
      </ModalShell>

      <div className="max-w-5xl mx-auto relative">
        <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-neutral-500 hover:text-accent transition-colors mb-12 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <header className="mb-20 border-b border-white/5 pb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-[1px] w-12 bg-accent"></span>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-accent">Global Interface</span>
          </div>
          <h1 className="text-6xl font-light tracking-tighter uppercase leading-none text-white">
            Footer <span className="italic font-serif lowercase text-neutral-500">Control</span>
          </h1>
        </header>

        <form onSubmit={handleSave} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* BRANDING & NARRATIVE */}
            <section className="bg-[#1E293B]/30 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-8">
              <div className="flex items-center gap-3 mb-4">
                <Copyright size={20} className="text-accent" />
                <h2 className="text-xl uppercase tracking-tighter font-light italic text-neutral-200">Branding & Meta</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest ml-2">Copyright Line</label>
                  <input name="copyright" type="text" defaultValue={footerData?.copyright || ""} className="w-full bg-white/[0.03] border-b border-white/10 p-5 rounded-2xl outline-none focus:border-accent transition-all text-sm font-light text-white" />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest ml-2">Footer Narrative (Bio)</label>
                  <textarea name="narrative" defaultValue={footerData?.narrative || ""} className="w-full bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] outline-none focus:border-accent transition-all text-sm font-light min-h-[120px] text-white" />
                </div>
              </div>
            </section>

            {/* SOCIALS */}
            <section className="bg-[#1E293B]/30 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-8">
              <div className="flex items-center gap-3 mb-4">
                <Share2 size={20} className="text-accent" />
                <h2 className="text-xl uppercase tracking-tighter font-light italic text-neutral-200">Social Ecosystem</h2>
              </div>

              <div className="space-y-4">
                {['github', 'linkedin', 'instagram', 'twitter'].map((id) => (
                  <div key={id} className="group flex items-center gap-4 bg-white/[0.02] p-2 pl-6 rounded-full border border-white/5 focus-within:border-accent/50 transition-all">
                    <span className="text-[8px] uppercase font-black text-neutral-500 w-24 tracking-widest">{id}</span>
                    <input name={id} type="text" defaultValue={(socials as any)[id] || ""} placeholder="https://..." className="flex-1 bg-transparent py-3 outline-none text-[11px] font-mono text-accent/80" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* STATUS & CONTACT */}
          <section className="bg-[#1E293B]/30 backdrop-blur-xl p-10 rounded-[4rem] border border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <Type size={20} className="text-accent" />
              <h2 className="text-xl uppercase tracking-tighter font-light italic text-neutral-200">Contact & Status</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest ml-2">Email</label>
                  <input name="email" defaultValue={footerData?.email || ""} className="w-full bg-white/[0.03] border-b border-white/10 p-4 rounded-xl outline-none focus:border-accent text-sm font-light text-white" />
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest ml-2">Location</label>
                  <input name="location" defaultValue={footerData?.location || ""} className="w-full bg-white/[0.03] border-b border-white/10 p-4 rounded-xl outline-none focus:border-accent text-sm font-light text-white" />
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest ml-2">Status</label>
                  <input name="availability" defaultValue={footerData?.availability || ""} className="w-full bg-white/[0.03] border-b border-white/10 p-4 rounded-xl outline-none focus:border-accent text-sm font-light text-white" />
               </div>
               <div className="space-y-3 flex items-end">
                  <button type="submit" disabled={isPending} className="w-full bg-white text-black font-black py-5 rounded-full text-[10px] uppercase tracking-[0.4em] hover:bg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {isPending ? "Syncing..." : <>Save Changes <Save size={12}/></>}
                  </button>
               </div>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}