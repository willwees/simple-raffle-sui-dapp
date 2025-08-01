import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, Heading, Text, Box } from "@radix-ui/themes";
import { TabNavigation, TabType } from "./components/TabNavigation";
import { CreateRaffleTab } from "./components/CreateRaffleTab";
import { JoinRaffleTab } from "./components/JoinRaffleTab";
import { ViewRafflesTab } from "./components/ViewRafflesTab";
import { WinnerNotification } from "./components/WinnerNotification";

/**
 * 🎯 RAFFLE INTERFACE
 * 
 * This component orchestrates the main raffle functionality by composing smaller components:
 * 1. WinnerNotification - Shows winner announcements
 * 2. TabNavigation - Tab switching UI
 * 3. CreateRaffleTab - Create new raffle functionality
 * 4. JoinRaffleTab - Join existing raffle functionality
 * 5. ViewRafflesTab - View all raffles functionality
 * 
 * React concepts:
 * - Component composition: Building complex UIs from smaller components
 * - State management: Managing active tab state
 * - Conditional rendering: Show different content based on state
 */
export function RaffleInterface() {
  // Get the currently connected wallet
  const currentAccount = useCurrentAccount();
  
  // State for which tab is currently active
  const [activeTab, setActiveTab] = useState<TabType>('view');

  // If wallet is not connected, show connection message
  if (!currentAccount) {
    return (
      <Card size="3" style={{ textAlign: 'center', padding: '2rem' }}>
        <Heading size="4" mb="3">Connect Your Wallet</Heading>
        <Text color="gray">
          Please connect your Sui wallet to interact with raffles
        </Text>
      </Card>
    );
  }

  return (
    <Box>
      {/* Winner Notification - Show at the top when winner is picked */}
      <WinnerNotification />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'view' && <ViewRafflesTab />}
      {activeTab === 'create' && <CreateRaffleTab />}
      {activeTab === 'join' && <JoinRaffleTab />}
    </Box>
  );
}
