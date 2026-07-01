"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, Calendar, User, MessageSquare, Trash2, 
  CheckCircle, Circle, Save, CheckCircle2, Loader2,
  Globe, Instagram, Linkedin, Twitter, Hash, Send, Eye, EyeOff
} from 'lucide-react';
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

export default function AdminInbox() {
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Individual visibility states
  const [vis, setVis] = useState({
    ig: true,
    li: true,
    tw: true
  });

  const fetchData = useCallback(async () => {
    const [msgRes, configRes] = await Promise.all([
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('site_config').select('*').eq('id', 'hero_content').single()
    ]);

    if (msgRes.data) setMessages(msgRes.data);
    if (configRes.data) {
      const content = configRes.data.content;
      setSettings(content);
      // Load individual visibility from DB
      setVis({
        ig: content.socials?.[0]?.isVisible ?? true,
        li: content.socials?.[1]?.isVisible ?? true,
        tw: content.socials?.[2]?.isVisible ?? true
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);

    try {
      const updatedContent = {
        contact_email: formData.get('email'),
        hero_location: formData.get('location'),
        contact_phone: formData.get('phone'),
        brand_name: formData.get('brand_name'),
        hero_title: formData.get('hero_title'),
        socials: [
          { label: 'Instagram', url: formData.get('instagram'), isVisible: vis.ig },
          { label: 'LinkedIn', url: formData.get('linkedin'), isVisible: vis.li },
          { label: 'Twitter', url: formData.get('twitter'), isVisible: vis.tw },
        ]
      };

      await supabase.from('site_config').upsert({
        id: 'hero_content',
        content: updatedContent,
        updated_at: new Date().toISOString()
      });

      setShowSuccess(true);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  const toggleRead = async (id: string, currentStatus: boolean) => {
    await supabase.from('inquiries').update({ read: !currentStatus }).eq('id', id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently purge this inquiry?')) {
      await supabase.from('inquiries').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-accent" size={32} />
      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Scanning Studio Vectors</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1E293B] text-zinc-100 max-w-6xl mx-auto px-4 sm:px-6 pb-20 animate-in fade-in duration-700">
      
      <ModalShell isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <CheckCircle2 className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4">Configured</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mb-10 leading-relaxed">Studio parameters synchronized.</p>
        <button onClick={() => setShowSuccess(false)} className="w-full bg-white hover:bg-accent text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em] transition-all">Confirm Update</button>
      </ModalShell>

      <section className="mb-16 md:mb-20 pt-8 md:pt-12">
        <header className="mb-8">
          <h2 className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-2">Studio Presence</h2>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase">Global Configuration</h1>
        </header>

        <form onSubmit={handleSaveSettings} className="bg-[#1E293B] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-16">
          
          <div className="space-y-8 bg-accent/5 p-8 rounded-3xl border border-accent/10">
            <div className="flex items-center gap-3 border-b border-accent/20 pb-4">
              <Send className="text-accent" size={16} />
              <h3 className="text-sm font-black uppercase tracking-widest text-accent">Transmission Target</h3>
            </div>
            <div className="space-y-4">
              <label className="text-[9px] uppercase font-bold text-accent/60 ml-2">Inquiry Destination Email</label>
              <input name="email" type="email" required defaultValue={settings?.contact_email} className="w-full bg-[#1E293B] border border-accent/20 text-white rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/40 text-lg font-medium" placeholder="your-personal-email@example.com" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Hash className="text-accent" size={16} />
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">Identity & Hero</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-zinc-500 ml-2">Studio / Brand Name</label>
                <input name="brand_name" defaultValue={settings?.brand_name} className="w-full bg-[#1E293B] border border-white/10 text-zinc-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-zinc-500 ml-2">Hero Main Headline</label>
                <input name="hero_title" defaultValue={settings?.hero_title} className="w-full bg-[#1E293B] border border-white/10 text-zinc-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Globe className="text-accent" size={16} />
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">Contextual Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-zinc-500 ml-2">Base Location</label>
                <input name="location" defaultValue={settings?.hero_location} className="w-full bg-[#1E293B] border border-white/10 text-zinc-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-zinc-500 ml-2">Phone Reference</label>
                <input name="phone" defaultValue={settings?.contact_phone} className="w-full bg-[#1E293B] border border-white/10 text-zinc-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
          </div>

          {/* Individual Social Toggles */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Instagram className="text-accent" size={14} />
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">Social Architecture</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* IG */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Instagram</label>
                  <button type="button" onClick={() => setVis({...vis, ig: !vis.ig})} className={`transition-colors ${vis.ig ? 'text-accent' : 'text-zinc-700'}`}>
                    {vis.ig ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
                <input name="instagram" defaultValue={settings?.socials?.[0]?.url} className={`w-full bg-[#1E293B] border border-white/10 text-zinc-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/20 transition-opacity ${!vis.ig && 'opacity-30'}`} />
              </div>
              {/* LI */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">LinkedIn</label>
                  <button type="button" onClick={() => setVis({...vis, li: !vis.li})} className={`transition-colors ${vis.li ? 'text-accent' : 'text-zinc-700'}`}>
                    {vis.li ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
                <input name="linkedin" defaultValue={settings?.socials?.[1]?.url} className={`w-full bg-[#1E293B] border border-white/10 text-zinc-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/20 transition-opacity ${!vis.li && 'opacity-30'}`} />
              </div>
              {/* TW */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Twitter / X</label>
                  <button type="button" onClick={() => setVis({...vis, tw: !vis.tw})} className={`transition-colors ${vis.tw ? 'text-accent' : 'text-zinc-700'}`}>
                    {vis.tw ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
                <input name="twitter" defaultValue={settings?.socials?.[2]?.url} className={`w-full bg-[#1E293B] border border-white/10 text-zinc-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent/20 transition-opacity ${!vis.tw && 'opacity-30'}`} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isPending} className="flex items-center gap-3 bg-white text-black px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-xl shadow-white/5">
              <Save size={18} className={isPending ? "animate-spin" : ""} /> {isPending ? "Synchronizing..." : "Commit Global Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Inbox Section */}
      <section>
        <header className="mb-12 flex items-end justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-accent block" />
                {unreadCount > 0 && <span className="absolute inset-0 w-3 h-3 rounded-full bg-accent animate-ping" />}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic">Inbox</h1>
            </div>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">
              {unreadCount > 0 ? `${unreadCount} New Inquiries` : "All caught up"}
            </p>
          </div>
        </header>

        <div className="grid gap-8">
          {messages.length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-white/10 rounded-[3rem] bg-[#1E293B]/50">
              <MessageSquare className="text-zinc-800 mx-auto mb-6" size={32} />
              <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No inquiries found in database.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`group relative transition-all duration-500 rounded-[2.5rem] border ${msg.read ? 'bg-[#1E293B]/40 border-white/5 opacity-60' : 'bg-[#1E293B] border-white/10 shadow-2xl'}`}>
                <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
                  <div className="flex flex-row lg:flex-col items-center lg:items-start gap-5">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center ${msg.read ? 'bg-[#1E293B] text-zinc-500' : 'bg-zinc-100 text-zinc-900'}`}>
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-2xl tracking-tighter uppercase italic">{msg.name}</h3>
                      <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest flex items-center gap-1.5 mt-1">
                        <Calendar size={12} className="text-accent" /> {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex-grow space-y-6">
                    <a href={`mailto:${msg.email}`} className="inline-flex items-center gap-2 bg-[#1E293B] text-zinc-400 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white transition-all">
                      <Mail size={12} /> {msg.email}
                    </a>
                    <p className="text-zinc-300 text-lg italic font-serif border-l-4 border-white/10 pl-6 py-1">
                      "{msg.message || msg.vision}"
                    </p>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-3">
                    <button onClick={() => toggleRead(msg.id, msg.read)} className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${msg.read ? 'text-zinc-600 bg-[#1E293B] border border-white/10' : 'text-accent bg-accent/10 border border-accent/20'}`}>
                      {msg.read ? <Circle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </button>
                    <button onClick={() => handleDelete(msg.id)} className="h-14 w-14 bg-[#1E293B] border border-white/10 text-zinc-600 hover:text-red-500 rounded-2xl flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}