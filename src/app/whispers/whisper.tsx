"use client";

import dynamic from "next/dynamic";

const WhisperForm = dynamic(() => import("../../components/WhisperForm"), {
  ssr: false,
});

export default function Whisper() {
  return <WhisperForm />;
}
