"use client";

import { useEffect, useState, useCallback } from "react";
import sdk from "@farcaster/frame-sdk";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useConnect,
  // useChainId,
  useWriteContract,
  useChainId,
  useSwitchChain,
} from "wagmi";

import { fromHex } from "viem";
import { Button } from "~/components/ui/button";
// import { truncateAddress } from "~/lib/utils";
import { prepareTX } from "~/lib/tx-prepper/tx-prepper";
import { getExplorerUrl, getWagmiChainObj } from "~/lib/dao-constants";
import { useParams } from "next/navigation";
import {
  FORM_CONFIGS,
  FormConfig,
  FormValues,
  validFormId,
} from "~/lib/form-configs";
import { ValidNetwork } from "~/lib/tx-prepper/prepper-types";
import { useFrameSDK } from "./providers/FramesSDKProvider";
import { config } from "./providers/ClientProviders";
import { FormSwitcher } from "./forms/FormSwitcher";
import { useDaoRecord } from "./providers/DaoRecordProvider";

// @ts-expect-error find type
const getPropidFromReceipt = (receipt): number | null => {
  if (!receipt || !receipt.logs[0].topics[1]) return null;

  return fromHex(receipt.logs[0].topics[1], "number");
};

export default function ProposalForm() {
  const { isLoaded } = useFrameSDK();

  const { daoid, daochain, daosafe, daochainid } = useDaoRecord();

  const [propid, setPropid] = useState<number | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [validFields, setValidFields] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const validChain = chainId === daochainid;

  const params = useParams<{ proposaltype: string }>();

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
    if (params.proposaltype && validFormId(params.proposaltype)) {
      setFormConfig(FORM_CONFIGS[params.proposaltype]);
    }
  }, [params]);

  useEffect(() => {
    if (!receiptData || !receiptData.logs[0].topics[1]) return;
    setPropid(getPropidFromReceipt(receiptData));
  }, [receiptData]);

  const openProposalCastUrl = useCallback(() => {
    sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=&embeds[]=https://frames.farcastle.net/molochv3/${daochain}/${daoid}/proposals/${propid}`
    );
  }, [propid, daoid, daochain]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl(`${getExplorerUrl(daochain)}/tx/${hash}`);
  }, [hash, daochain]);

  const handleSend = async () => {
    console.log("formValues", formValues);

    if (!formConfig) return;

    const wholeState = {
      formValues: {
        ...formValues,
        recipient: address,
      },
      chainId: daochain,
      safeId: daosafe,
      daoId: daoid,
      localABIs: {},
    };

    const txPrep = await prepareTX({
      tx: formConfig.tx,
      chainId: daochain as ValidNetwork,
      safeId: daosafe,
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

  if (!formConfig) return null;

  const disableSubmit =
    !isConnected ||
    isSendTxPending ||
    !validChain ||
    isConfirming ||
    !!hash ||
    !validFields;

  return (
    <div className="w-full min-h-[695px]">
      <div className="w-[300px] mx-auto py-4 px-2bg">
        <div className="flex flex-col justify-between">
          <div>
            <FormSwitcher
              formid={formConfig.id}
              isConfirmed={isConfirmed}
              formValues={formValues}
              validFields={validFields}
              setFormValues={setFormValues}
              setValidFields={setValidFields}
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

          {isConnected && !validChain && (
            <Button
              onClick={() =>
                switchChain({ chainId: getWagmiChainObj(daochain).id })
              }
            >
              Switch to Base
            </Button>
          )}

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
