import {
  base,
  sepolia,
  mainnet,
  polygon,
  gnosis,
  optimism,
  arbitrum,
  Chain,
} from "wagmi/chains";

type DaoConfigList = Record<string, DaoCOnfig>;

type DaoCOnfig = {
  DAO_ID: string;
  DAO_SAFE: string;
  DAO_CHAIN: string;
  DAO_CHAIN_ID: number;
};

export const DAO_CONFIG: DaoConfigList = {
  wall: {
    DAO_ID: "0x4748c895cb256c31e81c132c74e5a4636116d009",
    DAO_SAFE: "0x78bc948c2e25fbe77a246a3c6c34a9baf551d791",
    DAO_CHAIN: "0x2105",
    DAO_CHAIN_ID: optimism.id,
  },
  "0x33279f5046ca54365eb047f0758ceacdb85099e1": {
    DAO_ID: "0x33279f5046ca54365eb047f0758ceacdb85099e1",
    DAO_SAFE: "0x1f673135006f3c96dff1adc984d184548dd66d43",
    DAO_CHAIN: "0xaa36a7",
    DAO_CHAIN_ID: sepolia.id,
  },
  "0x2a244bb4ccd4eb0897cf61e0c61963e1e1d161e3": {
    DAO_ID: "0x2a244bb4ccd4eb0897cf61e0c61963e1e1d161e3",
    DAO_CHAIN: "0xa",
    DAO_SAFE: "",
    DAO_CHAIN_ID: optimism.id,
  },
};

export const HOLLOW_SERVANTS_DAO_ID =
  "0x2a244bb4ccd4eb0897cf61e0c61963e1e1d161e3";
const DEFAULT_DAO_ID = "0x33279f5046ca54365eb047f0758ceacdb85099e1";

// todo - need to rework for env set and params set - maybe another provider

export const DAO_ID =
  DAO_CONFIG[process.env.NEXT_PUBLIC_DAO_ID || DEFAULT_DAO_ID]?.DAO_ID;
export const DAO_SAFE =
  DAO_CONFIG[process.env.NEXT_PUBLIC_DAO_ID || DEFAULT_DAO_ID]?.DAO_SAFE;
export const DAO_CHAIN =
  DAO_CONFIG[process.env.NEXT_PUBLIC_DAO_ID || DEFAULT_DAO_ID]?.DAO_CHAIN;
export const DAO_CHAIN_ID =
  DAO_CONFIG[process.env.NEXT_PUBLIC_DAO_ID || DEFAULT_DAO_ID]?.DAO_CHAIN_ID;

const EXPLORER_URLS: Record<string, string> = {
  "0x1": "https://etherscan.io",
  "0x64": "https://gnosisscan.io",
  "0x89": "https://polygonscan.com",
  "0xa": "https://optimistic.etherscan.io",
  "0xa4b1": "https://arbiscan.io",
  "0xaa36a7": "https://sepolia.etherscan.io",
  "0x2105": "https://basescan.org",
};
export const EXPLORER_URL =
  EXPLORER_URLS[
    DAO_CONFIG[process.env.NEXT_PUBLIC_DAO_ID || DEFAULT_DAO_ID]?.DAO_CHAIN
  ];

const WAGMI_CHAIN_OBJS: Record<string, Chain> = {
  "0x1": mainnet,
  "0x64": gnosis,
  "0x89": polygon,
  "0xa": optimism,
  "0xa4b1": arbitrum,
  "0xaa36a7": sepolia,
  "0x2105": base,
};
export const WAGMI_CHAIN_OBJ =
  WAGMI_CHAIN_OBJS[
    DAO_CONFIG[process.env.NEXT_PUBLIC_DAO_ID || DEFAULT_DAO_ID]?.DAO_CHAIN
  ];
