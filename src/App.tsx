import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { Toaster } from "react-hot-toast";
import { RaffleManager } from "./components/RaffleManager";

function App() {
  return (
    <>
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
        <Box>
          <Heading>🎲 Simple Raffle dApp</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      
      <Container size="4" className="py-8">
        <RaffleManager />
      </Container>
    </>
  );
}

export default App;
