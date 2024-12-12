"use client";

import { useEffect, useState, useCallback } from "react";
import sdk from "@farcaster/frame-sdk";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useChainId,
  useWriteContract,
} from "wagmi";

import { fromHex } from "viem";
import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/utils";
import { prepareTX } from "~/lib/tx-prepper/tx-prepper";
import { TX } from "~/lib/tx-prepper/tx";
import { DAO_ID, DAO_CHAIN, DAO_SAFE, DAO_CHAIN_ID } from "~/lib/dao-constants";
import { useParams } from "next/navigation";
import { FORM_CONFIGS, FormConfig, FormValues } from "~/lib/form-configs";
import { SignalShares } from "./forms/SignalShares";
// @ts-expect-error find type
const getPropidFromReceipt = (receipt): number | null => {
  if (!receipt || !receipt.logs[0].topics[1]) return null;

  return fromHex(receipt.logs[0].topics[1], "number");
};

// get prop type from param
// get config for that
// // submit button text, form component, tx

export default function ProposalForm() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [propid, setPropid] = useState<number | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const validChain = chainId === DAO_CHAIN_ID;

  const params = useParams<{ proposalconfigid: string }>();

  console.log("params", params);
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

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  useEffect(() => {
    // todo: valdiate id
    if (params.proposalconfigid) {
      setFormConfig(FORM_CONFIGS[params.proposalconfigid]);
    }
  }, [params]);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
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
        ...formValues,
        recipient: address,
        sharesRequested: "1000000000000000000",
        title: "Proposal Title",
        description: "Proposal Description",
        link: "Proposal Link",
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

  console.log("formConfig", formConfig);

  if (!formConfig) return null;

  // better validation on fields
  const disableSubmit =
    !isConnected || isSendTxPending || !validChain || isConfirming || !!hash;

  return (
    <div className="w-full min-h-[695px]">
      <div className="w-[300px] mx-auto py-4 px-2bg">
        <div className="flex flex-col justify-between">
          <div>
            <SignalShares
              isConfirmed={isConfirmed}
              setFormValues={setFormValues}
            />
            {isConnected && !isConfirmed && (
              <>
                <div className="mb-4">
                  <Button
                    onClick={handleSend}
                    disabled={disableSubmit}
                    isLoading={isSendTxPending || isConfirming}
                  >
                    {formConfig.submitButtonText || "Submit"}
                  </Button>
                  {isSendTxError && renderError(sendTxError)}
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

          <div className="my-3">
            <Button
              onClick={() =>
                isConnected
                  ? disconnect()
                  : connect({ connector: config.connectors[0] })
              }
            >
              {isConnected && address
                ? `Disconnect ${truncateAddress(address)}`
                : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
