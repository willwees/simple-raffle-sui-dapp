import { Card, Heading, Text, Button, Flex, Box } from "@radix-ui/themes";
import { useRaffleList } from "../hooks/useRaffleList";
import { RaffleCard } from "./RaffleCard";
import { RAFFLE_PACKAGE_ID } from "../utils/constants";

interface ViewRafflesTabProps {
  onUpdate?: () => void;
}

export function ViewRafflesTab({ onUpdate }: ViewRafflesTabProps) {
  const { raffles, isLoading, refetch } = useRaffleList();

  const handleRefresh = () => {
    refetch();
    onUpdate?.();
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading size="4">Active Raffles</Heading>
        <Button onClick={handleRefresh} disabled={isLoading}>
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
              onUpdate={handleRefresh}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
