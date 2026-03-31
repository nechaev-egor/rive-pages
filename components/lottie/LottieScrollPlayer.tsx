"use client";

import React, { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { BreakpointConfig } from "@/lib/lottie-demos";

interface LottieScrollPlayerProps {
  breakpoints: BreakpointConfig[];
  scrollHeight: number;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
}

function getActiveBreakpoint(
  breakpoints: BreakpointConfig[],
  width: number
): BreakpointConfig | null {
  const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);
  return (
    sorted.find(
      (bp) =>
        width >= bp.minWidth && (bp.maxWidth === null || width <= bp.maxWidth)
    ) ?? null
  );
}

function buildBgStyle(
  color?: string | null,
  imageUrl?: string | null
): React.CSSProperties {
  if (imageUrl) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: color ?? undefined,
    };
  }
  if (color) return { backgroundColor: color };
  return {};
}

export default function LottieScrollPlayer({
  breakpoints,
  scrollHeight,
  backgroundColor,
  backgroundImageUrl,
}: LottieScrollPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<AnimationItem | null>(null);
  const loadedUrlRef = useRef<string | null>(null);

  // Keep props in refs so event handlers always read latest values
  const breakpointsRef = useRef(breakpoints);
  const scrollHeightRef = useRef(scrollHeight);
  breakpointsRef.current = breakpoints;
  scrollHeightRef.current = scrollHeight;

  useEffect(() => {
    let destroyed = false;

    async function load() {
      const bp = getActiveBreakpoint(breakpointsRef.current, window.innerWidth);
      if (!bp?.lottieUrl || !animRef.current) return;
      if (loadedUrlRef.current === bp.lottieUrl) return;

      // destroy previous
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
      loadedUrlRef.current = bp.lottieUrl;

      let data: unknown;
      try {
        const res = await fetch(bp.lottieUrl);
        data = await res.json();
      } catch (e) {
        console.error("[LottieScrollPlayer] fetch failed:", e);
        return;
      }

      if (destroyed || !animRef.current) return;

      instanceRef.current = lottie.loadAnimation({
        container: animRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: data,
      });

      // Seek to current scroll position right after loading
      seekToScroll();

      // Apply position/size
      applyStyles(bp);
    }

    function applyStyles(bp: BreakpointConfig) {
      const el = stickyRef.current;
      if (!el) return;
      el.style.position = "absolute";
      el.style.width = `${bp.size.width}${bp.sizeUnit}`;
      el.style.height = `${bp.size.height}${bp.sizeUnit}`;
      el.style.left = `${bp.position.x}${bp.positionUnit}`;
      el.style.top = `${bp.position.y}${bp.positionUnit}`;
    }

    function seekToScroll() {
      const instance = instanceRef.current;
      if (!instance) return;

      const total = instance.totalFrames;
      if (!total) return;

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = scrollHeightRef.current - vh;
      if (scrollable <= 0) return;

      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / scrollable);
      instance.goToAndStop(progress * total, true);
    }

    function onScroll() {
      seekToScroll();
    }

    function onResize() {
      const bp = getActiveBreakpoint(breakpointsRef.current, window.innerWidth);
      if (!bp) return;

      if (bp.lottieUrl !== loadedUrlRef.current) {
        load();
      } else {
        applyStyles(bp);
        seekToScroll();
      }
    }

    load();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      destroyed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      instanceRef.current?.destroy();
      instanceRef.current = null;
      loadedUrlRef.current = null;
    };
    // Only re-run if breakpoints array reference changes (save/edit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakpoints, scrollHeight]);

  return (
    <div
      ref={containerRef}
      style={{ height: scrollHeight, ...buildBgStyle(backgroundColor, backgroundImageUrl) }}
      className="relative w-full"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <div ref={stickyRef} className="absolute">
          <div ref={animRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
