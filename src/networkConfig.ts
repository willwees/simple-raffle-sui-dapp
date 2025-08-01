import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

// Get package ID from environment variable or fallback to hardcoded values
const getPackageId = (network: string) => {
  const envPackageId = import.meta.env.VITE_RAFFLE_PACKAGE_ID;
  const envNetwork = import.meta.env.VITE_SUI_NETWORK;
  
  // If environment variables match the network, use the env package ID
  if (envNetwork === network && envPackageId) {
    return envPackageId;
  }
  
  // Fallback to hardcoded values
  switch (network) {
    case "testnet":
      return "0xac7aec8a42876bdde5fe440bc624a5458f322db3a66eb394ee67745ebc20c804";
    case "mainnet":
      return "0x0"; // Update this when you deploy to mainnet
    default:
      return "0x0";
  }
};

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        simpleRafflePackage: getPackageId("devnet"),
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        simpleRafflePackage: getPackageId("testnet"),
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        simpleRafflePackage: getPackageId("mainnet"),
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };