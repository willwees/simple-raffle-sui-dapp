import { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { RAFFLE_PACKAGE_ID } from '../utils/constants';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

/**
 * 📋 RAFFLE LIST HOOK
 * 
 * This custom hook fetches and manages the list of all raffles.
 * It uses Sui events to find created raffles and then fetches their current state.
 */
export function useRaffleList() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const suiClient = useSuiClient();

  const fetchRaffles = async () => {
    console.log("useRaffleList: Starting to fetch raffles...");
    setIsLoading(true);
    
    try {
      // Query events to find all raffles that were created
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${RAFFLE_PACKAGE_ID}::simple_raffle::RaffleCreated`
        },
        order: 'descending',
        limit: 50,
      });

      console.log('Found raffle events:', events);

      // Extract raffle IDs from events and fetch their current state
      const rafflePromises = events.data.map(async (event: any) => {
        try {
          // Extract raffle ID from the event
          let raffleId: string;
          
          if (event.parsedJson && (event.parsedJson as any).raffle_id) {
            raffleId = (event.parsedJson as any).raffle_id;
          } else if (event.parsedJson && (event.parsedJson as any).id) {
            raffleId = (event.parsedJson as any).id;
          } else {
            // Try to find it in the object changes
            const objectChanges = await suiClient.getTransactionBlock({
              digest: event.id.txDigest,
              options: { showObjectChanges: true }
            });
            
            const createdObject = objectChanges.objectChanges?.find(
              (change: any) => change.type === 'created' && 
              change.objectType?.includes('simple_raffle::Raffle')
            );
            
            if (!createdObject) {
              console.warn('Could not find raffle ID for event:', event);
              return null;
            }
            
            raffleId = (createdObject as any).objectId;
          }

          // Fetch raffle data using view functions
          const raffleData = await fetchRaffleData(raffleId);
          return raffleData;
        } catch (error) {
          console.error('Error processing raffle event:', error);
          return null;
        }
      });

      const resolvedRaffles = await Promise.all(rafflePromises);
      const validRaffles = resolvedRaffles.filter(raffle => raffle !== null);
      
      console.log("useRaffleList: Fetched raffles:", validRaffles.length, "valid raffles");
      setRaffles(validRaffles);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      // If events fail, show empty state instead of mock data
      setRaffles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fetch individual raffle data using view functions
  const fetchRaffleData = async (raffleId: string) => {
    try {
      // First, get the raffle object to ensure it exists
      const raffleObject = await suiClient.getObject({
        id: raffleId,
        options: { showContent: true, showType: true }
      });

      if (!raffleObject.data) {
        console.warn('Raffle object not found:', raffleId);
        return null;
      }

      // Create a single transaction with all view function calls
      const tx = new Transaction();

      // Call view functions to get raffle state
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

      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'has_winner',
        arguments: [tx.object(raffleId)],
      });

      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'get_winner',
        arguments: [tx.object(raffleId)],
      });

      // Execute the transaction with all view calls
      const result = await suiClient.devInspectTransactionBlock({ 
        transactionBlock: tx, 
        sender: '0x0000000000000000000000000000000000000000000000000000000000000000'
      });

      // Parse results - each moveCall should have a corresponding result
      const entrantCountResult = result.results?.[0];
      const poolValueResult = result.results?.[1];
      const isOpenResult = result.results?.[2];
      const ownerResult = result.results?.[3];
      const hasWinnerResult = result.results?.[4];
      const getWinnerResult = result.results?.[5];

      // Parse the return values
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

      const hasWinner = hasWinnerResult?.returnValues?.[0]?.[0]
        ? bcs.Bool.parse(Uint8Array.from(hasWinnerResult.returnValues[0][0]))
        : false;

      // Parse winner address - Option<address> returns either Some or None
      let winner: string | null = null;
      if (hasWinner && getWinnerResult?.returnValues?.[0]?.[0]) {
        try {
          // Option<address> when Some contains the address bytes
          const winnerBytes = getWinnerResult.returnValues[0][0];
          if (winnerBytes && winnerBytes.length >= 32) {
            winner = '0x' + Array.from(winnerBytes.slice(1, 33)) // Skip option tag, take 32 bytes
              .map(b => b.toString(16).padStart(2, '0')).join('');
          }
        } catch (error) {
          console.warn('Failed to parse winner address:', error);
        }
      }

      return {
        id: raffleId,
        entryFee: '1000000000', // Fixed 1 SUI entry fee
        poolValue,
        entrantCount,
        isOpen,
        owner,
        hasWinner,
        winner,
      };
    } catch (error) {
      console.error('Error fetching raffle data for', raffleId, ':', error);
      // Return basic data if view functions fail
      return {
        id: raffleId,
        entryFee: '1000000000',
        poolValue: '0',
        entrantCount: 0,
        isOpen: true,
        owner: '0x0',
        hasWinner: false,
        winner: null,
      };
    }
  };

  // Fetch raffles when the hook is first used
  useEffect(() => {
    fetchRaffles();
  }, []);

  return {
    raffles,
    isLoading,
    refetch: fetchRaffles,
  };
}
