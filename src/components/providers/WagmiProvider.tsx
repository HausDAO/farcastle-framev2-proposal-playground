import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import farcasterFrame from "@farcaster/frame-wagmi-connector";
import { WAGMI_CHAIN_OBJ } from "~/lib/dao-constants";

// import { injected } from "wagmi/connectors";

// console.log("sdk", sdk.context);

export const config = createConfig({
  // chains: [base, sepolia],
  chains: [WAGMI_CHAIN_OBJ],
  transports: {
    // Configure dedicated RPC providers when using in production
    // [base.id]: http(),
    [WAGMI_CHAIN_OBJ.id]: http(),
  },
  connectors: [farcasterFrame()],
  // connectors: [injected()],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
