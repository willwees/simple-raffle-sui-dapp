import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { Toaster } from "react-hot-toast";
import { WalletStatus } from "./WalletStatus";
import { SimpleRaffleInterface } from "./SimpleRaffleInterface";

/**
 * 🎯 SIMPLIFIED RAFFLE DAPP
 * 
 * This is the main app component that shows:
 * 1. Wallet connection at the top
 * 2. Simple raffle interface in the middle
 * 
 * Key React concepts used:
 * - Components: Reusable UI pieces
 * - State: Data that can change (useState)
 * - Props: Data passed between components
 */
function App() {
  return (
    <>
      {/* Toast notifications - shows success/error messages */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Header with wallet connection */}
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          background: "white",
          zIndex: 10,
        }}
      >
        <Heading size="4">🎲 Simple Raffle dApp</Heading>
        <Flex align="center" gap="3">
          <WalletStatus />
          <ConnectButton />
        </Flex>
      </Flex>

      {/* Main content */}
      <Container size="4" py="6">
        <Box mb="6">
          <Heading size="6" mb="2">
            Welcome to the Sui Raffle dApp! 🎉
          </Heading>
          <Text color="gray" size="3">
            Connect your wallet and start creating or joining raffles on the Sui blockchain.
          </Text>
        </Box>

        {/* The main raffle interface component */}
        <SimpleRaffleInterface />
      </Container>
    </>
  );
}

export default App;
