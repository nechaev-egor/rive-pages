import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

export interface DocMeta {
  slug: string;
  title: string;
  order?: number;
}

export interface Doc {
  slug: string;
  title: string;
  content: string;
  order?: number;
}

export function getDocSlugs(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getDocList(): DocMeta[] {
  const slugs = getDocSlugs();
  const list: DocMeta[] = slugs.map((slug) => {
    const filePath = path.join(DOCS_DIR, `${slug}.md`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? slug.replace(/-/g, " "),
      order: data.order as number | undefined,
    };
  });
  list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  return list;
}

export function getDoc(slug: string): Doc | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) ?? slug.replace(/-/g, " "),
    content,
    order: data.order as number | undefined,
  };
}
