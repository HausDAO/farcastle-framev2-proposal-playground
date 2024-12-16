type DaoConfigList = Record<string, DaoCOnfig>;

type DaoCOnfig = {
  DAO_ID: string;
  DAO_SAFE: string;
  DAO_CHAIN: string;
  DAO_CHAIN_ID: number;
};

export const DAO_CONFIG: DaoConfigList = {
  "0x4748c895cb256c31e81c132c74e5a4636116d009": {
    DAO_ID: "0x4748c895cb256c31e81c132c74e5a4636116d009",
    DAO_SAFE: "0x78bc948c2e25fbe77a246a3c6c34a9baf551d791",
    DAO_CHAIN: "0x2105",
    DAO_CHAIN_ID: 8456,
  },
  "0x33279f5046ca54365eb047f0758ceacdb85099e1": {
    DAO_ID: "0x33279f5046ca54365eb047f0758ceacdb85099e1",
    DAO_SAFE: "0x1f673135006f3c96dff1adc984d184548dd66d43",
    DAO_CHAIN: "0xaa36a7",
    DAO_CHAIN_ID: 11155111,
  },
};

const DEFAULT_DAO_ID = "0x33279f5046ca54365eb047f0758ceacdb85099e1";

export const DAO_ID =
  DAO_CONFIG[process.env.NEXT_DAO_ID || DEFAULT_DAO_ID]?.DAO_ID;
export const DAO_SAFE =
  DAO_CONFIG[process.env.NEXT_DAO_ID || DEFAULT_DAO_ID]?.DAO_SAFE;
export const DAO_CHAIN =
  DAO_CONFIG[process.env.NEXT_DAO_ID || DEFAULT_DAO_ID]?.DAO_CHAIN;
export const DAO_CHAIN_ID =
  DAO_CONFIG[process.env.NEXT_DAO_ID || DEFAULT_DAO_ID]?.DAO_CHAIN_ID;

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
    DAO_CONFIG[process.env.NEXT_DAO_ID || DEFAULT_DAO_ID]?.DAO_CHAIN
  ];
