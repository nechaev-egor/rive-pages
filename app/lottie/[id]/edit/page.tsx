import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoById } from "@/lib/lottie-demos";
import LottieEditorClient from "@/components/lottie/LottieEditorClient";

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDemoPage({ params }: Props) {
  const { id } = await params;
  const demo = await getDemoById(id);

  if (!demo) notFound();

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
            Edit: {demo.title}
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Update the configuration and save to apply changes to the public demo.
          </p>
        </div>

        <LottieEditorClient initial={demo} />
      </div>
    </div>
  );
}
