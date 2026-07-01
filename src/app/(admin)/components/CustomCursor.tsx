"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Only the aura trails behind with a spring — the core dot tracks 1:1 (no lag).
  const auraConfig = { damping: 30, stiffness: 500, mass: 0.3 };
  const auraX = useSpring(cursorX, auraConfig);
  const auraY = useSpring(cursorY, auraConfig);

  const isPointerRef = useRef(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Cheap hit-test (no getComputedStyle), and only re-render when it changes.
      const target = e.target as HTMLElement | null;
      const pointer = !!target?.closest('a, button, input, textarea, select, label, [role="button"]');
      if (pointer !== isPointerRef.current) {
        isPointerRef.current = pointer;
        setIsPointer(pointer);
      }
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <>
      {/* The Core Dot — tracks the pointer instantly */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-accent rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* The Luxury Aura — gently trails */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border border-white/20"
        animate={{
          width: isPointer ? 80 : 40,
          height: isPointer ? 80 : 40,
          backgroundColor: isPointer ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0)",
          borderColor: isPointer ? "var(--accent)" : "rgba(255, 255, 255, 0.1)",
        }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
        style={{
          x: auraX,
          y: auraY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Subtle inner ring for detail */}
        {isPointer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-2 border border-accent/10 rounded-full"
          />
        )}
      </motion.div>
    </>
  );
}
