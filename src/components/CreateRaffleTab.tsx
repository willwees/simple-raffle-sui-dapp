import { Card, Heading, Text, Button, Box } from "@radix-ui/themes";
import toast from "react-hot-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCreateRaffle } from "../hooks/useCreateRaffle";

interface CreateRaffleTabProps {
  onRaffleCreated?: () => void;
}

export function CreateRaffleTab({ onRaffleCreated }: CreateRaffleTabProps) {
  const currentAccount = useCurrentAccount();
  const { createRaffle, isCreating } = useCreateRaffle();

  const handleCreateRaffle = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // create_raffle() takes no parameters according to the contract
      await createRaffle();
      
      // Refresh the raffle list
      onRaffleCreated?.();
      
      toast.success('Raffle created successfully! 🎉');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create raffle';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
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
  );
}
