"use client";

import { useRive, useViewModel, useViewModelInstance } from "@rive-app/react-webgl2";
import { Layout, Fit, Alignment } from "@rive-app/webgl2";

export const FIT_OPTIONS = [
  { value: "Layout", label: "Layout", fit: Fit.Layout },
  { value: "Contain", label: "Contain", fit: Fit.Contain },
  { value: "Cover", label: "Cover", fit: Fit.Cover },
  { value: "FitWidth", label: "FitWidth", fit: Fit.FitWidth },
  { value: "FitHeight", label: "FitHeight", fit: Fit.FitHeight },
  { value: "ScaleDown", label: "ScaleDown", fit: Fit.ScaleDown },
  { value: "Fill", label: "Fill", fit: Fit.Fill },
  { value: "None", label: "None", fit: Fit.None },
] as const;
import { useEffect, useRef } from "react";

export interface RiveMetadata {
  artboards: string[];
  stateMachines: { artboard: string; name: string }[];
  viewModels: string[];
}

interface RiveViewerProps {
  src: string;
  stateMachines?: string | string[];
  animations?: string | string[];
  artboard?: string;
  viewModel?: string;
  className?: string;
  /** Fit mode: Layout, Contain, Cover, etc. */
  fit?: (typeof FIT_OPTIONS)[number]["fit"];
  /** Layout scale (only for Fit.Layout). Default 1 */
  layoutScaleFactor?: number;
  onLoad?: () => void;
  onMetadataLoaded?: (metadata: RiveMetadata) => void;
  onViewModelReady?: (instance: import("@rive-app/webgl2").ViewModelInstance, properties: { name: string; type: number | string }[]) => void;
}

export default function RiveViewer({
  src,
  stateMachines,
  animations,
  artboard,
  viewModel,
  className = "w-full h-96",
  fit = Fit.Contain,
  layoutScaleFactor = 1,
  onLoad,
  onMetadataLoaded,
  onViewModelReady,
}: RiveViewerProps) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachines ?? undefined,
    animations: animations ?? undefined,
    artboard: artboard ?? undefined,
    layout: new Layout({
      fit,
      alignment: Alignment.Center,
      ...(fit === Fit.Layout && { layoutScaleFactor }),
    }),
    autoplay: true,
    autoBind: false,
    onLoad,
  });

  const riveViewModel = useViewModel(rive, viewModel ? { name: viewModel } : undefined);
  const viewModelInstance = useViewModelInstance(
    riveViewModel,
    viewModel && rive ? { rive, useDefault: true } : undefined
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const onMetadataLoadedRef = useRef(onMetadataLoaded);
  const onViewModelReadyRef = useRef(onViewModelReady);
  onMetadataLoadedRef.current = onMetadataLoaded;
  onViewModelReadyRef.current = onViewModelReady;

  // Update layout when fit or layoutScaleFactor changes
  useEffect(() => {
    if (!rive) return;
    rive.layout = new Layout({
      fit,
      alignment: Alignment.Center,
      ...(fit === Fit.Layout && { layoutScaleFactor }),
    });
    rive.resizeDrawingSurfaceToCanvas?.() ?? rive.resizeToCanvas?.();
  }, [rive, fit, layoutScaleFactor]);

  // As in example: resizeDrawingSurfaceToCanvas on load and resize
  useEffect(() => {
    if (!rive || !containerRef.current) return;
    const resize = () => rive.resizeDrawingSurfaceToCanvas?.() ?? rive.resizeToCanvas?.();
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(containerRef.current);
    const onWindowResize = () => resize();
    window.addEventListener("resize", onWindowResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, [rive]);

  useEffect(() => {
    if (!rive || !onMetadataLoadedRef.current) return;
    try {
      const contents = rive.contents;
      const artboards = (contents?.artboards ?? []).map((a) => a.name);
      const stateMachines = (contents?.artboards ?? []).flatMap((a) =>
        (a.stateMachines ?? []).map((sm) => ({ artboard: a.name, name: sm.name }))
      );
      const viewModels: string[] = [];
      for (let i = 0; i < rive.viewModelCount; i++) {
        const vm = rive.viewModelByIndex(i);
        if (vm?.name) viewModels.push(vm.name);
      }
      onMetadataLoadedRef.current({ artboards, stateMachines, viewModels });
    } catch {
      // ignore
    }
  }, [rive]);

  useEffect(() => {
    if (!viewModel || !viewModelInstance || !onViewModelReadyRef.current) return;
    try {
      const properties = viewModelInstance.properties ?? riveViewModel?.properties ?? [];
      onViewModelReadyRef.current(viewModelInstance, properties);
    } catch {
      onViewModelReadyRef.current(viewModelInstance, []);
    }
  }, [viewModel, viewModelInstance, riveViewModel]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 ${className}`}
    >
      <RiveComponent className="w-full h-full" style={{ display: "block" }} />
    </div>
  );
}
