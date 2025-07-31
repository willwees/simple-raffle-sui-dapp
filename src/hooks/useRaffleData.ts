import { useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_MODULE, FUNCTIONS } from "../utils/constants";

interface RaffleData {
  id: string;
  owner: string;
  entrants: string[];
  entrantCount: number;
  poolValue: number;
  isOpen: boolean;
}

/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Please use `useRaffleList` for fetching raffle data instead.
 * 
 * Hook to fetch and manage raffle data using view functions
 */
export const useRaffleData = (packageId: string) => {
  console.warn('⚠️ useRaffleData is deprecated. Please use useRaffleList instead.');
  
  const [loading, setLoading] = useState(false);
  const suiClient = useSuiClient();
  
  // Simple cache to avoid repeated requests
  const [cache, setCache] = useState<{ [key: string]: { data: RaffleData; timestamp: number } }>({});

  const fetchRaffleData = async (raffleId: string): Promise<RaffleData | null> => {
    if (!packageId || !raffleId) return null;

    // Check cache first (5 minute cache)
    const cached = cache[raffleId];
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.log(`Using cached data for raffle ${raffleId}`);
      return cached.data;
    }

    try {
      setLoading(true);
      
      // First check if the object exists
      const raffleObject = await suiClient.getObject({
        id: raffleId,
        options: { showContent: true }
      });

      if (!raffleObject.data) return null;

      // Helper function to call view functions with better error handling
      const callViewFunction = async (functionName: string) => {
        try {
          const tx = new Transaction();
          tx.moveCall({
            target: `${packageId}::${CONTRACT_MODULE}::${functionName}`,
            arguments: [tx.object(raffleId)],
          });

          const result = await suiClient.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
          });

          return result.results?.[0]?.returnValues?.[0] || null;
        } catch (error) {
          console.warn(`Failed to call view function ${functionName}:`, error);
          return null;
        }
      };

      // Call view functions with fallbacks
      const [entrantCountResult, poolValueResult, isOpenResult, ownerResult] = await Promise.all([
        callViewFunction(FUNCTIONS.GET_ENTRANT_COUNT), 
        callViewFunction(FUNCTIONS.GET_POOL_VALUE),
        callViewFunction(FUNCTIONS.IS_OPEN),
        callViewFunction(FUNCTIONS.GET_OWNER),
      ]);

      // Parse results with fallbacks
      const parseU64 = (result: any, fallback: number = 0): number => {
        if (!result || !result[0]) return fallback;
        try {
          const bytes = result[0];
          let value = 0;
          for (let i = 0; i < Math.min(8, bytes.length); i++) {
            value += bytes[i] * Math.pow(256, i);
          }
          return value;
        } catch {
          return fallback;
        }
      };

      const parseAddress = (result: any, fallback: string = ""): string => {
        if (!result || !result[0]) return fallback;
        try {
          const bytes = result[0];
          return "0x" + Array.from(bytes)
            .map((b: any) => b.toString(16).padStart(2, '0'))
            .join('');
        } catch {
          return fallback;
        }
      };

      const parseBool = (result: any, fallback: boolean = true): boolean => {
        if (!result || !result[0]) return fallback;
        try {
          return result[0][0] === 1;
        } catch {
          return fallback;
        }
      };

      // Parse the results with fallbacks
      const entrantCount = parseU64(entrantCountResult, 0);
      const poolValue = parseU64(poolValueResult, 0);
      const isOpen = parseBool(isOpenResult, true);
      const owner = parseAddress(ownerResult, "");

      // For entrants, we'll use a simpler approach for now
      // since parsing vector<address> is complex
      const entrants: string[] = [];

      console.log("Parsed raffle data:", {
        entrantCount,
        poolValue,
        isOpen,
        owner,
        raffleId
      });

      const raffleData = {
        id: raffleId,
        owner,
        entrants,
        entrantCount,
        poolValue,
        isOpen,
      };

      // Cache the result
      setCache(prev => ({
        ...prev,
        [raffleId]: {
          data: raffleData,
          timestamp: Date.now()
        }
      }));

      return raffleData;
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

  const fetchEntrants = async (raffleId: string): Promise<string[]> => {
    if (!packageId || !raffleId) return [];

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${CONTRACT_MODULE}::${FUNCTIONS.GET_ENTRANTS}`,
        arguments: [tx.object(raffleId)],
      });

      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      const returnValue = result.results?.[0]?.returnValues?.[0];
      if (!returnValue || !returnValue[0]) return [];

      // Parse vector<address> - this is complex, so we'll log and return empty for now
      console.log("Entrants raw data:", returnValue);
      
      // TODO: Implement proper vector<address> parsing
      // For now, we rely on entrantCount and show placeholder addresses
      return [];
    } catch (error) {
      console.warn("Failed to fetch entrants:", error);
      return [];
    }
  };

  return {
    fetchRaffleData,
    checkRaffleExists,
    fetchEntrants,
    loading,
  };
};
