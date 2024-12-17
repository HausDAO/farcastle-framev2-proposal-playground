"use client";

import { useEffect, useState, ChangeEventHandler, useCallback } from "react";
import sdk from "@farcaster/frame-sdk";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useConnect,
  useChainId,
  useWriteContract,
  useSwitchChain,
} from "wagmi";

import { fromHex } from "viem";
import { Button } from "~/components/ui/button";
import { Textarea } from "./ui/textarea";
import { prepareTX } from "~/lib/tx-prepper/tx-prepper";
import { TX } from "~/lib/tx-prepper/tx";
import {
  DAO_ID,
  DAO_CHAIN,
  DAO_SAFE,
  DAO_CHAIN_ID,
  EXPLORER_URL,
  WAGMI_CHAIN_OBJ,
} from "~/lib/dao-constants";
import { ValidNetwork } from "~/lib/tx-prepper/prepper-types";
import { useFrameSDK } from "./providers/FramesSDKProvider";
import { config } from "./providers/ClientProviders";
// @ts-expect-error find type
const getPropidFromReceipt = (receipt): number | null => {
  if (!receipt || !receipt.logs[0].topics[1]) return null;

  return fromHex(receipt.logs[0].topics[1], "number");
};

export default function WhisperForm() {
  const { context, isLoaded } = useFrameSDK();

  const [secret, setSecret] = useState<string | null>(null);
  const [propid, setPropid] = useState<number | null>(null);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const validChain = chainId === DAO_CHAIN_ID;

  console.log("chainId", chainId);
  console.log("DAO_CHAIN_ID", DAO_CHAIN_ID);
  console.log("validChain", validChain);

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
    if (!receiptData || !receiptData.logs[0].topics[1]) return;
    console.log("receiptData", receiptData);
    setPropid(getPropidFromReceipt(receiptData));
  }, [receiptData]);

  const openProposalCastUrl = useCallback(() => {
    console.log("cast url propid", propid);
    sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=&embeds[]=https://frames.farcastle.net/molochv3/${DAO_CHAIN}/${DAO_ID}/proposals/${propid}`
    );
  }, [propid]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl(`${EXPLORER_URL}/tx/${hash}`);
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
      chainId: DAO_CHAIN as ValidNetwork,
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

  if (!isLoaded) {
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
        <div className="flex flex-col justify-between">
          <div>
            {!isConfirmed && (
              <div className="my-3">
                <Textarea
                  placeholder={`Tell me a secret ${
                    context?.user.displayName || "..."
                  }`}
                  className="h-96"
                  // @ts-expect-error change event type
                  onChange={handleTextInput}
                />
              </div>
            )}
            {isConfirmed && (
              <div className="text-darkPurple text-[80px] font-bold w-full text-center bg-raisinBlack py-2 h-96">
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
                    Whisper into the cracks of the castle wall
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

            {isConnected && !validChain && (
              <Button
                onClick={() => switchChain({ chainId: WAGMI_CHAIN_OBJ.id })}
              >
                Switch Chain
              </Button>
            )}
          </div>

          {propid && (
            <div className="my-2">
              <Button onClick={openProposalCastUrl}>Cast It</Button>
            </div>
          )}

          {hash && (
            <div className="my-2">
              <p
                className="w-full text-center font-bold text-raisinBlack hover:text-rasedaGreen hover:cursor-pointer"
                onClick={openUrl}
              >
                View on block explorer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
