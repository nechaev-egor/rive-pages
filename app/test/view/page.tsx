"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import ViewModelControls from "@/components/ViewModelControls";
import IntegrationsPanel from "@/components/IntegrationsPanel";
import ResponsiveViewer from "@/components/ResponsiveViewer";
import type { ViewModelInstance } from "@rive-app/webgl2";
import { FIT_OPTIONS } from "@/components/RiveViewer";

const RiveViewer = dynamic(() => import("@/components/RiveViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <span className="text-zinc-500">Loading...</span>
    </div>
  ),
});

function ViewPageContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const stateMachine = searchParams.get("stateMachine") ?? "";
  const artboard = searchParams.get("artboard") ?? "";
  const viewModel = searchParams.get("viewModel") ?? "";
  const title = searchParams.get("title") ?? "Animation";
  const scaleParam = searchParams.get("scale");
  const layoutScaleFactor = scaleParam ? Math.max(0.25, Math.min(3, parseFloat(scaleParam) || 1)) : 1;
  const fitParam = searchParams.get("fit");
  const fit = FIT_OPTIONS.find((o) => o.value === fitParam)?.fit ?? FIT_OPTIONS[1].fit;

  const [viewModelInstance, setViewModelInstance] = useState<ViewModelInstance | null>(null);
  const [viewModelProperties, setViewModelProperties] = useState<
    { name: string; type: number | string }[]
  >([]);

  const handleViewModelReady = useCallback(
    (instance: ViewModelInstance, properties: { name: string; type: number | string }[]) => {
      setViewModelInstance(instance);
      setViewModelProperties(properties);
    },
    []
  );

  if (!url) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">No data to display</p>
        <Link
          href="/test"
          className="text-zinc-900 dark:text-zinc-100 underline hover:no-underline"
        >
          ← Back to tester
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 flex items-center justify-between">
        <Link
          href="/test"
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm"
        >
          ← Tester
        </Link>
        <h1 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[60%]">
          {decodeURIComponent(title)}
        </h1>
        <div className="w-16" />
      </header>

      <div className="flex-1 flex flex-wrap min-h-0 overflow-x-auto">
        <main className="flex-[1_0_auto] min-w-0 flex items-center justify-center p-4">
          <ResponsiveViewer layoutScaleFactor={layoutScaleFactor}>
            <RiveViewer
              key={`${url}--${stateMachine}--${viewModel}--${artboard}--${fitParam ?? "Contain"}`}
              src={url}
              stateMachines={stateMachine || undefined}
              artboard={artboard?.trim() || undefined}
              viewModel={viewModel || undefined}
              fit={fit}
              layoutScaleFactor={layoutScaleFactor}
              onViewModelReady={handleViewModelReady}
              className="w-full h-full rounded-lg"
            />
          </ResponsiveViewer>
        </main>

        <aside className="w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 overflow-y-auto space-y-6">
          <ViewModelControls instance={viewModelInstance} properties={viewModelProperties} />
          <IntegrationsPanel
            url={url}
            stateMachine={stateMachine}
            viewModel={viewModel}
            viewModelProperties={viewModelProperties}
          />
          {viewModelProperties.length === 0 && viewModel && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
              Waiting for variables to load...
            </p>
          )}
          {!viewModel && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Specify ViewModel in the tester and open full view again.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <span className="text-zinc-500">Loading...</span>
        </div>
      }
    >
      <ViewPageContent />
    </Suspense>
  );
}
