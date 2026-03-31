"use client";

import dynamic from "next/dynamic";
import { BreakpointConfig } from "@/lib/lottie-demos";

const LottieScrollPlayer = dynamic(() => import("./LottieScrollPlayer"), {
  ssr: false,
});

interface Props {
  breakpoints: BreakpointConfig[];
  scrollHeight: number;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
}

export default function LottieScrollPlayerClient({
  breakpoints,
  scrollHeight,
  backgroundColor,
  backgroundImageUrl,
}: Props) {
  return (
    <LottieScrollPlayer
      breakpoints={breakpoints}
      scrollHeight={scrollHeight}
      backgroundColor={backgroundColor}
      backgroundImageUrl={backgroundImageUrl}
    />
  );
}
