"use client";

import { usePathname } from 'next/navigation';
import { motion, useSpring } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function CustomCursor({ accentColor }: { accentColor: string }) {
  const mouseX = useSpring(0, { damping: 30, stiffness: 250 });
  const mouseY = useSpring(0, { damping: 30, stiffness: 250 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, [role="button"], .group, .card-surface'));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div 
      className="fixed top-0 left-0 w-2 h-2 rounded-full z-[9999] pointer-events-none hidden lg:block"
      style={{ 
        x: mouseX, 
        y: mouseY, 
        translateX: "-50%", 
        translateY: "-50%",
        backgroundColor: accentColor,
        boxShadow: isHovering ? `0 0 20px ${accentColor}` : 'none'
      }}
      animate={{ 
        scale: isHovering ? 4 : 1,
        opacity: isHovering ? 0.6 : 1 
      }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
    />
  );
}

export default function ClientLayout({ 
  children, 
  settings 
}: { 
  children: React.ReactNode;
  settings: any;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  // Bare routes render without site chrome (nav/footer/frame) — e.g. the printable CV.
  const isBare = isAdmin || pathname === '/cv';

  /* Synced to Signal Cyan (#38BDF8) */
  const accentColor = settings?.accentColor || "#38BDF8";

  return (
    <>
      {!isBare && <CustomCursor accentColor={accentColor} />}

      {!isBare && (
        <>
          {/* GLOBAL AESTHETIC OVERLAYS - COMMENTED SECTION 
              (Originally contained grain and vignette for digital experience crafting)
              
              <div className="fixed inset-0 pointer-events-none z-0">
                <div className="bg-grain" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(30,41,59,0.4)_100%)]" />
              </div> 
          */}
          
          {/* Structural Frame - Deep Slate Engineering Grid */}
          <div className="fixed inset-0 pointer-events-none z-[50] hidden md:flex items-center justify-center p-6">
             <div className="w-full h-full border border-[#1E293B]/40" />
          </div>
        </>
      )}

      <div className="flex flex-col min-h-screen bg-[#334155]">
        {!isBare && <Navbar settings={settings} />}

        <main className="flex-grow w-full overflow-x-hidden">
          {children}
        </main>

        {!isBare && <Footer settings={settings} />}
      </div>

      <div id="cursor-portal" />
    </>
  );
}