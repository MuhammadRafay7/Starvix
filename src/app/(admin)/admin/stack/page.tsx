"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { Cpu, Plus, X, Save, CheckCircle2, Zap, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminStackPage() {
  const [stack, setStack] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadCurrentStack() {
      const { data, error } = await supabase
        .from('site_config')
        .select('content')
        .eq('id', 'about_page_content')
        .single();
      
      if (!error && data?.content?.capabilities) {
        setStack(data.content.capabilities);
      }
      setFetching(false);
    }
    loadCurrentStack();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !stack.includes(newTag.trim())) {
      setStack([...stack, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (name: string) => {
    setStack(stack.filter(t => t !== name));
  };

  async function handleSave() {
    setLoading(true);
    try {
      // 1. Fetch latest data to prevent overwriting other fields in 'content'
      const { data: latest } = await supabase
        .from('site_config')
        .select('content')
        .eq('id', 'about_page_content')
        .single();

      // 2. Merge current 'content' with new 'capabilities'
      const { error } = await supabase
        .from('site_config')
        .update({ 
          content: { 
            ...latest?.content,
            capabilities: stack,
            updated_at: new Date().toISOString()
          } 
        })
        .eq('id', 'about_page_content');

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Vault Sync Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E293B]">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 md:pb-40 px-4 sm:px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-10 border-b border-white/5 pb-8 md:pb-12 pt-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="text-accent animate-pulse w-3.5 h-3.5" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-bold text-neutral-500">
              System Core / Skills
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tighter text-white uppercase leading-none">
            The <span className="italic font-serif text-neutral-600 lowercase px-1 md:px-2">Arsenal</span>
          </h1>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className={`group w-full md:w-auto flex items-center justify-center gap-4 px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-700 ${
            saved 
            ? 'bg-accent text-black shadow-[0_0_40px_color-mix(in_srgb,var(--accent)_25%,transparent)]' 
            : 'bg-white text-black hover:bg-neutral-200 shadow-2xl'
          }`}
        >
          {saved ? <CheckCircle2 size={16} /> : loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
          <span className="whitespace-nowrap">
            {loading ? 'Synchronizing...' : saved ? 'Vault Updated' : 'Commit Changes'}
          </span>
        </button>
      </header>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-transparent rounded-[2rem] md:rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-[#1E293B]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-16">
          <form onSubmit={handleAdd} className="relative flex flex-col md:flex-row gap-4 md:gap-6 mb-12 md:mb-20">
            <div className="relative flex-1">
              <Cpu className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-neutral-700 w-[18px] h-[18px] md:w-5 md:h-5" />
              <input 
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Integrate tech..." 
                className="w-full bg-white/[0.03] border border-white/5 p-4 md:p-6 pl-12 md:pl-16 rounded-xl md:rounded-2xl outline-none focus:border-accent/50 focus:bg-white/[0.05] font-light text-white tracking-wide transition-all italic font-serif text-base md:text-lg"
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#1E293B] text-white px-8 md:px-10 py-4 md:py-6 rounded-xl md:rounded-2xl hover:bg-white hover:text-black transition-all duration-500 group flex items-center justify-center gap-3 border border-white/5"
            >
              <Plus className="group-hover:rotate-90 transition-transform duration-500 w-[18px] h-[18px]" />
              <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest">Add Module</span>
            </button>
          </form>

          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <ShieldCheck size={14} className="text-neutral-700" />
              <h2 className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black text-neutral-500">Active Capabilities</h2>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 min-h-[150px]">
              {stack.map(item => (
                <div 
                  key={item} 
                  className="group relative flex items-center justify-between bg-white/[0.02] border border-white/[0.05] pl-5 md:pl-6 pr-3 md:pr-4 py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-white/[0.05] hover:border-accent/30 transition-all duration-500"
                >
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-neutral-400 group-hover:text-white transition-colors truncate mr-2">
                    {item}
                  </span>
                  <button 
                    onClick={() => removeTag(item)} 
                    className="p-2 text-neutral-800 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Decommission Module"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-accent group-hover:w-1/2 transition-all duration-700" />
                </div>
              ))}

              {stack.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-16 md:py-20 border border-dashed border-white/5 rounded-2xl md:rounded-3xl">
                  <p className="text-neutral-700 uppercase text-[9px] tracking-[0.6em] md:tracking-[1em] text-center">Arsenal Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}