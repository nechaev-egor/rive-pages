import { notFound } from "next/navigation";
import { getDemoBySlug } from "@/lib/lottie-demos";
import LottieScrollPlayerClient from "@/components/lottie/LottieScrollPlayerClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const demo = await getDemoBySlug(slug);
  return {
    title: demo ? demo.title : "Demo not found",
  };
}

export default async function PublicDemoPage({ params }: Props) {
  const { slug } = await params;
  const demo = await getDemoBySlug(slug);

  if (!demo) notFound();

  return (
    <div className="w-full bg-white dark:bg-zinc-950">
      <LottieScrollPlayerClient
        breakpoints={demo.breakpoints}
        scrollHeight={demo.scroll_height}
        backgroundColor={demo.background_color}
        backgroundImageUrl={demo.background_image_url}
      />
    </div>
  );
}
