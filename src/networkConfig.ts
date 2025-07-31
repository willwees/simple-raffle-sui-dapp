import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        // Simple Raffle Package
        simpleRafflePackage: "0x0",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        // Simple Raffle Package (update with your testnet deployment)
        simpleRafflePackage: "0xac7aec8a42876bdde5fe440bc624a5458f322db3a66eb394ee67745ebc20c804",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        // Simple Raffle Package (update with your mainnet deployment)
        simpleRafflePackage: "0x0",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };