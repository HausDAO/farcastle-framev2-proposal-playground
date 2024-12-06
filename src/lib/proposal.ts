import { encodeMulti, MetaTransaction } from "ethers-multisend";

import { LOCAL_ABI } from "./abi/abis";
import {
  ABI,
  ArbitraryState,
  ArgCallback,
  ArgEncode,
  ArgType,
  ContractLego,
  EncodeCallArg,
  EncodeMulticall,
  EstimateGas,
  EthAddress,
  JSONDetailsSearch,
  Keychain,
  MulticallAction,
  MulticallArg,
  ProcessedContract,
  StaticContract,
  StringSearch,
  TXLego,
  ValidArgType,
  ValidNetwork,
} from "./legoTypes";
import { isArgType, isEthAddress } from "./typeguards";
import {
  Chain,
  createPublicClient,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  parseAbiParameters,
} from "viem";
import { CONTRACT_KEYCHAINS } from "./contractKeychains";
import {
  arbitrum,
  base,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "viem/chains";
import { ethers } from "ethers";

export const BaalContractBase = {
  type: "local",
  contractName: "Baal",
  abi: LOCAL_ABI.BAAL,
};
export const EXPIRY = ".proposalExpiry";
export const FORM = ".formValues";
export const CURRENT_DAO = ".daoId";
export const gasBufferMultiplier = 1.2; // buffers baalgas estimate
export const basicDetails: JSONDetailsSearch = {
  type: "JSONDetails",
  jsonSchema: {
    title: ".formValues.title",
    description: ".formValues.description",
    proposalType: { type: "static", value: "Multicall Proposal" },
  },
};
export const POSTER_TAGS = {
  summoner: "daohaus.summoner.daoProfile",
  daoProfileUpdate: "daohaus.shares.daoProfile",
  signalProposal: "daohaus.proposal.signalProposal",
  daoDatabaseProposal: "daohaus.proposal.database",
  daoDatabaseShares: "daohaus.shares.database",
  daoDatabaseSharesOrLoot: "daohaus.member.database",
};
export const ACTION_GAS_LIMIT_ADDITION = 150000;

export async function prepareTX(args: {
  tx: TXLego;
  chainId: ValidNetwork;
  safeId?: string;
  //   setTransactions: ReactSetter<TxRecord>;
  appState: ArbitraryState;
  //   lifeCycleFns: TXLifeCycleFns;
  localABIs: Record<string, ABI>;
  argCallbackRecord: Record<string, ArgCallback>;
  //   rpcs: Keychain;
  //   graphApiKeys: Keychain;
  //   pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
  //   publicClient?: PublicClient;
}) {
  const {
    argCallbackRecord,
    tx,
    chainId,
    safeId,
    localABIs,
    // lifeCycleFns,
    appState,
    // rpcs,
    // explorerKeys,
    // pinataApiKeys,
    // graphApiKeys,
    // publicClient,
  } = args;
  console.log("**APPLICATION STATE**", appState);
  try {
    const processedContract = await processContractLego({
      localABIs,
      contract: tx.contract,
      chainId,
      appState,
    });
    console.log("**PROCESSED CONTRACT**", processedContract);

    const { abi, address } = processedContract;
    const { method } = tx;

    const processedArgs = await processArgs({
      tx: { ...tx, contract: processedContract },
      localABIs,
      chainId,
      safeId,
      appState,
      argCallbackRecord,
      //   rpcs,
      //   pinataApiKeys,
      //   explorerKeys,
    });

    console.log("**PROCESSED ARGS**", processedArgs);

    // const overrides = await processOverrides({
    //   tx,
    //   localABIs,
    //   chainId,
    //   safeId,
    //   appState,
    //   //   rpcs,
    //   //   pinataApiKeys,
    //   //   explorerKeys,
    // });

    // console.log("**PROCESSED overrides**", overrides);

    // const { request } = await publicClient.simulateContract({
    //   account,
    //   address: address as `0x${string}`,
    //   abi,
    //   args: processedArgs,
    //   functionName: method,
    //   value: overrides.value,
    //   gas: overrides.gasLimit,
    //   maxFeePerGas: overrides.gasPrice,
    //   blockTag: overrides.blockTag,
    // });

    // lifeCycleFns?.onRequestSign?.();

    // const txHash = await walletClient.writeContract(request);

    // console.log("txHash", txHash);

    // executeTx({ ...args, publicClient, txHash, graphApiKeys });

    return {
      address: address as `0x${string}`,
      functionName: method,
      args: processedArgs,
      abi,
    };
  } catch (error) {
    console.error(error);
    // lifeCycleFns?.onTxError?.(error);
  }
}

export const processArgs = async ({
  tx,
  chainId,
  safeId,
  localABIs,
  appState,
  argCallbackRecord,
}: //   rpcs,
//   pinataApiKeys,
//   explorerKeys,
{
  tx: TXLego;
  chainId: ValidNetwork;
  safeId?: string;
  localABIs: Record<string, ABI>;
  appState: ArbitraryState;
  argCallbackRecord: Record<string, ArgCallback>;
  //   rpcs: Keychain;
  // pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
}) => {
  const { argCallback, args, staticArgs } = tx;

  if (staticArgs) {
    return staticArgs;
  }
  if (argCallback) {
    return handleArgCallback({
      tx,
      chainId,
      safeId,
      localABIs,
      appState,
      argCallbackRecord,
    });
  }

  if (args) {
    return await Promise.all(
      args?.map(
        async (arg) =>
          await processArg({
            arg,
            chainId,
            safeId,
            localABIs,
            appState,
            // rpcs,
            // pinataApiKeys,
            // explorerKeys,
          })
      )
    );
  }
  throw new Error(
    "TX Lego must have a valid arg type, use either a string alias for an argument callback or an array of valid arguments"
  );
};

export const processArg = async ({
  arg,
  chainId,
  safeId,
  localABIs,
  appState,
}: //   rpcs,
//   pinataApiKeys,
//   explorerKeys,
{
  arg: ValidArgType;
  chainId: ValidNetwork;
  safeId?: string;
  localABIs: Record<string, ABI>;
  appState: ArbitraryState;
  //   rpcs: Keychain;
  //   pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
}): Promise<ArgType> => {
  if (isSearchArg(arg)) {
    return searchArg({ appState, searchString: arg, shouldThrow: true });
  }
  if (arg?.type === "static") {
    return arg.value;
  }
  if (arg?.type === "template") {
    // appState variables should be enclosed in curly braces e.g. `Send {.formValues.value} ETH`
    const fragments = arg.value.split(/{|}/g);
    return fragments
      .map((f: string) =>
        f[0] === "."
          ? searchArg({
              appState,
              searchString: f as StringSearch,
              shouldThrow: true,
            })
          : f
      )
      .join("");
  }
  if (arg?.type === "singleton") {
    return handleKeychainArg({ chainId, keychain: arg.keychain });
  }
  if (arg?.type === "nestedArray") {
    return Promise.all(
      arg.args.map(
        async (arg) =>
          await processArg({
            arg,
            chainId,
            safeId,
            localABIs,
            appState,
          })
      )
    );
  }
  if (arg?.type === "multicall" || arg.type === "encodeMulticall") {
    const actions = await handleMulticallArg({
      arg,
      chainId,
      localABIs,
      appState,
      //   rpcs,
      //   pinataApiKeys,
      //   explorerKeys,
    });
    const result = await handleEncodeMulticallArg({
      arg,
      actions,
    });

    return result;
  }
  if (arg?.type === "encodeCall") {
    const result = await handleEncodeCallArg({
      arg,
      chainId,
      localABIs,
      appState,
      //   rpcs,
      //   pinataApiKeys,
      //   explorerKeys,
    });
    return result;
  }
  if (arg?.type === "argEncode") {
    const result = await handleArgEncode({
      arg,
      chainId,
      //   safeId,
      localABIs,
      appState,
      //   rpcs,
      //   pinataApiKeys,
      //   explorerKeys,
    });
    return result;
  }
  //   if (arg?.type === "ipfsPinata") {
  //     const result = await handleIPFSPinata({
  //       arg,
  //       chainId,
  //       safeId,
  //       localABIs,
  //       appState,
  //       rpcs,
  //       pinataApiKeys,
  //       explorerKeys,
  //     });
  //     return result;
  //   }
  if (arg?.type === "estimateGas") {
    console.log("********ESTIMATE");
    const result = await handleGasEstimate({
      arg,
      chainId,
      safeId,
      localABIs,
      appState,
      //   rpcs,
      //   pinataApiKeys,
      //   explorerKeys,
    });
    return result;
  }
  if (arg?.type === "proposalExpiry") {
    // if (arg.search) {
    //   const result = searchArg({
    //     appState,
    //     searchString: arg.search,
    //     shouldThrow: false,
    //   });

    //   return typeof result === "number"
    //     ? calcExpiry(result)
    //     : calcExpiry(arg.fallback);
    // }
    // return calcExpiry(arg.fallback);
    return "0";
  }
  if (arg?.type === "JSONDetails") {
    const result = await handleDetailsJSON({
      arg,
      chainId,
      safeId,
      localABIs,
      appState,
      //   rpcs,
      //   pinataApiKeys,
      //   explorerKeys,
    });
    return result;
  }
  console.log("**DEBUG**");
  console.log("arg", arg);
  throw new Error(`ArgType not found.`);
};

export const handleDetailsJSON = async ({
  arg,
  appState,
  localABIs,
  chainId,
  safeId,
}: //   rpcs,
//   pinataApiKeys,
//   explorerKeys,
{
  arg: JSONDetailsSearch;
  appState: ArbitraryState;
  localABIs: Record<string, ABI>;
  chainId: ValidNetwork;
  safeId?: string;
  //   rpcs: Keychain;
  //   pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
}) => {
  const detailsList = await Promise.all(
    Object.entries(arg.jsonSchema).map(async ([key, arg]) => {
      return {
        id: key,
        value: await processArg({
          arg,
          chainId,
          safeId,
          localABIs,
          appState,
          //   rpcs,
          //   pinataApiKeys,
          //   explorerKeys,
        }),
      };
    })
  );
  if (!detailsList) {
    console.log("arg", arg);
    throw new Error(`Error Compiling JSON Details`);
  }

  return JSON.stringify(
    detailsList.reduce((acc, arg) => {
      return { ...acc, [arg.id]: arg.value };
    }, {})
  );
};

export const handleGasEstimate = async ({
  safeId,
  chainId,
  localABIs = {},
  appState,
  arg,
}: //   rpcs,
//   pinataApiKeys,
//   explorerKeys,
{
  safeId?: string;
  chainId: ValidNetwork;
  arg: EstimateGas;
  appState: ArbitraryState;
  localABIs?: Record<string, ABI>;
  //   rpcs: Keychain;
  //   pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
}) => {
  if (!safeId) throw new Error("Safe ID is required to estimate gas");

  const actions = await handleMulticallArg({
    localABIs,
    chainId,
    appState,
    arg: {
      type: "multicall",
      actions: arg.actions,
      formActions: arg.formActions,
    },
    // rpcs,
    // pinataApiKeys,
    // explorerKeys,
  });

  const { daoId } = appState;
  // wrap on a multiSend action for simulation
  const metaTx = {
    to: CONTRACT_KEYCHAINS.GNOSIS_MULTISEND[chainId],
    data: encodeMultiAction(actions),
    value: "0",
    operation: 1,
  } as MetaTransaction;
  const gasEstimate = await gasEstimateFromActions({
    actions: encodeExecFromModule({ safeId, metaTx }),
    actionsCount: actions.length,
    chainId,
    daoId,
    safeId,
  });

  if (gasEstimate) {
    // adds buffer to baalgas estimate
    const buffer = arg.bufferPercentage || gasBufferMultiplier;
    return Math.round(Number(gasEstimate) * Number(buffer));
  } else {
    // This happens when the safe vault takes longer to be indexed by the Gnosis API
    // and it returns a 404 HTTP error
    console.error(`Failed to estimate gas`);
    return 0;
  }
};

export const encodeExecFromModule = ({
  safeId,
  metaTx, // usually a multiSend encoded action. See `encodeMultiAction`
}: {
  safeId: string;
  metaTx: MetaTransaction;
}) => {
  return [
    {
      to: safeId,
      data: encodeFunction(
        LOCAL_ABI.GNOSIS_MODULE,
        "execTransactionFromModule",
        [metaTx.to, metaTx.value, metaTx.data, metaTx.operation]
      ),
      value: "0",
      operation: 0,
    } as MetaTransaction,
  ];
};

export const gasEstimateFromActions = async ({
  actions,
  actionsCount,
  chainId,
  daoId,
}: {
  actions: MetaTransaction[];
  actionsCount: number;
  chainId: ValidNetwork;
  daoId: string;
  safeId: string; // not used at the moment
}) => {
  const esitmatedGases = await Promise.all(
    actions.map(
      async (action) =>
        await estimateFunctionalGas({
          chainId: chainId,
          contractAddress: action.to,
          from: daoId, // from value needs to be the safe module (baal) to estimate without revert
          value: BigInt(Number(action.value)),
          data: action.data,
        })
    )
  );

  // get sum of all gas estimates
  const totalGasEstimate = esitmatedGases?.reduce(
    (a, b) => (a || 0) + (b || 0),
    0
  );

  // extra gas overhead when calling the dao from the baal safe
  const baalOnlyGas = actionsCount * ACTION_GAS_LIMIT_ADDITION;
  console.log("baalOnlyGas addtition", baalOnlyGas);
  console.log("totalGasEstimate", totalGasEstimate);

  return (totalGasEstimate || 0) + baalOnlyGas;
};

export const estimateFunctionalGas = async ({
  chainId,
  contractAddress,
  from,
  value,
  data,
}: //   rpcs = HAUS_RPC,
{
  chainId: ValidNetwork;
  contractAddress: string;
  from: string;
  value: bigint;
  data: string;
  //   rpcs?: Keychain;
}): Promise<number | undefined> => {
  const client = createPublicClient({
    chain: VIEM_CHAINS[chainId],
    transport: http(),
  });

  const functionGasFees = await client.estimateGas({
    account: from as EthAddress,
    to: contractAddress as EthAddress,
    value,
    data: data as `0x${string}`,
  });

  console.log("functionGasFees", functionGasFees);

  return Number(functionGasFees);
};

export const VIEM_CHAINS: Keychain<Chain> = {
  "0x1": mainnet,
  "0x64": gnosis,
  "0x89": polygon,
  "0xa": optimism,
  "0xa4b1": arbitrum,
  "0xaa36a7": sepolia,
  "0x2105": base,
};

export const handleArgEncode = async ({
  arg,
  chainId,
  //   safeId,
  localABIs,
  appState,
}: //   rpcs,
//   pinataApiKeys,
//   explorerKeys,
{
  arg: ArgEncode;
  chainId: ValidNetwork;
  //   safeId?: string;
  localABIs: Record<string, ABI>;
  appState: ArbitraryState;
  //   rpcs: Keychain;
  //   pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
}) => {
  const { args, solidityTypes } = arg;
  if (args.length !== solidityTypes.length) {
    throw new Error(`Arguments and types must be the same length`);
  }

  const processedArgs = await Promise.all(
    args.map(
      async (arg) =>
        await processArg({
          arg,
          chainId,
          localABIs,
          appState,
          //   rpcs,
          //   pinataApiKeys,
          //   explorerKeys,
        })
    )
  );
  console.log("processedArgs", processedArgs);

  return encodeValues(solidityTypes, processedArgs);
};

export const encodeValues = (
  typesArray: string[],
  valueArray: ArgType[]
): string => {
  return encodeAbiParameters(
    parseAbiParameters(typesArray.join(",")),
    valueArray
  );
};

export const handleEncodeCallArg = async ({
  arg,
  chainId,
  localABIs,
  appState,
}: //   rpcs,
//   pinataApiKeys,
//   explorerKeys,
{
  arg: EncodeCallArg;
  chainId: ValidNetwork;
  localABIs: Record<string, ABI>;
  appState: ArbitraryState;
  //   rpcs: Keychain;
  //   pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
}) => {
  const { contract, method, args } = arg.action;
  const processedContract = await processContractLego({
    contract,
    chainId,
    localABIs,
    appState,
    // rpcs,
    // explorerKeys,
  });

  const processedArgs = await Promise.all(
    args.map(
      async (arg) =>
        await processArg({
          arg,
          chainId,
          localABIs,
          appState,
          //   rpcs,
          //   pinataApiKeys,
          //   explorerKeys,
        })
    )
  );

  const encodedData = encodeFunction(
    processedContract.abi,
    method,
    processedArgs
  );

  if (typeof encodedData !== "string") {
    throw new Error(encodedData.message);
  }

  return encodedData;
};

export const handleEncodeMulticallArg = async ({
  arg,
  actions,
}: {
  arg: MulticallArg | EncodeMulticall;
  actions: MetaTransaction[];
}) => {
  if (arg.type === "encodeMulticall") {
    const result = encodeMulti(actions);
    console.log("arg.type", arg.type);
    console.log("result", result);

    if (typeof result !== "string") {
      throw new Error("Could not encode generic multicall");
    }
    return result;
  }

  const result = encodeMultiAction(actions);

  if (typeof result !== "string") {
    throw new Error(result.message);
  }
  return result;
};

const encodeMetaTransaction = (tx: MetaTransaction): string => {
  const data = ethers.getBytes(tx.data);
  const encoded = ethers.solidityPacked(
    ["uint8", "address", "uint256", "uint256", "bytes"],
    [tx.operation, tx.to, tx.value, data.length, data]
  );
  return encoded.slice(2);
};

export const encodeMultiSend = (txs: MetaTransaction[]): string => {
  return "0x" + txs.map((tx) => encodeMetaTransaction(tx)).join("");
};

export const encodeMultiAction = (rawMulti: MetaTransaction[]) => {
  console.log("*** rawMulti", rawMulti);
  console.log("*** encodeMulti", encodeMulti(rawMulti));

  return encodeFunction(LOCAL_ABI.GNOSIS_MULTISEND, "multiSend", [
    // encodeMulti(rawMulti) => retuing the whole meta obj, not string
    encodeMultiSend(rawMulti),
  ]);
};

export const encodeFunction = (
  abi: ABI,
  fnName: string,
  functionArgs: ReadonlyArray<unknown>
): string | { error: true; message: string } => {
  try {
    if (!abi || !Array.isArray(functionArgs))
      throw new Error(
        "Incorrect params passed to safeEncodeHexFunction in abi.js"
      );

    console.log("*** abi", abi);
    console.log("*** functionArgs", functionArgs);
    console.log("*** fnName", fnName);

    return encodeFunctionData({
      abi,
      functionName: fnName,
      args: functionArgs,
    });
  } catch (error) {
    console.error("error", error);
    return {
      error: true,
      message: "Could not encode transaction data with the values provided",
    };
  }
};

export const handleMulticallArg = async ({
  arg,
  chainId,
  localABIs,
  appState,
}: //   rpcs,
//   pinataApiKeys,
//   explorerKeys,
{
  arg: MulticallArg | EncodeMulticall;
  chainId: ValidNetwork;
  localABIs: Record<string, ABI>;
  appState: ArbitraryState;
  //   rpcs: Keychain;
  //   pinataApiKeys: PinataApiKeys;
  //   explorerKeys: Keychain;
}) => {
  const encodedActions = await Promise.all(
    arg.actions.map(async (action) => {
      const { contract, method, args, value, operations, data } = action;
      const processedContract = await processContractLego({
        contract,
        chainId,
        localABIs,
        appState,
        // rpcs,
        // explorerKeys,
      });

      const processValue = value
        ? await processArg({
            arg: value,
            chainId,
            localABIs,
            appState,
            // rpcs,
            // pinataApiKeys,
            // explorerKeys,
          })
        : 0;

      const processedOperations = operations
        ? await processArg({
            arg: operations,
            chainId,
            localABIs,
            appState,
            // rpcs,
            // pinataApiKeys,
            // explorerKeys,
          })
        : 0;

      // Early return if encoded data is passed and args do not need processing
      if (data) {
        return {
          to: processedContract.address,
          data: (await processArg({
            arg: data,
            chainId,
            localABIs,
            appState,
            // rpcs,
            // pinataApiKeys,
            // explorerKeys,
          })) as string,
          value: processValue.toString(),
          operation: Number(processedOperations),
        };
      }

      const processedArgs = await Promise.all(
        args.map(
          async (arg) =>
            await processArg({
              arg,
              chainId,
              localABIs,
              appState,
              //   rpcs,
              //   pinataApiKeys,
              //   explorerKeys,
            })
        )
      );

      return txActionToMetaTx({
        abi: processedContract.abi,
        method,
        address: processedContract.address,
        args: processedArgs,
        value: Number(processValue),
        operation: Number(processedOperations),
      });
    })
  );
  const encodedFormActions = arg.formActions
    ? handleMulticallFormActions({ appState })
    : [];

  return [...encodedActions, ...encodedFormActions];
};

const handleMulticallFormActions = ({
  appState,
}: {
  appState: ArbitraryState;
}): MetaTransaction[] => {
  const validTxs = appState.formValues.tx
    ? Object.keys(appState.formValues.tx).filter((actionId: string) => {
        const action = appState.formValues.tx[actionId];
        return !action.deleted;
      })
    : [];
  if (!validTxs.length) {
    throw new Error("No actions found");
  }
  const sortedTxs = validTxs.sort((actionA: string, actionB: string) =>
    Number(appState.formValues.tx[actionA].index) >
    Number(appState.formValues.tx[actionB].index)
      ? 1
      : -1
  );
  return sortedTxs.map((actionId: string) => {
    const action = appState.formValues.tx[actionId];
    const { to, data, value, operation } = action;
    return {
      to,
      data,
      value,
      operation,
    };
  });
};

export const txActionToMetaTx = ({
  abi,
  method,
  address,
  args,
  value = 0,
  operation = 0,
}: {
  abi: ABI;
  address: string;
  method: string;
  args: ReadonlyArray<ArgType>;
  value?: number;
  operation?: number;
}): MetaTransaction => {
  const encodedData = encodeFunction(abi, method, args);

  if (typeof encodedData !== "string") {
    throw new Error(encodedData.message);
  }

  console.log("operation", operation);
  return {
    to: address,
    data: encodedData,
    value: value.toString(),
    operation,
  };
};

const handleKeychainArg = ({
  chainId,
  keychain,
}: {
  chainId: ValidNetwork;
  keychain: Keychain;
}) => {
  if (!keychain[chainId]) {
    throw new Error(`Could not find keychain for chainId: ${chainId}`);
  }
  return keychain[chainId] as string;
};

const handleArgCallback = async ({
  tx,
  chainId,
  safeId,
  localABIs,
  appState,
  argCallbackRecord,
}: {
  tx: TXLego;
  chainId: ValidNetwork;
  safeId?: string;
  localABIs: Record<string, ABI>;
  appState: ArbitraryState;
  argCallbackRecord: Record<string, ArgCallback>;
}) => {
  const callbackKey = tx.argCallback;

  if (callbackKey && argCallbackRecord[callbackKey]) {
    const callback = argCallbackRecord[callbackKey];
    const result = await callback({ tx, chainId, safeId, localABIs, appState });
    return result;
  }
  throw new Error(`Could not find argCallback: ${callbackKey}`);
};

export const processContractLego = async ({
  contract,
  chainId,
  //   localABIs,
  appState,
}: {
  contract: ContractLego;
  chainId: ValidNetwork;
  localABIs: Record<string, ABI>;
  appState: ArbitraryState;
  //   rpcs: Keychain;
  //   explorerKeys: Keychain;
}) => {
  if (contract.type === "static") {
    return processStaticContract({
      localContract: contract as StaticContract,
      chainId,
      appState,
    });
  }
  //   if (contract.type === "local") {
  //     return processLocalContract({
  //       localContract: contract as LocalContract,
  //       chainId,
  //       localABIs,
  //       appState,
  //     });
  //   }

  //   if (contract.type === "remote") {
  //     const processedContract = await processRemoteContract({
  //       remoteContract: contract as RemoteContract,
  //       chainId,
  //       appState,
  //       rpcs,
  //       explorerKeys,
  //     });
  //     return processedContract;
  //   }
  if (contract.type === "processed") {
    return contract;
  }
  // This is a placeholder for when we implemnt the arbitary
  // contract call and cache utilities
  // https://github.com/HausDAO/daohaus-monorepo/issues/403
  throw new Error("ABI not found. Remote fetching not implemented");
};

const processStaticContract = ({
  localContract,
  chainId,
  appState,
}: {
  localContract: StaticContract;
  chainId: ValidNetwork;
  appState: ArbitraryState;
}): ProcessedContract => {
  const { targetAddress, abi, contractName } = localContract;
  const address = handleTargetAddress({ targetAddress, chainId, appState });
  if (!address) {
    throw new Error(
      `No address found for contract ${contractName} on ${chainId}`
    );
  }
  return {
    type: "processed",
    abi,
    address,
    contractName,
  };
};

export const isSearchArg = (arg: ValidArgType): arg is StringSearch => {
  return typeof arg === "string" && arg[0] === ".";
};

export const checkHasCondition = (pathString: StringSearch) =>
  pathString.includes("||");
export const handleConditionalPath = (pathString: StringSearch) => {
  const paths = pathString
    .trim()
    .split("||")
    .map((str) => str.trim())
    .filter(Boolean);

  return paths;
};

export const deepSearch = (
  appState: ArbitraryState,
  pathString: StringSearch
): unknown => {
  const path = pathString.trim().split(".").filter(Boolean);
  let state = { ...appState };
  for (let i = 0, len = path.length; i < len; i++) {
    state = state?.[path?.[i]];
  }
  return state;
};

export const checkArgType = (arg: unknown) => {
  if (isArgType(arg)) {
    return arg;
  }
  throw new Error(`Invalid arg type ${arg}`);
};

export const searchApp = (
  appState: ArbitraryState,
  pathString: StringSearch,
  shouldThrow = false
) => {
  const result = deepSearch(appState, pathString);

  if (result == null) {
    if (shouldThrow) {
      console.log("**Application State**", appState);
      console.log("result", result);
      throw new Error(`Could not find ${pathString}`);
    } else {
      return false;
    }
  }
  return result;
};

export const searchArg = ({
  appState,
  searchString,
  shouldThrow = false,
}: {
  appState: ArbitraryState;
  searchString: StringSearch;
  shouldThrow: boolean;
}) => {
  const hasCondition = checkHasCondition(searchString);

  if (hasCondition) {
    const paths = handleConditionalPath(searchString);
    for (const path of paths) {
      const result = searchApp(appState, path as StringSearch);
      if (result) {
        return checkArgType(result);
      }
    }
    throw new Error(
      `No paths in conditional path string: ${searchString} returns a value`
    );
  }
  return checkArgType(searchApp(appState, searchString, shouldThrow));
};

const findTargetAddress = ({
  appState,
  targetAddress,
  chainId,
}: {
  appState: ArbitraryState;
  targetAddress: StringSearch | Keychain | EthAddress;
  chainId: ValidNetwork;
}) => {
  if (typeof targetAddress === "string" && isEthAddress(targetAddress)) {
    return targetAddress;
  }
  if (typeof targetAddress === "string" && isSearchArg(targetAddress)) {
    return searchArg({
      searchString: targetAddress,
      appState,
      shouldThrow: true,
    });
  }
  if (
    typeof targetAddress === "object" &&
    typeof targetAddress[chainId] === "string"
  ) {
    return targetAddress[chainId] as string;
  }
  throw new Error(`No address found for targetAddress: ${targetAddress}`);
};

const handleTargetAddress = (args: {
  appState: ArbitraryState;
  targetAddress: StringSearch | Keychain | EthAddress;
  chainId: ValidNetwork;
}): EthAddress => {
  const address = findTargetAddress(args);
  if (isEthAddress(address)) return address;
  throw new Error(`Target address: ${address} is not a valid ethereum address`);
};

export const buildMultiCallTX = ({
  id,
  baalAddress = CURRENT_DAO,
  actions,
  JSONDetails = basicDetails,
  formActions = false,
  gasBufferPercentage,
}: {
  id: string;
  baalAddress?: StringSearch | Keychain | EthAddress;
  JSONDetails?: JSONDetailsSearch;
  actions: MulticallAction[];
  formActions?: boolean;
  gasBufferPercentage?: number;
}): TXLego => {
  return {
    id,
    method: "submitProposal",
    contract: {
      ...BaalContractBase,
      type: "static",
      targetAddress: baalAddress,
    },
    args: [
      {
        type: "multicall",
        actions,
        formActions,
      },
      {
        type: "proposalExpiry",
        search: `${FORM}${EXPIRY}`,
        fallback: 0,
      },
      {
        type: "estimateGas",
        actions,
        formActions,
        bufferPercentage: gasBufferPercentage,
      },
      JSONDetails,
    ],
  };
};
