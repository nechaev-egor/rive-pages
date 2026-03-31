"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { BreakpointConfig, LottieDemo } from "@/lib/lottie-demos";
import BreakpointConfigPanel from "./BreakpointConfig";

const EditorPreview = dynamic(() => import("./EditorPreview"), { ssr: false });

interface LottieEditorProps {
  initial?: LottieDemo;
}

function newBreakpoint(): BreakpointConfig {
  return {
    id: Math.random().toString(36).slice(2, 9),
    label: "Desktop",
    minWidth: 0,
    maxWidth: null,
    lottieUrl: "",
    lottieFileName: "",
    position: { x: 0, y: 0 },
    positionUnit: "%",
    size: { width: 100, height: 100 },
    sizeUnit: "%",
  };
}

const PRESET_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Light gray", value: "#f4f4f5" },
  { label: "Warm white", value: "#fefce8" },
  { label: "Black", value: "#0a0a0a" },
  { label: "Dark zinc", value: "#18181b" },
  { label: "Dark slate", value: "#0f172a" },
  { label: "Deep navy", value: "#0a0f2e" },
  { label: "Deep purple", value: "#120a2a" },
];

export default function LottieEditor({ initial }: LottieEditorProps) {
  const router = useRouter();
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [scrollHeight, setScrollHeight] = useState(initial?.scroll_height ?? 3000);
  const [breakpoints, setBreakpoints] = useState<BreakpointConfig[]>(
    initial?.breakpoints ?? [newBreakpoint()]
  );
  const [bgColor, setBgColor] = useState<string | null>(
    initial?.background_color ?? null
  );
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(
    initial?.background_image_url ?? null
  );
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBreakpoint = useCallback(
    (id: string, updates: Partial<BreakpointConfig>) => {
      setBreakpoints((prev) =>
        prev.map((bp) => (bp.id === id ? { ...bp, ...updates } : bp))
      );
    },
    []
  );

  const removeBreakpoint = useCallback((id: string) => {
    setBreakpoints((prev) => prev.filter((bp) => bp.id !== id));
  }, []);

  const addBreakpoint = () => setBreakpoints((prev) => [...prev, newBreakpoint()]);

  const handleUpload = useCallback(
    async (bpId: string, file: File) => {
      setUploadingId(bpId);
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (initial?.id) formData.append("demoId", initial.id);

        const res = await fetch("/api/lottie-demos/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        updateBreakpoint(bpId, {
          lottieUrl: json.url,
          lottieFileName: file.name,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploadingId(null);
      }
    },
    [initial?.id, updateBreakpoint]
  );

  const handleBgImageUpload = async (file: File) => {
    setUploadingBg(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "bg");
      if (initial?.id) formData.append("demoId", initial.id);

      const res = await fetch("/api/lottie-demos/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBgImageUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Background upload failed");
    } finally {
      setUploadingBg(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title,
        scroll_height: scrollHeight,
        breakpoints,
        background_color: bgColor,
        background_image_url: bgImageUrl,
      };

      if (initial?.id) {
        const res = await fetch(`/api/lottie-demos/${initial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        router.refresh();
      } else {
        const res = await fetch("/api/lottie-demos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        router.push(`/lottie/${json.id}/edit`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Left: form */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="label">Demo title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My animation demo"
            className="input text-lg"
          />
        </div>

        {/* Scroll height */}
        <div>
          <label className="label">
            Scroll container height — {scrollHeight.toLocaleString()}px
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={500}
              max={20000}
              step={100}
              value={scrollHeight}
              onChange={(e) => setScrollHeight(Number(e.target.value))}
              className="flex-1 accent-zinc-900 dark:accent-zinc-100"
            />
            <input
              type="number"
              value={scrollHeight}
              min={500}
              step={100}
              onChange={(e) => setScrollHeight(Number(e.target.value))}
              className="input w-28"
            />
          </div>
        </div>

        {/* Background */}
        <div className="space-y-3">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
            Background
          </h3>

          {/* Preset swatches */}
          <div>
            <label className="label">Preset colors</label>
            <div className="flex flex-wrap gap-2">
              {/* Transparent */}
              <button
                type="button"
                title="Transparent"
                onClick={() => { setBgColor(null); setBgImageUrl(null); }}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  !bgColor && !bgImageUrl
                    ? "border-zinc-900 dark:border-zinc-100 scale-110"
                    : "border-zinc-300 dark:border-zinc-600"
                }`}
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#d4d4d8 0% 25%, #f4f4f5 0% 50%)",
                  backgroundSize: "8px 8px",
                }}
              />
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => { setBgColor(c.value); setBgImageUrl(null); }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    bgColor === c.value && !bgImageUrl
                      ? "border-zinc-900 dark:border-zinc-100 scale-110"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Custom color picker */}
          <div>
            <label className="label">Custom color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor ?? "#ffffff"}
                onChange={(e) => { setBgColor(e.target.value); setBgImageUrl(null); }}
                className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer bg-transparent p-0.5"
              />
              <input
                type="text"
                value={bgColor ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setBgColor(v || null);
                  setBgImageUrl(null);
                }}
                placeholder="#ffffff"
                className="input w-32 font-mono text-sm"
              />
              {bgColor && (
                <button
                  type="button"
                  onClick={() => setBgColor(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Background image */}
          <div>
            <label className="label">Background image</label>
            <div className="flex items-center gap-2">
              {bgImageUrl ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 shrink-0"
                    style={{
                      backgroundImage: `url(${bgImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="text-xs text-zinc-500 truncate flex-1">
                    {bgImageUrl.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBgImageUrl(null)}
                    className="text-xs text-red-500 hover:text-red-600 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-1">
                  No image selected
                </span>
              )}
              <button
                type="button"
                disabled={uploadingBg}
                onClick={() => bgImageInputRef.current?.click()}
                className="btn-secondary text-sm shrink-0"
              >
                {uploadingBg ? "Uploading…" : "Upload image"}
              </button>
              <input
                ref={bgImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBgImageUpload(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>

        {/* Breakpoints */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
              Breakpoints
            </h3>
            <button type="button" onClick={addBreakpoint} className="btn-secondary text-sm">
              + Add breakpoint
            </button>
          </div>

          {breakpoints.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center border border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl">
              No breakpoints. Add at least one.
            </p>
          )}

          {breakpoints.map((bp, i) => (
            <BreakpointConfigPanel
              key={bp.id}
              breakpoint={bp}
              index={i}
              demoId={initial?.id ?? null}
              uploading={uploadingId === bp.id}
              onUpdate={updateBreakpoint}
              onRemove={removeBreakpoint}
              onUpload={handleUpload}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create demo"}
        </button>

        {initial && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-2 bg-zinc-50 dark:bg-zinc-800/50">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Public demo URL
            </p>
            <div className="flex gap-2">
              <code className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-600 dark:text-zinc-400 truncate">
                /demo/{initial.slug}
              </code>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/demo/${initial.slug}`;
                  navigator.clipboard.writeText(url);
                }}
                className="btn-secondary text-sm shrink-0"
              >
                Copy
              </button>
              <a
                href={`/demo/${initial.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm shrink-0"
              >
                Open
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Right: preview */}
      <div className="space-y-4">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
          Live preview
        </h3>
        <EditorPreview
          breakpoints={breakpoints}
          scrollHeight={scrollHeight}
          backgroundColor={bgColor}
          backgroundImageUrl={bgImageUrl}
        />
      </div>
    </div>
  );
}
