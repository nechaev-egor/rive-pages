"use client";

import React, { useState } from "react";

type ViewModelProperty = { name: string; type: number | string };

interface IntegrationsPanelProps {
  url: string;
  stateMachine: string;
  viewModel: string;
  viewModelProperties: ViewModelProperty[];
}

function getPropType(prop: ViewModelProperty): string {
  const t = typeof prop.type === "string" ? prop.type.toLowerCase() : "";
  if (["number", "string", "boolean", "trigger", "enum", "color"].includes(t)) return t;
  if (prop.type === 2) return "number";
  if (prop.type === 1) return "string";
  if (prop.type === 3) return "boolean";
  if (prop.type === 7) return "trigger";
  if (prop.type === 6) return "enum";
  if (prop.type === 4) return "color";
  return "unknown";
}

function generateReactIntegration(
  url: string,
  stateMachine: string,
  viewModel: string,
  properties: ViewModelProperty[]
): string {
  const hasStateMachine = !!stateMachine.trim();
  const hasViewModel = !!viewModel.trim();
  const displayUrl = url.startsWith("blob:") ? "YOUR_RIV_URL" : `"${url}"`;

  let code = `import { useRive } from "@rive-app/react-webgl2";

export function MyRiveAnimation() {
  const { RiveComponent } = useRive({
    src: ${displayUrl},`;

  if (hasStateMachine) {
    code += `
    stateMachines: "${stateMachine}",`;
  }
  if (hasViewModel) {
    code += `
    viewModel: "${viewModel}",
    autoBind: false,`;
  }

  code += `
    autoplay: true,
  });

  return <RiveComponent className="w-full h-full" />;
}
`;

  if (hasViewModel && properties.length > 0) {
    code += `\n// With ViewModel and variables:\n\n`;
    code += `import { useRive, useViewModel, useViewModelInstance`;
    const hooks = new Set<string>();
    properties.forEach((p) => {
      const t = getPropType(p);
      if (t === "number") hooks.add("useViewModelInstanceNumber");
      if (t === "string") hooks.add("useViewModelInstanceString");
      if (t === "boolean") hooks.add("useViewModelInstanceBoolean");
      if (t === "trigger") hooks.add("useViewModelInstanceTrigger");
      if (t === "enum") hooks.add("useViewModelInstanceEnum");
      if (t === "color") hooks.add("useViewModelInstanceColor");
    });
    if (hooks.size > 0) {
      code += `,\n  ${[...hooks].join(",\n  ")}`;
    }
    code += ` } from "@rive-app/react-webgl2";

export function MyRiveWithViewModel() {
  const { rive, RiveComponent } = useRive({
    src: ${displayUrl},
    stateMachines: ${hasStateMachine ? `"${stateMachine}"` : "undefined"},
    viewModel: "${viewModel}",
    autoBind: false,
    autoplay: true,
  });

  const viewModelDef = useViewModel(rive, { name: "${viewModel}" });
  const viewModelInstance = useViewModelInstance(viewModelDef, {
    rive,
    useDefault: true,
  });
`;

    const toVarName = (s: string) => {
      const v = s.replace(/[^a-zA-Z0-9]/g, "_");
      return /^\d/.test(v) ? `_${v}` : v;
    };

    const toSetterName = (s: string) => {
      const v = s.replace(/[^a-zA-Z0-9]/g, "_");
      const base = /^\d/.test(v) ? `_${v}` : v;
      return "set" + base.charAt(0).toUpperCase() + base.slice(1);
    };
    properties.forEach((prop) => {
      const t = getPropType(prop);
      const path = prop.name;
      const varName = toVarName(path);
      const setterName = toSetterName(path);
      if (t === "number") {
        code += `
  let { value: ${varName}, setValue: ${setterName} } = useViewModelInstanceNumber("${path}", viewModelInstance);`;
      } else if (t === "string") {
        code += `
  let { value: ${varName}, setValue: ${setterName} } = useViewModelInstanceString("${path}", viewModelInstance);`;
      } else if (t === "boolean") {
        code += `
  let { value: ${varName}, setValue: ${setterName} } = useViewModelInstanceBoolean("${path}", viewModelInstance);`;
      } else if (t === "trigger") {
        code += `
  let { trigger: ${varName}Trigger } = useViewModelInstanceTrigger("${path}", viewModelInstance);`;
      } else if (t === "enum") {
        code += `
  let { value: ${varName}, setValue: ${setterName}, values: ${varName}Values } = useViewModelInstanceEnum("${path}", viewModelInstance);`;
      } else if (t === "color") {
        code += `
  let { setRgb: ${setterName}Rgb } = useViewModelInstanceColor("${path}", viewModelInstance);`;
      }
    });

    code += `

  return (
    <div>
      <RiveComponent className="w-full h-full" />
      {/* Update: setValue(newVal), trigger?.(), setRgb(r,g,b) */}
    </div>
  );
}
`;
  }

  return code;
}

function generateVanillaIntegration(
  url: string,
  stateMachine: string,
  viewModel: string,
  properties: ViewModelProperty[]
): string {
  const displayUrl = url.startsWith("blob:") ? "YOUR_RIV_URL" : `"${url}"`;

  let code = `import Rive from "@rive-app/webgl2";

const rive = new Rive({
  src: ${displayUrl},
  canvas: document.getElementById("canvas"),
  stateMachines: "${stateMachine || ""}",
  autoplay: true,
});
`;

  if (viewModel) {
    const vmVar = "vm";
    code += `
// ViewModel "${viewModel}"
const ${vmVar} = rive.viewModelByName("${viewModel}").defaultInstance();
`;
    if (properties.length > 0) {
      code += `
// Variables (${properties.length}):\n`;
      properties.forEach((prop) => {
        const t = getPropType(prop);
        const path = prop.name;
        const safeName = path.replace(/[^a-zA-Z0-9]/g, "_");
        if (t === "trigger") {
          code += `// ${vmVar}.trigger("${path}").fire()\n`;
        } else if (t === "number") {
          code += `let ${safeName} = ${vmVar}.number("${path}"); // ${safeName}.value = 0\n`;
        } else if (t === "string") {
          code += `let ${safeName} = ${vmVar}.string("${path}"); // ${safeName}.value = ""\n`;
        } else if (t === "boolean") {
          code += `let ${safeName} = ${vmVar}.boolean("${path}"); // ${safeName}.value = true\n`;
        } else if (t === "enum") {
          code += `let ${safeName} = ${vmVar}.enum("${path}"); // ${safeName}.value, ${safeName}.values\n`;
        } else if (t === "color") {
          code += `let ${safeName} = ${vmVar}.color("${path}"); // ${safeName}.value, setRgb(r,g,b)\n`;
        } else {
          code += `// ${vmVar}.?("${path}") - type: ${t}\n`;
        }
      });
    } else {
      code += `
// Methods: .number("path"), .string("path"), .boolean("path"), .trigger("path"), .enum("path"), .color("path")
`;
    }
  }

  return code;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function IntegrationsPanel({
  url,
  stateMachine,
  viewModel,
  viewModelProperties,
}: IntegrationsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>("react");

  const integrations = [
    {
      id: "react",
      name: "React / Next.js",
      code: generateReactIntegration(url, stateMachine, viewModel, viewModelProperties),
    },
    {
      id: "vanilla",
      name: "Vanilla JS",
      code: generateVanillaIntegration(url, stateMachine, viewModel, viewModelProperties),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Integrations
      </p>
      <div className="space-y-2">
        {integrations.map(({ id, name, code }) => (
          <div key={id} className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === id ? null : id)}
              className="w-full px-3 py-2 text-left text-sm font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-between"
            >
              {name}
              <span className="text-zinc-500">{expanded === id ? "▼" : "▶"}</span>
            </button>
            {expanded === id && (
              <div className="relative">
                <pre className="p-4 pt-10 text-xs overflow-x-auto max-h-64 overflow-y-auto bg-zinc-900 text-zinc-100 font-mono">
                  <code>{code}</code>
                </pre>
                <CopyButton text={code} />
              </div>
            )}
          </div>
        ))}
      </div>
      {viewModel && viewModelProperties.length > 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          ViewModel variables ({viewModelProperties.length}):{" "}
          {viewModelProperties.map((p) => p.name).join(", ")}
        </p>
      )}
    </div>
  );
}
