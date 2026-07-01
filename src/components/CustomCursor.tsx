"use client";

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  
  // High-precision spring settings
  const mouseX = useSpring(0, { damping: 30, stiffness: 200 });
  const mouseY = useSpring(0, { damping: 30, stiffness: 200 });
  
  // Secondary spring for the "trailing" target ring
  const ringX = useSpring(0, { damping: 20, stiffness: 100 });
  const ringY = useSpring(0, { damping: 20, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, ringX, ringY, isVisible]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
      {/* Primary Coordinate Point */}
      <motion.div 
        className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full"
        style={{ 
          x: mouseX, 
          y: mouseY, 
          translateX: "-50%", 
          translateY: "-50%",
          backgroundColor: "#38BDF8",
          opacity: isVisible ? 1 : 0
        }}
      />

      {/* Trailing Target Ring */}
      <motion.div 
        className="absolute top-0 left-0 w-8 h-8 border border-[#38BDF8]/30 rounded-full"
        style={{ 
          x: ringX, 
          y: ringY, 
          translateX: "-50%", 
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.5
        }}
      >
        {/* Technical Crosshair Marks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-[#38BDF8]/40" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-[#38BDF8]/40" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-1 bg-[#38BDF8]/40" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-1 bg-[#38BDF8]/40" />
      </motion.div>
    </div>
  );
}