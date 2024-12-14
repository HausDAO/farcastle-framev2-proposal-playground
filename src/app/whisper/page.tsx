import { Metadata } from "next";
import Whisper from "./whisper";

const appUrl = process.env.NEXT_PUBLIC_URL;

// TODO: can we change this url to open a deeplink?
const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch",
    action: {
      type: "launch_frame",
      name: "Farcastle Whispers",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
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
      description: "The Fly Hears",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function WhisperPage() {
  return <Whisper />;
}
