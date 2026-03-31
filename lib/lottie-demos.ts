import { supabase } from "./supabase";

export interface BreakpointConfig {
  id: string;
  label: string;
  minWidth: number;
  maxWidth: number | null;
  lottieUrl: string;
  lottieFileName: string;
  position: { x: number; y: number };
  positionUnit: "px" | "%";
  size: { width: number; height: number };
  sizeUnit: "px" | "%";
}

export interface LottieDemo {
  id: string;
  slug: string;
  title: string;
  scroll_height: number;
  breakpoints: BreakpointConfig[];
  background_color: string | null;
  background_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type LottieDemoInsert = Omit<LottieDemo, "id" | "created_at" | "updated_at">;
export type LottieDemoUpdate = Partial<Omit<LottieDemo, "id" | "created_at" | "updated_at">>;

export async function getAllDemos(): Promise<LottieDemo[]> {
  const { data, error } = await supabase
    .from("lottie_demos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDemoById(id: string): Promise<LottieDemo | null> {
  const { data, error } = await supabase
    .from("lottie_demos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getDemoBySlug(slug: string): Promise<LottieDemo | null> {
  const { data, error } = await supabase
    .from("lottie_demos")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function createDemo(demo: LottieDemoInsert): Promise<LottieDemo> {
  const { data, error } = await supabase
    .from("lottie_demos")
    .insert(demo)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateDemo(id: string, updates: LottieDemoUpdate): Promise<LottieDemo> {
  const { data, error } = await supabase
    .from("lottie_demos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDemo(id: string): Promise<void> {
  const { error } = await supabase
    .from("lottie_demos")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function uploadLottieFile(
  file: File,
  demoId: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "json";
  const path = `${demoId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from("lottie-files")
    .upload(path, file, { contentType: file.type || "application/json" });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("lottie-files").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteLottieFile(url: string): Promise<void> {
  const bucket = "lottie-files";
  const prefix = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(prefix);
  if (idx === -1) return;
  const path = url.slice(idx + prefix.length);

  await supabase.storage.from(bucket).remove([path]);
}
