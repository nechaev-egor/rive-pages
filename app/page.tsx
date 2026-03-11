import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <main className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Rive Animation Tester
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Test and showcase Rive animations in the browser. Load by URL or choose from
          ready-made examples.
        </p>
        <Link
          href="/test"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 px-8 py-4 text-lg font-medium text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
        >
          Open tester →
        </Link>
        <div className="pt-8 text-sm text-zinc-500 dark:text-zinc-400">
          <p>Supports .riv files from CDN or local upload.</p>
          <p className="mt-1">
            <a
              href="https://rive.app/community/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Rive Community
            </a>{" "}
            — animation examples
          </p>
        </div>
      </main>
    </div>
  );
}
