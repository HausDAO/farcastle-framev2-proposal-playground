"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import Link from "next/link";
import { Button } from "./ui/Button";
import { useParams } from "next/navigation";

export default function ProposalList() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const params = useParams<{ chainid: string; daoid: string }>();

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready({});
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center my-4">Proposal Types</h1>

      <div className="mb-4">
        <Link href={`/dao/${params.chainid}/${params.daoid}/POST_SIGNAL`}>
          <Button>Propose Signal</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Button disabled={true}>Request Funding</Button>
      </div>

      <div className="mb-4">
        <Button disabled={true}>Request Membership</Button>
      </div>
    </div>
  );
}
