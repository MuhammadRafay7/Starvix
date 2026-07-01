"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase"; 
import { Edit3, Trash2, Globe, Image as ImageIcon, Star, X, Upload, Plus, AlertTriangle, CheckCircle2, Layers, Smartphone, FileCode, ExternalLink, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function GlobalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

function ModalShell({ isOpen, onClose, children, accentColor = "accent" }: any) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <GlobalPortal>
      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-crosshair" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[#1E293B] border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${accentColor === 'red' ? 'bg-red-600/20' : 'bg-accent/20'} rounded-full blur-[60px] -mr-16 -mt-16`} />
              <div className="relative z-10 text-center">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GlobalPortal>
  );
}

export default function ManageProjects() {
  const formRef = useRef<HTMLFormElement>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("Web");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" });
  const [filterCategory, setFilterCategory] = useState("All");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    if (editingProject) {
      setSelectedCategory(editingProject.category || "Web");
      setCoverPreview(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editingProject]);

  const handleCoverChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setApkFile(file);
  };

  const resetForm = useCallback(() => {
    setEditingProject(null);
    setCoverPreview(null);
    setApkFile(null);
    setSelectedCategory("Web");
    formRef.current?.reset();
  }, []);

  async function uploadFile(file: File, folder: string = 'projects') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
    if (uploadError) throw uploadError;
    return filePath;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const newRank = parseInt(formData.get('orderIndex') as string) || 0;

      // Execute the SQL function you created to shift other projects
      const { error: rpcError } = await supabase.rpc('increment_order_indices', { 
        start_rank: newRank 
      });
      if (rpcError) throw rpcError;

      const coverFile = formData.get('coverFile') as File;
      let coverPath = editingProject?.cover_image || "";
      if (coverFile && coverFile.size > 0) coverPath = await uploadFile(coverFile);

      let apkPath = editingProject?.apk_url || "";
      if (apkFile) apkPath = await uploadFile(apkFile, 'builds');

      const projectData = {
        title: formData.get('title'),
        category: selectedCategory,
        description: formData.get('description'),
        live_link: formData.get('liveLink'),
        apk_url: apkPath,
        stack: (formData.get('stack') as string).split(',').map(s => s.trim()),
        featured: formData.get('featured') === 'on',
        cover_image: coverPath,
        order_index: newRank,
        updated_at: new Date().toISOString(),
      };

      if (editingProject) {
        const { error } = await supabase.from('projects').update(projectData).eq('id', editingProject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert([projectData]);
        if (error) throw error;
      }

      setSuccessModal({ isOpen: true, message: "Synchronized" });
      resetForm();
      fetchProjects();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Build the filter tabs from whatever categories actually exist in the data.
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const visibleProjects = filterCategory === "All"
    ? projects
    : projects.filter((p) => p.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#1E293B] text-zinc-300 pb-20 selection:bg-accent/30">
      <ModalShell isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })}>
        <CheckCircle2 className="mx-auto text-accent mb-6" size={56} strokeWidth={1.5} />
        <h3 className="text-white text-3xl font-black italic uppercase tracking-tighter mb-4">Verified</h3>
        <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })} className="w-full bg-white text-black font-black py-6 rounded-2xl uppercase tracking-[0.4em]">Continue</button>
      </ModalShell>

      <ModalShell isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} accentColor="red">
        <AlertTriangle className="mx-auto text-red-500 mb-6" size={56} strokeWidth={1.5} />
        <button onClick={async () => {
             await supabase.from('projects').delete().eq('id', deleteModal.id);
             setDeleteModal({ ...deleteModal, isOpen: false });
             fetchProjects();
        }} className="w-full bg-red-600 text-white font-black py-6 rounded-2xl uppercase tracking-[0.4em]">Confirm Purge</button>
      </ModalShell>

      <div className="max-w-5xl mx-auto px-6 pt-10">
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white uppercase italic">{editingProject ? "Edit Entry" : "New Archive"}</h1>
          </div>
          {editingProject && <button onClick={resetForm} className="text-[10px] font-bold uppercase text-red-500 border border-red-900/50 px-6 py-3 rounded-full hover:bg-red-500/10 transition-all">Discard Changes</button>}
        </header>

        <section className="bg-[#1E293B] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl mb-12">
          <form key={editingProject?.id || 'new'} ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-accent flex items-center gap-2"><Hash size={12}/> Priority Rank</label>
                <input type="number" name="orderIndex" defaultValue={editingProject?.order_index || 0} className="w-full bg-[#1E293B] border-b border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Project Title</label>
                <input name="title" defaultValue={editingProject?.title} className="w-full bg-[#1E293B] border-b border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Category</label>
                <select name="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-[#1E293B] border-b border-white/10 p-4 rounded-xl text-white outline-none cursor-pointer">
                  <option value="Web">Web</option>
                  <option value="Design">Design</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-accent flex items-center gap-2"><ImageIcon size={12}/> Hero Identity</label>
                <div className="relative h-48 bg-[#1E293B] border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden flex items-center justify-center group hover:border-accent transition-all">
                  <input type="file" name="coverFile" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                  {coverPreview || editingProject?.cover_image ? (
                    <img src={coverPreview || (editingProject?.cover_image?.startsWith('http') ? editingProject.cover_image : supabase.storage.from('uploads').getPublicUrl(editingProject.cover_image).data.publicUrl)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Upload className="text-zinc-700" />
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedCategory === "Mobile" && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-accent flex items-center gap-2"><Smartphone size={12}/> Mobile Build (APK)</label>
                    <div className="relative h-48 bg-[#1E293B] border-2 border-dashed border-accent/30 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center group hover:border-accent transition-all">
                      <input type="file" accept=".apk" onChange={handleApkChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      {apkFile || editingProject?.apk_url ? (
                        <div className="text-center px-4">
                          <CheckCircle2 className="text-accent mx-auto mb-2" />
                          <span className="text-[9px] uppercase font-bold text-white truncate block">{apkFile ? apkFile.name : 'Build Linked'}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="text-zinc-700 mx-auto" />
                          <span className="text-[8px] uppercase font-bold text-zinc-700 mt-2">Upload .apk build</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <input name="stack" defaultValue={editingProject?.stack?.join(", ")} placeholder="Stack (React, GSAP...)" className="w-full bg-[#1E293B] border-b border-white/10 p-4 rounded-xl text-white outline-none" />
                <input name="liveLink" defaultValue={editingProject?.live_link} placeholder={selectedCategory === "Mobile" ? "App Store Link" : "Live URL"} className="w-full bg-[#1E293B] border-b border-white/10 p-4 rounded-xl text-white outline-none" />
            </div>

            <textarea name="description" defaultValue={editingProject?.description} placeholder="Project narrative..." className="w-full bg-[#1E293B] p-6 rounded-[2rem] text-sm text-white min-h-[150px] outline-none border border-white/10" />

            <div className="flex justify-between items-center border-t border-white/10 pt-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="featured" defaultChecked={editingProject?.featured} className="w-5 h-5 accent-accent" />
                <span className="text-[10px] uppercase font-bold text-zinc-500">Feature on mainstage</span>
              </label>
              <button type="submit" disabled={saving} className="bg-accent text-black font-black py-5 px-12 rounded-full text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-transform">
                {saving ? "Synchronizing..." : editingProject ? "Save Changes" : "Commit Entry"}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
                <Layers className="text-accent" size={24} /> Project Index
              </h2>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{visibleProjects.length} Entries Localized</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const active = filterCategory === cat;
                const count = cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] transition-all border ${
                      active
                        ? 'bg-accent text-black border-accent'
                        : 'bg-[#1E293B] text-zinc-500 border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat}
                    <span className={`font-mono ${active ? 'text-black/60' : 'text-zinc-600'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading && projects.length === 0 ? (
              <div className="py-20 text-center animate-pulse text-[10px] uppercase tracking-[0.5em]">Scanning Database...</div>
            ) : visibleProjects.length === 0 ? (
              <div className="py-20 text-center text-[10px] uppercase tracking-[0.5em] text-zinc-600">No {filterCategory} entries</div>
            ) : visibleProjects.map((project) => (
              <div key={project.id} className={`group border p-6 rounded-3xl flex items-center justify-between transition-all duration-500 ${editingProject?.id === project.id ? 'bg-accent/10 border-accent' : 'bg-[#1E293B]/50 border-white/10 hover:bg-[#1E293B] hover:border-white/10'}`}>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#1E293B] border border-white/10">
                    <img 
                      src={project.cover_image?.startsWith('http') ? project.cover_image : supabase.storage.from('uploads').getPublicUrl(project.cover_image).data.publicUrl} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      alt="" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-bold uppercase text-sm tracking-tight">{project.title}</h3>
                      {project.featured && <Star size={12} className="text-accent fill-accent" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] uppercase tracking-widest px-2 py-1 bg-accent/10 text-accent rounded-md font-bold">{project.category}</span>
                      <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-mono">Rank: {project.order_index}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingProject(project)} className={`p-3 rounded-xl transition-all ${editingProject?.id === project.id ? 'bg-accent text-black' : 'bg-[#1E293B] text-zinc-500 hover:text-white hover:bg-[#1E293B]'}`}>
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => setDeleteModal({ isOpen: true, id: project.id, name: project.title })} className="p-3 rounded-xl bg-[#1E293B] text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}