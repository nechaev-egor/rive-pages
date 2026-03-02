"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import ViewModelControls from "@/components/ViewModelControls";
import type { ViewModelInstance } from "@rive-app/webgl2";

const RiveViewer = dynamic(() => import("@/components/RiveViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <span className="text-zinc-500">Загрузка...</span>
    </div>
  ),
});

function ViewPageContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const stateMachine = searchParams.get("stateMachine") ?? "";
  const viewModel = searchParams.get("viewModel") ?? "";
  const title = searchParams.get("title") ?? "Анимация";

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
        <p className="text-zinc-600 dark:text-zinc-400">Нет данных для отображения</p>
        <Link
          href="/test"
          className="text-zinc-900 dark:text-zinc-100 underline hover:no-underline"
        >
          ← Вернуться к тестеру
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
          ← Тестер
        </Link>
        <h1 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[60%]">
          {decodeURIComponent(title)}
        </h1>
        <div className="w-16" />
      </header>

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 min-w-0 flex items-center justify-center p-4">
          <RiveViewer
            key={`${url}--${stateMachine}--${viewModel}`}
            src={url}
            stateMachines={stateMachine || undefined}
            viewModel={viewModel || undefined}
            onViewModelReady={handleViewModelReady}
            className="w-full max-w-4xl aspect-video min-h-[300px]"
          />
        </main>

        <aside className="w-80 shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 overflow-y-auto">
          <ViewModelControls instance={viewModelInstance} properties={viewModelProperties} />
          {viewModelProperties.length === 0 && viewModel && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
              Ожидание загрузки переменных...
            </p>
          )}
          {!viewModel && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Укажите ViewModel в тестере и откройте полный просмотр снова.
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
          <span className="text-zinc-500">Загрузка...</span>
        </div>
      }
    >
      <ViewPageContent />
    </Suspense>
  );
}
