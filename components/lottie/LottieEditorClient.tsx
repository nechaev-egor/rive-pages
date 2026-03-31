"use client";

import dynamic from "next/dynamic";
import { LottieDemo } from "@/lib/lottie-demos";

const LottieEditor = dynamic(() => import("./LottieEditor"), { ssr: false });

interface Props {
  initial?: LottieDemo;
}

export default function LottieEditorClient({ initial }: Props) {
  return <LottieEditor initial={initial} />;
}
