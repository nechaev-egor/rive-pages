import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const demoId = formData.get("demoId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const client = getSupabaseClient();
    const folder = demoId ?? "temp";
    const ext = file.name.split(".").pop() ?? "json";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const bytes = await file.arrayBuffer();

    const type = formData.get("type") as string | null;
    const isImage = type === "bg" || file.type.startsWith("image/");
    const contentType = isImage
      ? file.type || "image/jpeg"
      : "application/json";

    const { error: uploadError } = await client.storage
      .from("lottie-files")
      .upload(path, bytes, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload] Supabase storage error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message, details: uploadError },
        { status: 500 }
      );
    }

    const { data } = client.storage.from("lottie-files").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
