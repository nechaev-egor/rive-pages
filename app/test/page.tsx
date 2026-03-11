"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ViewModelControls from "@/components/ViewModelControls";
import IntegrationsPanel from "@/components/IntegrationsPanel";
import ResponsiveViewer from "@/components/ResponsiveViewer";
import type { RiveMetadata } from "@/components/RiveViewer";
import { FIT_OPTIONS } from "@/components/RiveViewer";
import type { ViewModelInstance } from "@rive-app/webgl2";

const RiveViewer = dynamic(() => import("@/components/RiveViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg">
      <span className="text-zinc-500">Loading Rive...</span>
    </div>
  ),
});

const PRESETS = [
  {
    name: "Vehicles (Bumpy)",
    src: "https://cdn.rive.app/animations/vehicles.riv",
    stateMachines: "bumpy",
  },
];

type Tab = {
  id: string;
  url: string;
  stateMachine: string;
  stateMachineInput: string;
  artboard: string;
  artboardInput: string;
  viewModel: string;
  viewModelInput: string;
  fileName: string | null;
  blobUrl?: string;
  title: string;
  viewModelInstance: ViewModelInstance | null;
  viewModelProperties: { name: string; type: number | string }[];
  metadata: RiveMetadata | null;
};

function createTab(
  url: string,
  stateMachine: string,
  fileName: string | null,
  blobUrl?: string,
  title?: string,
  id?: string
): Tab {
  const tabId = id ?? crypto.randomUUID();
  const displayTitle =
    title ??
    fileName ??
    (url.startsWith("blob:") ? "File" : url.split("/").pop()?.split("?")[0] ?? "Animation");
  return {
    id: tabId,
    url,
    stateMachine,
    stateMachineInput: stateMachine,
    artboard: "",
    artboardInput: "",
    viewModel: "",
    viewModelInput: "",
    fileName,
    blobUrl,
    title: displayTitle,
    viewModelInstance: null,
    viewModelProperties: [],
    metadata: null,
  };
}

const INITIAL_TAB_ID = "initial-tab";

export default function TestPage() {
  const [tabs, setTabs] = useState<Tab[]>(() => [
    createTab(PRESETS[0].src, PRESETS[0].stateMachines, null, undefined, PRESETS[0].name, INITIAL_TAB_ID),
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const [customUrl, setCustomUrl] = useState("");
  const [layoutScaleFactor, setLayoutScaleFactor] = useState(1);
  const [fit, setFit] = useState<(typeof FIT_OPTIONS)[number]["value"]>("Contain");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  const addTab = useCallback((tab: Tab) => {
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const closeTab = useCallback((id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab?.blobUrl) URL.revokeObjectURL(tab.blobUrl);
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0]?.id ?? remaining[remaining.length - 1]?.id ?? "");
    }
  }, [tabs, activeTabId]);

  const updateActiveTab = useCallback(
    (updates: Partial<Pick<Tab, "stateMachine" | "stateMachineInput" | "artboard" | "artboardInput" | "viewModel" | "viewModelInput" | "viewModelInstance" | "viewModelProperties" | "metadata">>) => {
      if (!activeTab) return;
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, ...updates } : t))
      );
    },
    [activeTab]
  );

  const handleViewModelReady = useCallback(
    (tabId: string) => (instance: ViewModelInstance, properties: { name: string; type: number | string }[]) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? { ...t, viewModelInstance: instance, viewModelProperties: properties }
            : t
        )
      );
    },
    []
  );

  const handleMetadataLoaded = useCallback(
    (tabId: string) => (metadata: RiveMetadata) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, metadata } : t))
      );
    },
    []
  );

  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    addTab(createTab(preset.src, preset.stateMachines, null, undefined, preset.name));
  };

  const loadCustom = () => {
    if (customUrl.trim()) {
      addTab(createTab(customUrl.trim(), "", null));
      setCustomUrl("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".riv")) {
      alert("Please select a .riv file");
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    const tab = createTab(blobUrl, "", file.name, blobUrl, file.name);
    addTab(tab);
    e.target.value = "";
  };

  const applyStateMachine = () => {
    if (activeTab) updateActiveTab({ stateMachine: activeTab.stateMachineInput });
  };

  const applyArtboard = () => {
    if (activeTab) updateActiveTab({ artboard: activeTab.artboardInput });
  };

  const applyViewModel = () => {
    if (activeTab) {
      updateActiveTab({
        viewModel: activeTab.viewModelInput,
        artboard: activeTab.artboardInput || activeTab.artboard,
        viewModelInstance: null,
        viewModelProperties: [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Rive Testing
          </h1>
          <Link
            href="/docs"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm"
          >
            Docs
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 overflow-x-auto">
        <div className="flex flex-wrap gap-8">
          <div className="flex-[1_0_auto] min-w-0 space-y-4">
            <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`group flex items-center gap-1 px-3 py-2 rounded-t-lg border-b-2 -mb-px min-w-0 max-w-[180px] ${
                    tab.id === activeTabId
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                      : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <button
                    onClick={() => setActiveTabId(tab.id)}
                    className="flex-1 truncate text-left text-sm font-medium"
                  >
                    {tab.title}
                  </button>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="shrink-0 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 opacity-60 hover:opacity-100"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {activeTab && (
              <>
                <ResponsiveViewer layoutScaleFactor={layoutScaleFactor}>
                  <RiveViewer
                    key={`${activeTab.url}--${activeTab.stateMachine}--${activeTab.viewModel}--${activeTab.artboard}--${fit}`}
                    src={activeTab.url}
                    stateMachines={activeTab.stateMachine || undefined}
                    artboard={activeTab.artboard?.trim() || undefined}
                    viewModel={activeTab.viewModel || undefined}
                    fit={FIT_OPTIONS.find((o) => o.value === fit)?.fit ?? FIT_OPTIONS[0].fit}
                    layoutScaleFactor={layoutScaleFactor}
                    onMetadataLoaded={handleMetadataLoaded(activeTab.id)}
                    onViewModelReady={handleViewModelReady(activeTab.id)}
                    className="w-full h-full rounded-lg"
                  />
                </ResponsiveViewer>
                <Link
                  href={`/test/view?${new URLSearchParams({
                    url: activeTab.url,
                    stateMachine: activeTab.stateMachine,
                    artboard: activeTab.artboard,
                    viewModel: activeTab.viewModel,
                    title: activeTab.title,
                    scale: String(layoutScaleFactor),
                    fit,
                  }).toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm font-medium transition-colors"
                >
                  Full view →
                </Link>
              </>
            )}
            {PRESETS.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.src}
                    onClick={() => loadPreset(preset)}
                    className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm font-medium transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-80 shrink-0 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Fit
              </label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as (typeof FIT_OPTIONS)[number]["value"])}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
              >
                {FIT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Scale (layoutScaleFactor)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.05"
                  value={layoutScaleFactor}
                  onChange={(e) => setLayoutScaleFactor(parseFloat(e.target.value))}
                  className="flex-1 h-2 rounded-lg appearance-none bg-zinc-200 dark:bg-zinc-700 accent-zinc-900 dark:accent-zinc-100"
                />
                <span className="w-12 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {layoutScaleFactor.toFixed(2)}×
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Only for Fit.Layout
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Load file
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".riv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm font-medium transition-colors"
              >
                Select .riv file
              </button>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Adds a new tab
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Load by URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://cdn.rive.app/..."
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                />
                <button
                  onClick={loadCustom}
                  className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:opacity-90"
                >
                  Load
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Adds a new tab
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                State Machine (optional)
              </label>
              {activeTab?.metadata?.stateMachines && activeTab.metadata.stateMachines.length > 0 ? (
                <select
                  value={activeTab.stateMachine}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateActiveTab({ stateMachineInput: v, stateMachine: v });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                  disabled={!activeTab}
                >
                  <option value="">— Not selected —</option>
                  {[...new Set(activeTab.metadata.stateMachines.map((sm) => sm.name))].map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeTab?.stateMachineInput ?? ""}
                    onChange={(e) => updateActiveTab({ stateMachineInput: e.target.value })}
                    placeholder="State Machine name"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                    disabled={!activeTab}
                  />
                  <button
                    onClick={applyStateMachine}
                    className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:opacity-90 shrink-0 disabled:opacity-50"
                    disabled={!activeTab}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Artboard (optional)
              </label>
              {activeTab?.metadata?.artboards && activeTab.metadata.artboards.length > 0 ? (
                <select
                  value={activeTab.artboard}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateActiveTab({ artboardInput: v, artboard: v });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                  disabled={!activeTab}
                >
                  <option value="">— Not selected —</option>
                  {activeTab.metadata.artboards.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeTab?.artboardInput ?? ""}
                    onChange={(e) => updateActiveTab({ artboardInput: e.target.value })}
                    placeholder="Website development"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                    disabled={!activeTab}
                  />
                  <button
                    onClick={applyArtboard}
                    className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:opacity-90 shrink-0 disabled:opacity-50"
                    disabled={!activeTab}
                  >
                    Apply
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Specify artboard with ViewModel to avoid errors
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                ViewModel (optional)
              </label>
              {activeTab?.metadata?.viewModels && activeTab.metadata.viewModels.length > 0 ? (
                <select
                  value={activeTab.viewModel}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateActiveTab({
                      viewModelInput: v,
                      viewModel: v,
                      artboard: activeTab.artboardInput || activeTab.artboard,
                      viewModelInstance: null,
                      viewModelProperties: [],
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                  disabled={!activeTab}
                >
                  <option value="">— Not selected —</option>
                  {activeTab.metadata.viewModels.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeTab?.viewModelInput ?? ""}
                    onChange={(e) => updateActiveTab({ viewModelInput: e.target.value })}
                    placeholder="ViewModel1"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                    disabled={!activeTab}
                  />
                  <button
                    onClick={applyViewModel}
                    className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:opacity-90 shrink-0 disabled:opacity-50"
                    disabled={!activeTab}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
            {activeTab && (
              <ViewModelControls
                instance={activeTab.viewModelInstance}
                properties={activeTab.viewModelProperties}
              />
            )}
            {activeTab && (
              <IntegrationsPanel
                url={activeTab.url}
                stateMachine={activeTab.stateMachine}
                viewModel={activeTab.viewModel}
                viewModelProperties={activeTab.viewModelProperties}
              />
            )}
            {activeTab && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tab: {activeTab.title}
                </p>
                <p className="break-all text-xs">
                  {activeTab.fileName ?? (activeTab.url.startsWith("blob:") ? "Local file" : activeTab.url)}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
