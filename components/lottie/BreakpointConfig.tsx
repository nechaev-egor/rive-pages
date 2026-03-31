"use client";

import { useRef } from "react";
import { BreakpointConfig } from "@/lib/lottie-demos";

interface BreakpointConfigProps {
  breakpoint: BreakpointConfig;
  index: number;
  demoId: string | null;
  uploading: boolean;
  onUpdate: (id: string, updates: Partial<BreakpointConfig>) => void;
  onRemove: (id: string) => void;
  onUpload: (id: string, file: File) => void;
}

export default function BreakpointConfigPanel({
  breakpoint: bp,
  index,
  uploading,
  onUpdate,
  onRemove,
  onUpload,
}: BreakpointConfigProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (updates: Partial<BreakpointConfig>) => onUpdate(bp.id, updates);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Breakpoint {index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(bp.id)}
          className="text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Label */}
      <div>
        <label className="label">Label</label>
        <input
          type="text"
          value={bp.label}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="Mobile, Tablet, Desktop…"
          className="input"
        />
      </div>

      {/* Width range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Min width (px)</label>
          <input
            type="number"
            value={bp.minWidth}
            min={0}
            onChange={(e) => update({ minWidth: Number(e.target.value) })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Max width (px)</label>
          <input
            type="number"
            value={bp.maxWidth ?? ""}
            min={0}
            placeholder="∞ (none)"
            onChange={(e) =>
              update({ maxWidth: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="input"
          />
        </div>
      </div>

      {/* Lottie file */}
      <div>
        <label className="label">Lottie file (.json / .lottie)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={bp.lottieUrl}
            onChange={(e) => update({ lottieUrl: e.target.value, lottieFileName: "" })}
            placeholder="https://... or upload below"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary shrink-0"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.lottie"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(bp.id, file);
              e.target.value = "";
            }}
          />
        </div>
        {bp.lottieFileName && (
          <p className="mt-1 text-xs text-zinc-400 truncate">{bp.lottieFileName}</p>
        )}
      </div>

      {/* Position */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">Position (X, Y)</label>
          <select
            value={bp.positionUnit}
            onChange={(e) => update({ positionUnit: e.target.value as "px" | "%" })}
            className="select-sm"
          >
            <option value="%">%</option>
            <option value="px">px</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={bp.position.x}
            onChange={(e) => update({ position: { ...bp.position, x: Number(e.target.value) } })}
            placeholder="X"
            className="input"
          />
          <input
            type="number"
            value={bp.position.y}
            onChange={(e) => update({ position: { ...bp.position, y: Number(e.target.value) } })}
            placeholder="Y"
            className="input"
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">Size (W × H)</label>
          <select
            value={bp.sizeUnit}
            onChange={(e) => update({ sizeUnit: e.target.value as "px" | "%" })}
            className="select-sm"
          >
            <option value="%">%</option>
            <option value="px">px</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={bp.size.width}
            min={1}
            onChange={(e) => update({ size: { ...bp.size, width: Number(e.target.value) } })}
            placeholder="Width"
            className="input"
          />
          <input
            type="number"
            value={bp.size.height}
            min={1}
            onChange={(e) => update({ size: { ...bp.size, height: Number(e.target.value) } })}
            placeholder="Height"
            className="input"
          />
        </div>
      </div>
    </div>
  );
}
