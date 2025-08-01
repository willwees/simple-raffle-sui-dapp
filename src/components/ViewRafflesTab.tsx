import { useEffect, useState } from "react";
import { Card, Heading, Text, Button, Flex, Box } from "@radix-ui/themes";
import { useRaffleList } from "../hooks/useRaffleList";
import { useRaffleEvents } from "../hooks/useRaffleEvents";
import { RaffleCard } from "./RaffleCard";
import { RAFFLE_PACKAGE_ID } from "../utils/constants";

interface ViewRafflesTabProps {
  onUpdate?: () => void;
}

export function ViewRafflesTab({ onUpdate }: ViewRafflesTabProps) {
  const { raffles, isLoading, refetch } = useRaffleList();
  const { events } = useRaffleEvents(RAFFLE_PACKAGE_ID);

  // Track processed winner events to avoid duplicate refreshes
  const [processedWinnerEvents, setProcessedWinnerEvents] = useState<Set<string>>(new Set());

  // Listen for WinnerPicked events and auto-refresh
  useEffect(() => {
    const newWinnerEvents = events.filter(event => {
      if (!event.type || !event.type.includes('WinnerPicked')) return false;
      
      // Create unique event ID
      const eventId = `${event.txDigest}-${event.eventSeq || event.timestamp}`;
      return !processedWinnerEvents.has(eventId);
    });

    if (newWinnerEvents.length > 0) {
      console.log(`Found ${newWinnerEvents.length} new WinnerPicked events, refreshing raffle list...`);
      
      // Mark events as processed
      const newProcessedIds = new Set(processedWinnerEvents);
      newWinnerEvents.forEach(event => {
        const eventId = `${event.txDigest}-${event.eventSeq || event.timestamp}`;
        newProcessedIds.add(eventId);
      });
      setProcessedWinnerEvents(newProcessedIds);

      // Refresh with a small delay to ensure blockchain state is updated
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [events, refetch, processedWinnerEvents]);

  const handleRefresh = async () => {
    console.log("ViewRafflesTab: Manual refresh triggered...");
    await refetch();
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
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
