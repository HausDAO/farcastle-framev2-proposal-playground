import { Metadata } from "next";
import Whisper from "./whisper";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/whispers/opengraph-image`,
  button: {
    title: "Whispers",
    action: {
      type: "launch_frame",
      name: "Farcastle Whispers",
      url: `${appUrl}/whispers`,
      splashImageUrl: `${appUrl}/fly.png`,
      splashBackgroundColor: "#17151F",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcastle Whispers",
    openGraph: {
      title: "Farcastle Whispers",
      description: "The Fly Listens",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function WhisperPage() {
  return <Whisper />;
}
