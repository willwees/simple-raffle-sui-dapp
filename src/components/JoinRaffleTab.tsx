import { useState } from "react";
import { Card, Heading, Text, Button, Box, TextField } from "@radix-ui/themes";
import toast from "react-hot-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useJoinRaffle } from "../hooks/useJoinRaffle";

interface JoinRaffleTabProps {
  onRaffleJoined?: () => void;
}

export function JoinRaffleTab({ onRaffleJoined }: JoinRaffleTabProps) {
  const currentAccount = useCurrentAccount();
  const { joinRaffle, isJoining } = useJoinRaffle();
  const [raffleIdToJoin, setRaffleIdToJoin] = useState('');

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
      onRaffleJoined?.();
      toast.success('Successfully joined raffle! 🎫');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join raffle';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
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
  );
}
