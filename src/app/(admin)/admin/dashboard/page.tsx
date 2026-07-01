'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, Zap, Save, RefreshCcw, BookOpen, 
  Layout, CheckCircle2, Terminal, Image as ImageIcon, Upload, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from "react-dom";

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
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[#1E293B] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px] -mr-16 -mt-16" />
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GlobalPortal>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'hero' | 'philosophy'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hero, setHero] = useState<any>({});
  const [philosophy, setPhilosophy] = useState<any>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [heroRes, philRes] = await Promise.all([
        supabase.from('site_config').select('content').eq('id', 'hero_content').maybeSingle(),
        supabase.from('site_config').select('content').eq('id', 'about_page_content').maybeSingle()
      ]);

      if (heroRes.data?.content) setHero(heroRes.data.content);
      if (philRes.data?.content) setPhilosophy(philRes.data.content);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `about-portrait-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 1. Upload to Supabase Storage (Bucket name: site-assets)
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      // 3. Update local state
      setPhilosophy({ ...philosophy, imageUrl: publicUrl });
    } catch (err: any) {
      alert("Upload failed: Ensure you have a 'site-assets' bucket in Supabase.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const targetId = activeTab === 'hero' ? 'hero_content' : 'about_page_content';
    const targetContent = activeTab === 'hero' ? hero : philosophy;

    try {
      const { data: existing } = await supabase.from('site_config').select('content').eq('id', targetId).maybeSingle();
      const mergedContent = { ...(existing?.content || {}), ...targetContent, updated_at: new Date().toISOString() };
      await supabase.from('site_config').upsert({ id: targetId, content: mergedContent });
      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4 font-mono">
      <Loader2 className="animate-spin text-accent" size={32} />
      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold">Accessing Core Logic</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#334155] text-white selection:bg-accent/30">
      
      <ModalShell isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <CheckCircle2 className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4">Synchronized</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-10 leading-relaxed">
          The {activeTab} parameters have been updated.
        </p>
        <button onClick={() => setShowSuccess(false)} className="w-full bg-white hover:bg-accent text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em] transition-all">Confirm Manifest</button>
      </ModalShell>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Terminal size={16} className="text-accent" />
              <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-bold">Studio Dashboard</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
              System <span className="text-zinc-800 font-serif lowercase italic font-light">editor</span>
            </h1>
          </div>

          <div className="flex bg-[#1E293B]/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
            <TabBtn active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon={<Layout size={14} />} label="Hero" />
            <TabBtn active={activeTab === 'philosophy'} onClick={() => setActiveTab('philosophy')} icon={<BookOpen size={14} />} label="Philosophy" />
          </div>
        </header>
        
        <form onSubmit={handleSave} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] blur-xl opacity-50" />
          
          <div className="relative bg-[#1E293B] border border-white/10 rounded-[3rem] p-8 md:p-16 space-y-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

            {activeTab === 'hero' ? (
              <div className="space-y-12 animate-in fade-in duration-700">
                <SectionHeader icon={<Zap size={18} />} title="Landing Interface" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input label="Protocol Label" value={hero.upperLabel} onChange={(v:any) => setHero({...hero, upperLabel: v})} />
                  <Input label="Availability" value={hero.availability} onChange={(v:any) => setHero({...hero, availability: v})} />
                  <Input label="Headline 01" value={hero.mainTitleLine1} onChange={(v:any) => setHero({...hero, mainTitleLine1: v})} />
                  <Input label="Headline 02" value={hero.mainTitleLine2} onChange={(v:any) => setHero({...hero, mainTitleLine2: v})} />
                </div>
                <Textarea label="Narrative Subtext" value={hero.subtext} onChange={(v:any) => setHero({...hero, subtext: v})} />
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-700">
                <SectionHeader icon={<BookOpen size={18} />} title="About Narrative & Visuals" />
                
                {/* IMAGE UPLOAD SECTION */}
                <div className="bg-black/20 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative w-40 h-52 bg-[#1E293B] rounded-2xl overflow-hidden border border-white/10 group/img">
                    {philosophy.imageUrl ? (
                      <img src={philosophy.imageUrl} alt="About Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                        <ImageIcon size={32} strokeWidth={1} />
                        <p className="text-[8px] mt-2 uppercase font-bold tracking-tighter">No Media</p>
                      </div>
                    )}
                    {uploading && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>}
                  </div>
                  
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-accent">Visual Asset Protocol</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-sm font-light italic">Upload your high-fidelity portrait for the about section. High resolution PNG/JPG recommended.</p>
                    <div className="flex gap-4 justify-center md:justify-start">
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#1E293B] hover:bg-[#334155] text-white px-6 py-3 rounded-xl text-[9px] uppercase tracking-[0.2em] font-black flex items-center gap-2 transition-all">
                        <Upload size={14} /> {philosophy.imageUrl ? 'Replace Asset' : 'Upload Asset'}
                      </button>
                      {philosophy.imageUrl && (
                        <button type="button" onClick={() => setPhilosophy({...philosophy, imageUrl: ''})} className="text-zinc-600 hover:text-red-500 transition-colors"><X size={16} /></button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input label="Philosophy Header 01" value={philosophy.headlineLine1} onChange={(v:any) => setPhilosophy({...philosophy, headlineLine1: v})} />
                  <Input label="Philosophy Header 02" value={philosophy.headlineLine2} onChange={(v:any) => setPhilosophy({...philosophy, headlineLine2: v})} />
                  <Input label="Experience Index" value={philosophy.experienceYears} onChange={(v:any) => setPhilosophy({...philosophy, experienceYears: v})} />
                </div>
                <Textarea label="Core Subheading" value={philosophy.subheading} onChange={(v:any) => setPhilosophy({...philosophy, subheading: v})} />
                <Textarea label="Full Narrative" value={philosophy.philosophy} onChange={(v:any) => setPhilosophy({...philosophy, philosophy: v})} />
              </div>
            )}

            <div className="pt-8 border-t border-white/5">
              <button disabled={saving} type="submit" className="bg-white text-black px-12 py-7 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] hover:bg-accent hover:text-white transition-all disabled:opacity-50 flex items-center gap-4">
                {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? "Synchronizing..." : `Commit ${activeTab} Changes`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- HELPERS ---
function SectionHeader({ icon, title }: any) {
  return (
    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
      <span className="text-accent">{icon}</span>
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-300">{title}</h3>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all ${active ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-zinc-500 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">{label}</label>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black/20 border border-white/5 p-5 rounded-2xl outline-none focus:border-accent/30 transition-all font-light text-zinc-200" />
    </div>
  );
}

function Textarea({ label, value, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em] ml-2">{label}</label>
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-black/20 border border-white/5 p-6 rounded-[2rem] outline-none focus:border-accent/30 transition-all h-40 font-light leading-relaxed text-sm text-zinc-300 resize-none" />
    </div>
  );
}