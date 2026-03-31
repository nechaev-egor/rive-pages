"use client";

import React, { useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { BreakpointConfig } from "@/lib/lottie-demos";

interface EditorPreviewProps {
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
  return {
    backgroundImage:
      "repeating-conic-gradient(#d4d4d8 0% 25%, #f4f4f5 0% 50%)",
    backgroundSize: "20px 20px",
  };
}

const PREVIEW_WIDTHS = [375, 768, 1280];

export default function EditorPreview({
  breakpoints,
  scrollHeight,
  backgroundColor,
  backgroundImageUrl,
}: EditorPreviewProps) {
  const [previewWidth, setPreviewWidth] = useState(1280);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // animRef is always mounted — no conditional rendering around it
  const animRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<AnimationItem | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    let cancelled = false;

    const bp = getActiveBreakpoint(breakpoints, previewWidth);

    if (!bp?.lottieUrl) {
      instanceRef.current?.destroy();
      instanceRef.current = null;
      loadedUrlRef.current = null;
      setLoadError(null);
      setLoading(false);
      return;
    }

    // Same URL already loaded — just seek
    if (loadedUrlRef.current === bp.lottieUrl && instanceRef.current) {
      const inst = instanceRef.current;
      if (inst.totalFrames) {
        inst.goToAndStop(progressRef.current * inst.totalFrames, true);
      }
      return;
    }

    instanceRef.current?.destroy();
    instanceRef.current = null;
    loadedUrlRef.current = bp.lottieUrl;
    setLoadError(null);
    setLoading(true);

    fetch(bp.lottieUrl)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !animRef.current) return;
        if (loadedUrlRef.current !== bp.lottieUrl) return;

        const inst = lottie.loadAnimation({
          container: animRef.current,
          renderer: "svg",
          loop: false,
          autoplay: false,
          animationData: data,
        });

        instanceRef.current = inst;
        setLoading(false);

        const total = inst.totalFrames;
        if (total) inst.goToAndStop(progressRef.current * total, true);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[EditorPreview] load failed:", e);
        setLoadError("Failed to load Lottie file. Check URL and CORS settings.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [breakpoints, previewWidth]);

  // Seek on slider move
  useEffect(() => {
    const inst = instanceRef.current;
    if (!inst || !inst.totalFrames) return;
    inst.goToAndStop(progress * inst.totalFrames, true);
  }, [progress]);

  const activeBp = getActiveBreakpoint(breakpoints, previewWidth);

  return (
    <div className="space-y-4">
      {/* Width selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Preview width:
        </span>
        {PREVIEW_WIDTHS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setPreviewWidth(w)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              previewWidth === w
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent"
                : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {w}px
          </button>
        ))}
        <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
          Active: <strong>{activeBp?.label ?? "none"}</strong>
        </span>
      </div>

      {/* Scroll slider */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
          Scroll:
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(progress * 100)}
          onChange={(e) => setProgress(Number(e.target.value) / 100)}
          className="flex-1 accent-zinc-900 dark:accent-zinc-100"
        />
        <span className="text-xs text-zinc-400 w-10 text-right">
          {Math.round(progress * 100)}%
        </span>
      </div>

      {/* Canvas */}
      <div
        className="relative border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden"
        style={{ width: "100%", aspectRatio: "16/9", ...buildBgStyle(backgroundColor, backgroundImageUrl) }}
      >
        {/* Loading / error overlays */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-xs text-zinc-500 bg-white/80 dark:bg-black/60 px-3 py-1.5 rounded-full">
              Loading…
            </span>
          </div>
        )}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
            <p className="text-xs text-red-500 text-center bg-white/90 dark:bg-black/80 rounded-lg px-3 py-2">
              {loadError}
            </p>
          </div>
        )}

        {/* No-match overlay — shown when no breakpoint covers this width */}
        {!activeBp && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm z-10 pointer-events-none">
            {breakpoints.length === 0
              ? "Add a breakpoint to preview"
              : "No breakpoint matches this width"}
          </div>
        )}

        {/*
          animRef div is ALWAYS in the DOM so its ref stays stable.
          We hide it when there's no matching breakpoint.
          Position + size come from activeBp.
        */}
        <div
          className="absolute"
          style={
            activeBp
              ? {
                  left: `${activeBp.position.x}${activeBp.positionUnit}`,
                  top: `${activeBp.position.y}${activeBp.positionUnit}`,
                  width: `${activeBp.size.width}${activeBp.sizeUnit}`,
                  height: `${activeBp.size.height}${activeBp.sizeUnit}`,
                  visibility: "visible",
                }
              : { visibility: "hidden", width: 0, height: 0 }
          }
        >
          <div ref={animRef} className="w-full h-full" />
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
        Scroll container: {scrollHeight.toLocaleString()}px
      </p>
    </div>
  );
}
