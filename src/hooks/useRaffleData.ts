import { useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";

interface RaffleData {
  id: string;
  owner: string;
  entrants: string[];
  entrantCount: number;
  poolValue: number;
  isOpen: boolean;
}

/**
 * Hook to fetch and manage raffle data
 */
export const useRaffleData = (packageId: string) => {
  const [loading, setLoading] = useState(false);
  const suiClient = useSuiClient();

  const fetchRaffleData = async (raffleId: string): Promise<RaffleData | null> => {
    if (!packageId || !raffleId) return null;

    try {
      setLoading(true);
      
      // Get the raffle object
      const raffleObject = await suiClient.getObject({
        id: raffleId,
        options: { showContent: true, showOwner: true }
      });

      if (!raffleObject.data) return null;

      // For now, we'll extract basic info from the object
      // In a real implementation, you might need to call view functions
      const content = raffleObject.data.content as any;
      
      return {
        id: raffleId,
        owner: content?.fields?.owner || "",
        entrants: content?.fields?.entrants || [],
        entrantCount: content?.fields?.entrants?.length || 0,
        poolValue: content?.fields?.pool_value || 0,
        isOpen: content?.fields?.is_open !== false,
      };
    } catch (error) {
      console.error("Error fetching raffle data:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkRaffleExists = async (raffleId: string): Promise<boolean> => {
    try {
      const result = await suiClient.getObject({ id: raffleId });
      return !!result.data;
    } catch {
      return false;
    }
  };

  return {
    fetchRaffleData,
    checkRaffleExists,
    loading,
  };
};
