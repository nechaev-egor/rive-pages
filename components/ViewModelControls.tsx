"use client";

import React from "react";
import {
  useViewModelInstanceNumber,
  useViewModelInstanceString,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
  useViewModelInstanceEnum,
  useViewModelInstanceColor,
} from "@rive-app/react-webgl2";
import type { ViewModelInstance } from "@rive-app/webgl2";

// DataType enum (numeric) and string type names from Rive runtime
const DataType = {
  none: 0,
  string: 1,
  number: 2,
  boolean: 3,
  color: 4,
  list: 5,
  enumType: 6,
  trigger: 7,
  viewModel: 8,
} as const;


function getTypeForCheck(type: unknown): string {
  if (typeof type === "string") return type.toLowerCase();
  if (typeof type === "number") return Object.entries(DataType).find(([, v]) => v === type)?.[0] ?? "";
  return "";
}

type ViewModelProperty = { name: string; type: number | string };

interface ViewModelControlsProps {
  instance: ViewModelInstance | null;
  properties: ViewModelProperty[];
}

function PropertyControl({
  instance,
  prop,
}: {
  instance: ViewModelInstance;
  prop: ViewModelProperty;
}) {
  const path = prop.name;
  const typeStr = getTypeForCheck(prop.type);

  if (typeStr === "number" || prop.type === DataType.number) {
    const { value, setValue } = useViewModelInstanceNumber(path, instance);
    return (
      <div>
        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1 truncate">{path}</label>
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
        />
      </div>
    );
  }

  if (typeStr === "string" || prop.type === DataType.string) {
    const { value, setValue } = useViewModelInstanceString(path, instance);
    return (
      <div>
        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1 truncate">{path}</label>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
        />
      </div>
    );
  }

  if (typeStr === "boolean" || prop.type === DataType.boolean) {
    const { value, setValue } = useViewModelInstanceBoolean(path, instance);
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={path}
          checked={value ?? false}
          onChange={(e) => setValue(e.target.checked)}
          className="rounded"
        />
        <label htmlFor={path} className="text-sm truncate">
          {path}
        </label>
      </div>
    );
  }

  if (typeStr === "trigger" || prop.type === DataType.trigger) {
    const { trigger } = useViewModelInstanceTrigger(path, instance);
    return (
      <div>
        <button
          type="button"
          onClick={() => trigger?.()}
          className="w-full px-3 py-1.5 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm font-medium"
        >
          {path}
        </button>
      </div>
    );
  }

  if (typeStr === "color" || prop.type === DataType.color) {
    const { setRgb } = useViewModelInstanceColor(path, instance);
    return (
      <div>
        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1 truncate">{path}</label>
        <input
          type="color"
          defaultValue="#000000"
          onChange={(e) => {
            const hex = e.target.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            setRgb?.(r, g, b);
          }}
          className="w-full h-8 rounded border border-zinc-300 dark:border-zinc-600 cursor-pointer"
        />
      </div>
    );
  }

  if (typeStr === "enum" || typeStr === "enumtype" || prop.type === DataType.enumType) {
    const { value, setValue, values } = useViewModelInstanceEnum(path, instance);
    const options = values ?? [];
    return (
      <div>
        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1 truncate">{path}</label>
        <select
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
        >
          {options.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const displayType = typeof prop.type === "string" ? prop.type : (Object.entries(DataType).find(([, v]) => v === prop.type)?.[0] ?? "?");
  return (
    <div className="text-xs text-zinc-400 truncate" title={path}>
      {path} ({displayType})
    </div>
  );
}

export default function ViewModelControls({ instance, properties }: ViewModelControlsProps) {
  const [filter, setFilter] = React.useState("");
  const filtered = React.useMemo(
    () =>
      filter.trim()
        ? properties.filter((p) =>
            p.name.toLowerCase().includes(filter.toLowerCase().trim())
          )
        : properties,
    [properties, filter]
  );

  if (!instance || properties.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Переменные ViewModel ({filtered.length}{filter ? ` / ${properties.length}` : ""})
      </p>
      {properties.length > 5 && (
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
        />
      )}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filtered.map((prop) => (
          <PropertyControl key={prop.name} instance={instance} prop={prop} />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-zinc-500">Нет совпадений</p>
        )}
      </div>
    </div>
  );
}
