import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, Heading, Text, Button, Flex, Box, TextField } from "@radix-ui/themes";
import toast from "react-hot-toast";
import { useCreateRaffle } from "./hooks/useCreateRaffle";
import { useJoinRaffle } from "./hooks/useJoinRaffle";
import { useRaffleList } from "./hooks/useRaffleList";
import { useRaffleEvents } from "./hooks/useRaffleEvents";
import { WinnerAnnouncement } from "./components/WinnerAnnouncement";
import { RaffleCard } from "./components/RaffleCard";
import { RAFFLE_PACKAGE_ID } from "./utils/constants";

/**
 * 🎯 SIMPLE RAFFLE INTERFACE
 * 
 * This component handles all the main raffle functionality:
 * 1. Create a new raffle
 * 2. Join existing raffles
 * 3. View all raffles
 * 
 * React concepts:
 * - useState: Managing component state (what user types, which tab is active)
 * - Custom hooks: Reusable logic for blockchain operations
 * - Conditional rendering: Show different content based on state
 */
export function SimpleRaffleInterface() {
  // Get the currently connected wallet
  const currentAccount = useCurrentAccount();
  
  // State for which tab is currently active
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'view'>('view');
  
  // State for form inputs
  const [raffleIdToJoin, setRaffleIdToJoin] = useState('');
  
  // State for winner announcement
  const [recentWinner, setRecentWinner] = useState<{
    winner: string;
    prize: number;
    raffleId: string;
  } | null>(null);
  
  // Track processed events to avoid showing the same winner multiple times
  const [processedEventIds, setProcessedEventIds] = useState<Set<string>>(new Set());
  
  // Custom hooks that handle blockchain operations
  const { createRaffle, isCreating } = useCreateRaffle();
  const { joinRaffle, isJoining } = useJoinRaffle();
  const { raffles, isLoading, refetch } = useRaffleList();
  const { events } = useRaffleEvents(RAFFLE_PACKAGE_ID);

  // Listen for winner events
  useEffect(() => {
    if (events.length > 0) {
      // Find the most recent WinnerPicked event that we haven't processed yet
      const winnerEvent = events.find(event => {
        const eventId = `${event.txDigest}-${event.eventSeq || event.timestamp}`;
        return event.type.includes('WinnerPicked') && !processedEventIds.has(eventId);
      });
      
      if (winnerEvent && winnerEvent.winner && winnerEvent.prize_amount) {
        const eventId = `${winnerEvent.txDigest}-${winnerEvent.eventSeq || winnerEvent.timestamp}`;
        
        // Mark this event as processed
        setProcessedEventIds(prev => new Set([...prev, eventId]));
        
        // Show the winner announcement
        setRecentWinner({
          winner: winnerEvent.winner,
          prize: winnerEvent.prize_amount,
          raffleId: winnerEvent.raffle_id || 'Unknown'
        });
        
        console.log('New winner event detected:', winnerEvent);
      }
    }
  }, [events, processedEventIds]);

  // Handle creating a new raffle
  const handleCreateRaffle = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // create_raffle() takes no parameters according to the contract
      await createRaffle();
      
      // Refresh the raffle list
      refetch();
      
      toast.success('Raffle created successfully! 🎉');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create raffle';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  // Handle joining a raffle
  const handleJoinRaffle = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!raffleIdToJoin) {
      toast.error('Please enter a raffle ID');
      return;
    }

    try {
      // Join with fixed 1 SUI payment
      await joinRaffle(raffleIdToJoin);
      setRaffleIdToJoin('');
      refetch();
      toast.success('Successfully joined raffle! 🎫');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join raffle';
      toast.error(errorMessage);
      console.error(error);
    }
  };

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
      {/* Winner Announcement - Show at the top when winner is picked */}
      {recentWinner && (
        <Box mb="6">
          <WinnerAnnouncement 
            winner={recentWinner.winner} 
            prize={recentWinner.prize} 
          />
          <Flex justify="center" mt="3">
            <Button 
              variant="soft" 
              onClick={() => setRecentWinner(null)}
              size="1"
            >
              ✕ Dismiss
            </Button>
          </Flex>
        </Box>
      )}

      {/* Tab Navigation */}
      <Flex gap="2" mb="4">
        <Button 
          variant={activeTab === 'view' ? 'solid' : 'outline'}
          onClick={() => setActiveTab('view')}
        >
          📋 View Raffles
        </Button>
        <Button 
          variant={activeTab === 'create' ? 'solid' : 'outline'}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Raffle
        </Button>
        <Button 
          variant={activeTab === 'join' ? 'solid' : 'outline'}
          onClick={() => setActiveTab('join')}
        >
          🎫 Join Raffle
        </Button>
      </Flex>

      {/* Tab Content */}
      {activeTab === 'view' && (
        <Box>
          <Flex justify="between" align="center" mb="4">
            <Heading size="4">Active Raffles</Heading>
            <Button onClick={refetch} disabled={isLoading}>
              🔄 Refresh
            </Button>
          </Flex>
          
          {isLoading ? (
            <Text>Loading raffles...</Text>
          ) : raffles.length === 0 ? (
            <Card size="3" style={{ textAlign: 'center', padding: '2rem' }}>
              <Text color="gray">No raffles found. Create one to get started!</Text>
            </Card>
          ) : (
            <Box style={{ display: 'grid', gap: '1rem' }}>
              {raffles.map((raffle) => (
                <RaffleCard 
                  key={raffle.id} 
                  raffle={raffle} 
                  packageId={RAFFLE_PACKAGE_ID}
                  onUpdate={refetch}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {activeTab === 'create' && (
        <Card size="3">
          <Heading size="4" mb="4">Create New Raffle</Heading>
          
          <Box style={{ display: 'grid', gap: '1rem' }}>
            <Text color="gray" size="2">
              Click the button below to create a new raffle. The raffle will be created with default settings defined in the smart contract.
            </Text>
            
            <Button 
              onClick={handleCreateRaffle}
              disabled={isCreating}
              size="3"
            >
              {isCreating ? 'Creating...' : '🎲 Create Raffle'}
            </Button>
          </Box>
        </Card>
      )}

      {activeTab === 'join' && (
        <Card size="3">
          <Heading size="4" mb="4">Join Raffle</Heading>
          
          <Box style={{ display: 'grid', gap: '1rem' }}>
            <Box>
              <Text as="label" size="2" weight="bold" color="gray">
                Raffle ID
              </Text>
              <TextField.Root
                placeholder="Enter raffle ID to join"
                value={raffleIdToJoin}
                onChange={(e) => setRaffleIdToJoin(e.target.value)}
              />
              <Text size="1" color="gray" mt="1">
                💡 Tip: You can copy the full raffle ID from any raffle card above using the 📋 button
              </Text>
            </Box>
            
            <Text size="2" color="gray">
              Entry fee: 1.0 SUI (fixed amount)
            </Text>
            
            <Button 
              onClick={handleJoinRaffle}
              disabled={isJoining}
              size="3"
            >
              {isJoining ? 'Joining...' : '🎫 Join Raffle'}
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}
