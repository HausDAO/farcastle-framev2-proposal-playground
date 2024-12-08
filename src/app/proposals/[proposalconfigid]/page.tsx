import { Metadata } from "next";
import ProposalForm from "~/components/ProposalForm";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Launch",
    action: {
      type: "launch_frame",
      name: "Farcastle DAO Proposal",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#17151F",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farcastle DAO Proposal",
    openGraph: {
      title: "Farcastle DAO Proposal",
      description: "DAO Proposal Form",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function ProposalFormPage() {
  return <ProposalForm />;
}
