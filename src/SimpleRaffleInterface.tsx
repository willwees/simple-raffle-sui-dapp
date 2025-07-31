import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, Heading, Text, Button, Flex, Box, TextField, Badge } from "@radix-ui/themes";
import toast from "react-hot-toast";
import { useCreateRaffle } from "./hooks/useCreateRaffle";
import { useJoinRaffle } from "./hooks/useJoinRaffle";
import { useRaffleList } from "./hooks/useRaffleList";
import { usePickWinner } from "./hooks/usePickWinner";
import { formatAddress, formatSUI, copyToClipboard } from "./utils/formatters";

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
  
  // Custom hooks that handle blockchain operations
  const { createRaffle, isCreating } = useCreateRaffle();
  const { joinRaffle, isJoining } = useJoinRaffle();
  const { raffles, isLoading, refetch } = useRaffleList();
  const { pickWinner, isPicking } = usePickWinner();

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

  // Handle picking a winner
  const handlePickWinner = async (raffleId: string) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await pickWinner(raffleId);
      refetch();
      toast.success('Winner picked successfully! 🏆');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick winner';
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
                  currentAccount={currentAccount}
                  onPickWinner={handlePickWinner}
                  isPicking={isPicking}
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

/**
 * 🎴 RAFFLE CARD COMPONENT
 * 
 * Displays information about a single raffle
 */
function RaffleCard({ 
  raffle, 
  currentAccount, 
  onPickWinner, 
  isPicking 
}: { 
  raffle: any; 
  currentAccount: any;
  onPickWinner: (raffleId: string) => Promise<void>;
  isPicking: boolean;
}) {
  const isOwner = currentAccount && raffle.owner === currentAccount.address;
  
  const handleCopyRaffleId = async () => {
    const success = await copyToClipboard(raffle.id);
    if (success) {
      toast.success('Raffle ID copied to clipboard! 📋');
    } else {
      toast.error('Failed to copy raffle ID');
    }
  };
  
  return (
    <Card size="2">
      <Flex justify="between" align="start" mb="3">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="1" color="gray">Raffle ID</Text>
          <Flex align="center" gap="2" mt="1">
            <Text 
              size="1" 
              weight="bold" 
              style={{ 
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                lineHeight: '1.2'
              }}
            >
              {raffle.id}
            </Text>
            <Button 
              size="1" 
              variant="ghost" 
              onClick={handleCopyRaffleId}
              title="Copy raffle ID"
            >
              📋
            </Button>
          </Flex>
        </Box>
        <Badge color={raffle.isOpen ? 'green' : 'gray'}>
          {raffle.isOpen ? 'OPEN' : 'CLOSED'}
        </Badge>
      </Flex>
      
      <Flex gap="4" mb="3">
        <Box>
          <Text size="1" color="gray">Entry Fee</Text>
          <Text size="2" weight="bold">{formatSUI(raffle.entryFee)} SUI</Text>
        </Box>
        <Box>
          <Text size="1" color="gray">Prize Pool</Text>
          <Text size="2" weight="bold">{formatSUI(raffle.poolValue)} SUI</Text>
        </Box>
        <Box>
          <Text size="1" color="gray">Participants</Text>
          <Text size="2" weight="bold">{raffle.entrantCount}</Text>
        </Box>
      </Flex>
      
      <Flex justify="between" align="center">
        <Text size="1" color="gray">
          Owner: {formatAddress(raffle.owner)}
        </Text>
        
        {/* Show pick winner button for raffle owners */}
        {isOwner && raffle.isOpen && raffle.entrantCount > 0 && (
          <Button 
            size="1" 
            onClick={() => onPickWinner(raffle.id)}
            disabled={isPicking}
          >
            {isPicking ? 'Picking...' : '🏆 Pick Winner'}
          </Button>
        )}
      </Flex>
    </Card>
  );
}
