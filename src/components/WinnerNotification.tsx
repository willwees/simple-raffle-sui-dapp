import { useState, useEffect } from "react";
import { Button, Flex, Box } from "@radix-ui/themes";
import { useRaffleEvents } from "../hooks/useRaffleEvents";
import { WinnerAnnouncement } from "./WinnerAnnouncement";
import { RAFFLE_PACKAGE_ID } from "../utils/constants";

export function WinnerNotification() {
  const { events } = useRaffleEvents(RAFFLE_PACKAGE_ID);
  
  // State for winner announcement
  const [recentWinner, setRecentWinner] = useState<{
    winner: string;
    prize: number;
    raffleId: string;
  } | null>(null);
  
  // Track processed events to avoid showing the same winner multiple times
  const [processedEventIds, setProcessedEventIds] = useState<Set<string>>(new Set());

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

  if (!recentWinner) {
    return null;
  }

  return (
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
  );
}
