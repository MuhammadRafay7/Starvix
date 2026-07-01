"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Save, Image as ImageIcon, Upload, X, CheckCircle2, Loader2, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

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

export default function AdminBrandPage() {
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [studioName, setStudioName] = useState("");
  const [accentColor, setAccentColor] = useState("#38BDF8");
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBrand = useCallback(async () => {
    const { data } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', 'brand_identity')
      .maybeSingle();

    if (data?.content) {
      const brand = data.content.brand || {};
      setStudioName(brand.studio_name || "");
      setPreviewImage(brand.logo_url || "");
      setAccentColor(data.content.accentColor || "#38BDF8");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadBrand(); }, [loadBrand]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      let finalLogoUrl = previewImage;
      const file = fileInputRef.current?.files?.[0];

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `brand/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
        finalLogoUrl = urlData.publicUrl;
      }

      const { data: current } = await supabase.from('site_config').select('content').eq('id', 'brand_identity').maybeSingle();
      
      const updatedContent = {
        ...(current?.content || {}),
        accentColor: accentColor,
        brand: {
          studio_name: studioName,
          logo_url: finalLogoUrl,
          logo_initial: studioName ? studioName.charAt(0).toUpperCase() : "S"
        }
      };

      const { error: dbError } = await supabase
        .from('site_config')
        .upsert({ 
          id: 'brand_identity', 
          content: updatedContent,
          updated_at: new Date().toISOString() 
        });

      if (dbError) throw dbError;

      setShowSuccess(true);
    } catch (error: any) {
      alert("Sync Failed: " + error.message);
    } finally {
      setIsPending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-accent" size={32} />
      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Initializing Brand Engine</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 md:space-y-20 pb-20 md:pb-40 px-4 md:px-0 mt-10">
      <ModalShell isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <CheckCircle2 className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4">Identity Set</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-10 leading-relaxed">Visual signatures have been synchronized.</p>
        <button onClick={() => setShowSuccess(false)} className="w-full bg-white hover:bg-accent text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em] transition-all">Acknowledge</button>
      </ModalShell>

      <header className="border-b border-white/5 pb-10">
        <div className="flex items-center gap-4 mb-4">
          <span className="h-[1px] w-12 bg-accent"></span>
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-accent">Global Brand Identity</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-light tracking-tighter uppercase leading-none text-white">
          Visual <span className="italic font-serif lowercase text-neutral-500">Signatures</span>
        </h1>
      </header>

      <section className="space-y-10">
        <form onSubmit={handleSync} className="bg-[#1E293B]/30 backdrop-blur-3xl p-6 md:p-12 rounded-[3.5rem] border border-white/5 space-y-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* STUDIO NAME & ACCENT COLOR */}
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.3em] ml-2">Studio Signature</label>
                <input 
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-white/[0.02] border-b border-white/10 p-5 rounded-2xl outline-none focus:border-accent transition-all text-xl font-light text-white"
                  placeholder="Enter Studio Name..."
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[9px] uppercase font-black text-zinc-500 tracking-[0.3em] ml-2">
                  <Palette size={12} /> Design Accent Color
                </label>
                <div className="flex gap-4">
                  <div className="h-14 w-20 rounded-xl border border-white/10 overflow-hidden relative shadow-inner">
                    <input 
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: accentColor }} />
                  </div>
                  <input 
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-white/[0.02] border-b border-white/10 p-4 rounded-xl outline-none font-mono text-xs text-zinc-400 tracking-widest"
                  />
                </div>
              </div>
            </div>

            {/* LOGO PREVIEW */}
            <div className="space-y-6">
              <label className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.3em] ml-2">Brand Mark (Logo)</label>
              <div className="flex flex-col gap-6">
                <div onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer border-2 border-dashed border-white/10 hover:border-accent/50 rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  <Upload size={20} className="text-accent" />
                  <p className="text-[10px] text-white uppercase tracking-widest font-bold">Swap Asset</p>
                </div>

                <div className="bg-black/40 rounded-[2rem] p-8 border border-white/5 flex items-center justify-center group relative">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl p-4">
                        {previewImage ? <img src={previewImage} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon size={24} className="text-zinc-800 opacity-20" />}
                      </div>
                      {previewImage && (
                        <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500/80 backdrop-blur-md text-white rounded-full p-2 hover:bg-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-2xl font-black uppercase tracking-[0.1em]">{studioName || "STUDIO"}</span>
                      <span className="text-[7px] text-zinc-600 uppercase tracking-[0.5em] mt-1 font-bold">Identity Asset — 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-600 text-[8px] uppercase tracking-[0.4em] max-w-[200px] leading-relaxed">Changes here will reflect across all global headers and system layouts.</p>
            <button type="submit" disabled={isPending} className="w-full md:w-auto flex items-center justify-center gap-4 bg-white text-black px-16 py-7 rounded-full font-black uppercase text-[10px] tracking-[0.5em] hover:bg-accent hover:text-white transition-all shadow-xl disabled:opacity-50">
              {isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {isPending ? "Deploying..." : "Commit Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}