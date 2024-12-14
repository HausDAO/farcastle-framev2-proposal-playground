import { Metadata } from "next";
import Proposal from "./proposal";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch",
    action: {
      type: "launch_frame",
      name: "Farcastle Proposal",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#17151F",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcastle Proposal",
    openGraph: {
      title: "Farcastle Proposal",
      description: "Farcastle Proposal",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function ProposalPage() {
  return <Proposal />;
}
