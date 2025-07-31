import { useState, useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { RAFFLE_PACKAGE_ID } from '../utils/constants';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

export interface RaffleData {
  id: string;
  owner: string;
  entryFee: string;
  poolValue: string;
  entrantCount: number;
  isOpen: boolean;
}

/**
 * 🎯 SINGLE RAFFLE HOOK
 * 
 * This hook fetches data for a single raffle by ID.
 * Use this when you need to get specific raffle information.
 */
export function useRaffle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suiClient = useSuiClient();

  const fetchRaffle = useCallback(async (raffleId: string): Promise<RaffleData | null> => {
    if (!raffleId) return null;

    setLoading(true);
    setError(null);

    try {
      // First, check if the raffle object exists
      const raffleObject = await suiClient.getObject({
        id: raffleId,
        options: { showContent: true, showType: true }
      });

      if (!raffleObject.data) {
        setError('Raffle not found');
        return null;
      }

      // Create a transaction with all view function calls
      const tx = new Transaction();

      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'get_entrant_count',
        arguments: [tx.object(raffleId)],
      });

      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'get_pool_value',
        arguments: [tx.object(raffleId)],
      });

      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'is_open',
        arguments: [tx.object(raffleId)],
      });

      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'get_owner',
        arguments: [tx.object(raffleId)],
      });

      // Execute the transaction
      const result = await suiClient.devInspectTransactionBlock({ 
        transactionBlock: tx, 
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      });

      // Parse results
      const entrantCountResult = result.results?.[0];
      const poolValueResult = result.results?.[1];
      const isOpenResult = result.results?.[2];
      const ownerResult = result.results?.[3];

      const entrantCount = entrantCountResult?.returnValues?.[0]?.[0] 
        ? parseInt(bcs.U64.parse(Uint8Array.from(entrantCountResult.returnValues[0][0]))) 
        : 0;

      const poolValue = poolValueResult?.returnValues?.[0]?.[0]
        ? bcs.U64.parse(Uint8Array.from(poolValueResult.returnValues[0][0])).toString()
        : '0';

      const isOpen = isOpenResult?.returnValues?.[0]?.[0]
        ? bcs.Bool.parse(Uint8Array.from(isOpenResult.returnValues[0][0]))
        : false;

      const owner = ownerResult?.returnValues?.[0]?.[0]
        ? '0x' + Array.from(ownerResult.returnValues[0][0]).map(b => b.toString(16).padStart(2, '0')).join('')
        : '0x0';

      return {
        id: raffleId,
        entryFee: '1000000000', // Fixed 1 SUI entry fee
        poolValue,
        entrantCount,
        isOpen,
        owner,
      };
    } catch (error) {
      console.error('Error fetching raffle:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch raffle');
      return null;
    } finally {
      setLoading(false);
    }
  }, [suiClient]);

  const checkRaffleExists = useCallback(async (raffleId: string): Promise<boolean> => {
    try {
      const result = await suiClient.getObject({ id: raffleId });
      return !!result.data;
    } catch {
      return false;
    }
  }, [suiClient]);

  return {
    fetchRaffle,
    checkRaffleExists,
    loading,
    error,
  };
}
