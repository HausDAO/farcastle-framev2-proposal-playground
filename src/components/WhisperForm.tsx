"use client";

import { useEffect, useState, ChangeEventHandler, useCallback } from "react";
import sdk, { FrameContext } from "@farcaster/frame-sdk";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useConnect,
  useChainId,
  useWriteContract,
} from "wagmi";

import { fromHex } from "viem";
import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { Textarea } from "./ui/textarea";
import { prepareTX } from "~/lib/tx-prepper/tx-prepper";
import { TX } from "~/lib/tx-prepper/tx";
import { DAO_ID, DAO_CHAIN, DAO_SAFE, DAO_CHAIN_ID } from "~/lib/dao-constants";
// @ts-expect-error find type
const getPropidFromReceipt = (receipt): number | null => {
  if (!receipt || !receipt.logs[0].topics[1]) return null;

  return fromHex(receipt.logs[0].topics[1], "number");
};

export default function WhisperForm(
  { title }: { title?: string } = { title: "Frames v2 Demo" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [propid, setPropid] = useState<number | null>(null);
  const [context, setContext] = useState<FrameContext>();

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const validChain = chainId === DAO_CHAIN_ID;

  const handleTextInput = (event: ChangeEventHandler<HTMLTextAreaElement>) => {
    // @ts-expect-error change event type
    setSecret(event.target.value);
  };

  const {
    writeContract,
    data: hash,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useWriteContract();

  const {
    data: receiptData,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: hash,
  });

  const { connect } = useConnect();

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready({});
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    if (!receiptData || !receiptData.logs[0].topics[1]) return;
    setPropid(getPropidFromReceipt(receiptData));
  }, [receiptData]);

  const openProposalCastUrl = useCallback(() => {
    sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=&embeds[]=https://frames.farcastle.net/molochv3/${DAO_CHAIN}/${DAO_ID}/proposals/${propid}`
    );
  }, [propid]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
  }, [hash]);

  const handleSend = async () => {
    const wholeState = {
      formValues: {
        title: "The Fly Hears...",
        description: secret,
        link: "",
        recipient: address,
        sharesRequested: "1000000000000000000",
      },
      chainId: DAO_CHAIN,
      safeId: DAO_SAFE,
      daoId: DAO_ID,
      localABIs: {},
    };

    const txPrep = await prepareTX({
      tx: TX.SIGNAL_SHARES,
      chainId: DAO_CHAIN,
      safeId: DAO_SAFE,
      appState: wholeState,
      argCallbackRecord: {},
      localABIs: {},
    });

    console.log("txPrep", txPrep);
    if (!txPrep) return;

    writeContract({
      abi: txPrep.abi,
      address: txPrep.address,
      functionName: txPrep.functionName,
      args: txPrep.args,
    });
  };

  const renderError = (error: Error | null) => {
    if (!error) return null;
    return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  const hasSecret = secret && secret.length > 5;
  const disableSubmit =
    !isConnected ||
    isSendTxPending ||
    !validChain ||
    !hasSecret ||
    isConfirming ||
    !!hash;

  return (
    <div className="w-full fly-bg min-h-[695px]">
      <div className="w-[300px] mx-auto py-4 px-2bg">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
        <div className="flex flex-col justify-between">
          <div>
            {!isConfirmed && (
              <div className="my-3">
                <Textarea
                  placeholder={`Whisper your secrets to me ${
                    context?.user.displayName || "..."
                  }`}
                  className="h-96"
                  // @ts-expect-error change event type
                  onChange={handleTextInput}
                />
              </div>
            )}
            {isConfirmed && (
              <div className="text-darkPurple text-[100px] font-bold w-full text-center bg-raisinBlack py-2 h-96">
                <p className="pt-9">I hear you</p>
              </div>
            )}
            {isConnected && !isConfirmed && (
              <>
                <div className="mb-4">
                  <Button
                    onClick={handleSend}
                    disabled={disableSubmit}
                    isLoading={isSendTxPending || isConfirming}
                  >
                    Send it into the cracks of the castle wall
                  </Button>
                  {isSendTxError && renderError(sendTxError)}
                </div>
              </>
            )}

            {!isConnected && (
              <>
                <div className="mb-4">
                  <Button
                    onClick={() => connect({ connector: config.connectors[0] })}
                  >
                    Connect
                  </Button>
                </div>
              </>
            )}
          </div>

          {propid && (
            <div className="my-2">
              <Button onClick={openProposalCastUrl}>Cast</Button>
            </div>
          )}

          {hash && (
            <div className="my-2">
              <Button onClick={openUrl}>Block Explorer</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
