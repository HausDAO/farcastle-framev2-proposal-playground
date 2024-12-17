"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { DAO_CONFIG, HOLLOW_SERVANTS_DAO_ID } from "~/lib/dao-constants";
import { useFrameSDK } from "./providers/FramesSDKProvider";

const { DAO_ID, DAO_CHAIN } = DAO_CONFIG[HOLLOW_SERVANTS_DAO_ID];

export default function Home() {
  const { isLoaded } = useFrameSDK();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <div className="mb-4">
        <Link href={`/dao/${DAO_CHAIN}/${DAO_ID}`}>
          <Button>Enter the Quarters of the Hollow Servants</Button>
        </Link>
      </div>
    </div>
  );
}
