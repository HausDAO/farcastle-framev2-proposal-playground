"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useParams } from "next/navigation";
import { useFrameSDK } from "./providers/FramesSDKProvider";

export default function ProposalList() {
  const { isLoaded } = useFrameSDK();

  const params = useParams<{ chainid: string; daoid: string }>();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <div className="mb-4">
        <Link href={`/dao/${params.chainid}/${params.daoid}/POST_SIGNAL`}>
          <Button>Propose Signal</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Link
          href={`/dao/${params.chainid}/${params.daoid}/REQUEST_MEMBERSHIP`}
        >
          <Button>Request Fundings</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Button disabled={true}>Request Membership</Button>
      </div>
    </div>
  );
}
