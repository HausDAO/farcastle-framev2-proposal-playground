import { createConfig, http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import farcasterFrame from "@farcaster/frame-wagmi-connector";

// import { injected } from "wagmi/connectors";

// console.log("sdk", sdk.context);

export const config = createConfig({
  // chains: [base, sepolia],
  chains: [sepolia],
  transports: {
    // Configure dedicated RPC providers when using in production
    // [base.id]: http(),
    [sepolia.id]: http(),
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
