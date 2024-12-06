import { Metadata } from "next";
// import App from "./app";

import Whispers from "../../components/Whisper";

const appUrl = process.env.NEXT_PUBLIC_URL;

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

export default function Whisper() {
  return <Whispers />;
}
