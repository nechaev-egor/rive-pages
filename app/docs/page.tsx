import Link from "next/link";
import { getDocList } from "@/lib/docs";

export const metadata = {
  title: "Documentation",
  description: "Rive Animation Tester documentation",
};

export default function DocsPage() {
  const docs = getDocList();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Documentation
          </h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
          Document list
        </h2>

        <ul className="space-y-2">
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/docs/${doc.slug}`}
                className="block px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {doc.title}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-2">
                  /docs/{doc.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {docs.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400">
            No documentation files found. Add .md files to content/docs/
          </p>
        )}
      </main>
    </div>
  );
}
