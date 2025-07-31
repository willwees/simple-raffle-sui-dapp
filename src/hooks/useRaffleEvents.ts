import { useEffect, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { CONTRACT_MODULE } from "../utils/constants";

interface RaffleEvent {
  type: string;
  raffle_id?: string;
  owner?: string;
  player?: string;
  winner?: string;
  prize_amount?: number;
  total_entrants?: number;
  timestamp?: string;
  txDigest?: string;
}

/**
 * Hook to listen for raffle events in real-time
 */
export const useRaffleEvents = (packageId: string, pollInterval = 5000) => {
  const [events, setEvents] = useState<RaffleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const suiClient = useSuiClient();

  useEffect(() => {
    if (!packageId) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Helper function to safely query events
        const safeQueryEvents = async (eventType: string) => {
          try {
            const result = await suiClient.queryEvents({
              query: {
                MoveEventType: `${packageId}::${CONTRACT_MODULE}::${eventType}`
              },
              order: "descending",
              limit: 20,
            });
            return result.data || [];
          } catch (error) {
            console.warn(`Failed to fetch ${eventType} events:`, error);
            return [];
          }
        };

        // Query different event types
        const [createEvents, joinEvents, winnerEvents] = await Promise.all([
          safeQueryEvents('RaffleCreated'),
          safeQueryEvents('PlayerJoined'), 
          safeQueryEvents('WinnerPicked'),
        ]);

        // Combine all events
        const allEvents = [...createEvents, ...joinEvents, ...winnerEvents];

        const parsedEvents = allEvents.map((event: any) => ({
          ...event.parsedJson,
          timestamp: event.timestampMs,
          txDigest: event.id.txDigest,
          type: event.type,
        }));

        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, pollInterval);
    return () => clearInterval(interval);
  }, [packageId, suiClient, pollInterval]);

  return { events, loading };
};
