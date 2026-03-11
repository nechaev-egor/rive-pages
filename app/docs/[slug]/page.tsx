import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc, getDocList } from "@/lib/docs";
import MarkdownContent from "@/components/MarkdownContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = (await import("@/lib/docs")).getDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: "Not Found" };
  return { title: `${doc.title} | Documentation` };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDoc(slug);
  const docList = getDocList();

  if (!doc) notFound();

  const currentIndex = docList.findIndex((d) => d.slug === slug);
  const prevDoc = currentIndex > 0 ? docList[currentIndex - 1] : null;
  const nextDoc = currentIndex >= 0 && currentIndex < docList.length - 1 ? docList[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/docs"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Documentation
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[60%]">
            {doc.title}
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="mb-12">
          <MarkdownContent content={doc.content} />
        </article>

        <nav className="flex flex-wrap gap-4 justify-between pt-8 border-t border-zinc-200 dark:border-zinc-800">
          {prevDoc ? (
            <Link
              href={`/docs/${prevDoc.slug}`}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ← {prevDoc.title}
            </Link>
          ) : (
            <span />
          )}
          {nextDoc ? (
            <Link
              href={`/docs/${nextDoc.slug}`}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {nextDoc.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </div>
  );
}
