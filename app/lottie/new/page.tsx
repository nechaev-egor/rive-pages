import Link from "next/link";
import LottieEditorClient from "@/components/lottie/LottieEditorClient";

export default function NewDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div>
          <Link
            href="/lottie"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← All demos
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            New Lottie demo
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Configure the scroll animation and breakpoints, then save to get a shareable URL.
          </p>
        </div>

        <LottieEditorClient />
      </div>
    </div>
  );
}
