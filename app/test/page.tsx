"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ViewModelControls from "@/components/ViewModelControls";
import type { ViewModelInstance } from "@rive-app/webgl2";

const RiveViewer = dynamic(() => import("@/components/RiveViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg">
      <span className="text-zinc-500">Загрузка Rive...</span>
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
  viewModel: string;
  viewModelInput: string;
  fileName: string | null;
  blobUrl?: string;
  title: string;
  viewModelInstance: ViewModelInstance | null;
  viewModelProperties: { name: string; type: number | string }[];
};

function createTab(
  url: string,
  stateMachine: string,
  fileName: string | null,
  blobUrl?: string,
  title?: string
): Tab {
  const id = crypto.randomUUID();
  const displayTitle =
    title ??
    fileName ??
    (url.startsWith("blob:") ? "Файл" : url.split("/").pop()?.split("?")[0] ?? "Анимация");
  return {
    id,
    url,
    stateMachine,
    stateMachineInput: stateMachine,
    viewModel: "",
    viewModelInput: "",
    fileName,
    blobUrl,
    title: displayTitle,
    viewModelInstance: null,
    viewModelProperties: [],
  };
}

export default function TestPage() {
  const [tabs, setTabs] = useState<Tab[]>(() => [
    createTab(PRESETS[0].src, PRESETS[0].stateMachines, null, undefined, PRESETS[0].name),
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const [customUrl, setCustomUrl] = useState("");
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
    (updates: Partial<Pick<Tab, "stateMachine" | "stateMachineInput" | "viewModel" | "viewModelInput" | "viewModelInstance" | "viewModelProperties">>) => {
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
      alert("Выберите файл .riv");
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

  const applyViewModel = () => {
    if (activeTab) {
      updateActiveTab({
        viewModel: activeTab.viewModelInput,
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
            ← Назад
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Тестирование Rive
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
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
                      aria-label="Закрыть"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {activeTab && (
              <>
                <RiveViewer
                  key={`${activeTab.url}--${activeTab.stateMachine}--${activeTab.viewModel}`}
                  src={activeTab.url}
                  stateMachines={activeTab.stateMachine || undefined}
                  viewModel={activeTab.viewModel || undefined}
                  onViewModelReady={handleViewModelReady(activeTab.id)}
                  className="w-full aspect-video min-h-[400px]"
                />
                <Link
                  href={`/test/view?${new URLSearchParams({
                    url: activeTab.url,
                    stateMachine: activeTab.stateMachine,
                    viewModel: activeTab.viewModel,
                    title: activeTab.title,
                  }).toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm font-medium transition-colors"
                >
                  Полный просмотр →
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Загрузить файл
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
                Выбрать .riv файл
              </button>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Добавляет новую вкладку
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Загрузить по URL
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
                  Загрузить
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Добавляет новую вкладку
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                State Machine (опционально)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={activeTab?.stateMachineInput ?? ""}
                  onChange={(e) => updateActiveTab({ stateMachineInput: e.target.value })}
                  placeholder="Название State Machine"
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                  disabled={!activeTab}
                />
                <button
                  onClick={applyStateMachine}
                  className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:opacity-90 shrink-0 disabled:opacity-50"
                  disabled={!activeTab}
                >
                  Применить
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                ViewModel (опционально)
              </label>
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
                  Применить
                </button>
              </div>
            </div>
            {activeTab && (
              <ViewModelControls
                instance={activeTab.viewModelInstance}
                properties={activeTab.viewModelProperties}
              />
            )}
            {activeTab && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Вкладка: {activeTab.title}
                </p>
                <p className="break-all text-xs">
                  {activeTab.fileName ?? (activeTab.url.startsWith("blob:") ? "Локальный файл" : activeTab.url)}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
