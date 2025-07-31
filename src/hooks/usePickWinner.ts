import { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { RAFFLE_PACKAGE_ID } from '../utils/constants';

/**
 * 🏆 PICK WINNER HOOK
 * 
 * This custom hook handles picking winners for raffles.
 * Only the raffle owner can call this function.
 */
export function usePickWinner() {
  const [isPicking, setIsPicking] = useState(false);
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const pickWinner = async (raffleId: string) => {
    setIsPicking(true);
    
    try {
      // Create a new transaction
      const tx = new Transaction();
      
      // Call the smart contract function to pick a winner
      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'pick_winner',
        arguments: [
          tx.object(raffleId),  // The raffle object
          tx.object('0x8'),     // Random object for randomness
        ],
      });

      // Sign and execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      console.log('Winner picked:', result);
      return result;
    } catch (error) {
      console.error('Error picking winner:', error);
      throw error;
    } finally {
      setIsPicking(false);
    }
  };

  return {
    pickWinner,
    isPicking,
  };
}
