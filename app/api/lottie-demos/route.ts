import { NextResponse } from "next/server";
import { getAllDemos, createDemo, generateSlug } from "@/lib/lottie-demos";

export async function GET() {
  try {
    const demos = await getAllDemos(true);
    return NextResponse.json(demos);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      scroll_height,
      breakpoints,
      background_color,
      background_image_url,
      is_private,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const slug = generateSlug(title);
    const demo = await createDemo({
      title,
      slug,
      scroll_height: scroll_height ?? 3000,
      breakpoints: breakpoints ?? [],
      background_color: background_color ?? null,
      background_image_url: background_image_url ?? null,
      is_private: Boolean(is_private),
    });

    return NextResponse.json(demo, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
