import { Metadata } from "next";
import ProposalList from "~/components/ProposalList";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch",
    action: {
      type: "launch_frame",
      name: "Farcastle DAO Proposals",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#17151F",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcastle DAO Proposals",
    openGraph: {
      title: "Farcastle DAO Proposals",
      description: "DAO Proposals",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function ProposalListPage() {
  return <ProposalList />;
}
