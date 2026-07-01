"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, Variants } from 'framer-motion';
import { Terminal, Activity, ChevronDown } from 'lucide-react';

interface HeroProps {
  data: {
    upperLabel: string;
    mainTitleLine1: string;
    mainTitleLine2: string;
    subtext: string;
    location: string;
    availability: string;
    accentColor: string;
  }
}

export default function Hero({ data }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const accentColor = data.accentColor || "#38BDF8";
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 250]), {
    stiffness: 30,
    damping: 15
  });
  
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const titleVariants: Variants = {
    hidden: { x: -30, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { duration: 1.2, ease: [0.19, 1, 0.22, 1] } 
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[115vh] flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden bg-[#334155]"
      style={{ ['--hero-accent' as string]: accentColor }}
    >
      {/* STRUCTURAL GRID OVERLAY */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* ADAPTIVE SIGNAL TRACKER */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 hidden lg:block opacity-40"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${accentColor}08, transparent 50%)`
        }}
      />

      <motion.div
        style={{ y: smoothY, opacity: textOpacity, scale: scale }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[1600px]"
      >
        {/* UPPER STATUS LABEL */}
        <div className="flex flex-col items-center mb-16">
          <motion.div variants={titleVariants} className="flex items-center gap-4 bg-[#1E293B] px-5 py-2 border border-white/5">
            <Terminal size={14} style={{ color: accentColor }} />
            <span className="text-[10px] uppercase font-mono tracking-[0.5em] font-bold" style={{ color: accentColor }}>
              {data.upperLabel} // SYSTEM_INIT
            </span>
          </motion.div>
        </div>

        {/* MAIN ARCHITECTURAL TITLE */}
        <div className="overflow-hidden mb-4">
          <motion.h1 
            variants={titleVariants}
            className="text-[14vw] md:text-[11vw] font-black tracking-tighter leading-[0.75] uppercase text-[#F8FAFC]"
          >
            {data.mainTitleLine1}
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-16">
          <motion.h1 
            variants={titleVariants}
            className="text-[14vw] md:text-[11vw] font-black tracking-tighter leading-[0.75] italic uppercase opacity-90"
            style={{ color: accentColor }}
          >
            {data.mainTitleLine2}
          </motion.h1>
        </div>

        {/* SUBTEXT & CTA - RIGID GEOMETRY */}
        <motion.div variants={titleVariants} className="flex flex-col items-center gap-20">
          <p className="text-[#94A3B8] max-w-xl mx-auto text-sm md:text-lg font-mono uppercase tracking-widest leading-relaxed border-l border-white/10 pl-8 text-left">
            {data.subtext}
          </p>

          <motion.a
            href="/projects"
            whileHover={{ x: 10 }}
            className="group relative flex items-center gap-8 bg-[#1E293B] border border-white/10 px-12 py-6 transition-all duration-500 overflow-hidden"
          >
            <span className="relative z-10 text-[11px] font-mono uppercase tracking-[0.5em] font-bold text-[#F8FAFC] group-hover:text-[#1E293B] transition-colors">
              EXECUTE_WORKS_VIEW
            </span>
            <Activity size={16} className="relative z-10 text-[var(--hero-accent)] group-hover:text-[#1E293B]" />
            <motion.div 
              className="absolute inset-0 left-0 w-0 group-hover:w-full"
              style={{ backgroundColor: accentColor }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* SCROLL SIGNAL */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth'})}>
        <div className="h-20 w-[1px] bg-white/5 relative overflow-hidden">
          <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-full"
            style={{ background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)` }}
          />
        </div>
        <ChevronDown size={14} className="text-[#94A3B8] group-hover:text-[var(--hero-accent)] transition-colors" />
      </div>

      {/* SYSTEM STATUS NODES */}
      <div className="hidden lg:flex absolute left-12 bottom-12 items-center gap-8 text-[10px] font-mono text-[#94A3B8] tracking-[0.3em] uppercase">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <span>STATUS: {data.availability}</span>
        </div>
        <div className="h-px w-12 bg-white/5" />
        <span>LOC: {data.location}</span>
      </div>

      <div className="hidden lg:flex absolute right-12 bottom-12 items-center gap-3 text-[10px] font-mono text-[#94A3B8] tracking-[0.3em] uppercase opacity-40">
        <span>OS_V.4.0.0</span>
        <span className="text-[var(--hero-accent)]">//</span>
        <span>LAT: 51.5074 N</span>
      </div>
    </section>
  );
}