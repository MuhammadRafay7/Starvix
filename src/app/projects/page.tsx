"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, LayoutGroup } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';
import { supabase } from '@/lib/supabase';

const categories = ["All", "Web", "Mobile", "Creative"];

export default function ProjectsPage() {
  const containerRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProjects = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const projectsWithUrls = data.map((proj) => {
          let finalImageUrl = proj.cover_image;

          if (proj.cover_image && !proj.cover_image.startsWith('http')) {
            const { data: urlData } = supabase.storage
              .from('uploads') 
              .getPublicUrl(proj.cover_image);
            
            finalImageUrl = urlData.publicUrl;
          }

          if (!finalImageUrl) {
            finalImageUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
          }

          return {
            ...proj,
            cover_image: finalImageUrl,
            title: proj.title || "Untitled Project",
            category: proj.category || "Web" 
          };
        });

        setProjects(projectsWithUrls);
      }
      setLoading(false);
    };

    fetchAllProjects();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -80]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const bgYearY = useTransform(scrollYProgress, [0, 1], ["45%", "55%"]);

  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <main ref={containerRef} className="min-h-screen pt-48 pb-60 relative overflow-hidden font-sans">
      
      <motion.div 
        style={{ y: bgYearY, rotate: 90 }}
        className="fixed top-1/2 right-[-12%] origin-center pointer-events-none z-0 hidden lg:block"
      >
        <span className="text-[20vw] font-black text-[#F8FAFC]/[0.02] uppercase tracking-tighter select-none font-sans">
          MMXXVI
        </span>
      </motion.div>

      <div className="max-w-[1400px] mx-auto px-8 md:px-16 relative z-10">
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="mb-24 md:mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end border-b border-[#94A3B8]/20 pb-10 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <motion.div initial={{ width: 0 }} animate={{ width: 30 }} className="h-px bg-[#F59E0B]" />
                <span className="text-[#F59E0B] uppercase tracking-[0.8em] text-[8px] font-bold block font-mono">Archive_Ref_01</span>
              </div>
              <h1 className="text-6xl md:text-[5vw] font-black tracking-tighter leading-[0.9] uppercase text-[#F8FAFC]">
                The <span className="text-[#38BDF8]">Archive</span>
              </h1>
            </div>

            <div className="text-right font-mono hidden md:block pb-2">
              <p className="text-[8px] uppercase tracking-[0.4em] text-[#94A3B8] mb-1">Index_Size</p>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={filteredProjects.length}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-4xl font-light text-[#38BDF8] tabular-nums"
                >
                  {loading ? "--" : filteredProjects.length.toString().padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <nav className="flex gap-8 md:gap-10 pt-8 overflow-x-auto no-scrollbar font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-[9px] uppercase tracking-[0.4em] transition-all duration-500 relative pb-2 whitespace-nowrap ${
                  activeFilter === cat ? "text-[#F8FAFC]" : "text-[#94A3B8] hover:text-[#38BDF8]"
                }`}
              >
                {cat}
                {activeFilter === cat && (
                  <motion.div 
                    layoutId="activeFilter" 
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-[#38BDF8]" 
                  />
                )}
              </button>
            ))}
          </nav>
        </motion.div>
        
        <LayoutGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20 lg:gap-x-20 lg:gap-y-32">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((proj, index) => {
                const isEven = index % 2 !== 0;
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-5%" }}
                    key={proj.id} 
                    className={`relative w-full group ${isEven ? 'md:mt-24' : ''}`}
                  >
                    <ProjectCard project={proj} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>
    </main>
  );
}