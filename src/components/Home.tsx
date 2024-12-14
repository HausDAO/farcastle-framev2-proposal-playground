"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import Link from "next/link";
import { Button } from "./ui/Button";
import { DAO_CHAIN, DAO_ID } from "~/lib/dao-constants";

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

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
        <Link href={`/dao/${DAO_CHAIN}/${DAO_ID}`}>
          <Button>find a dao</Button>
        </Link>
      </div>
    </div>
  );
}
