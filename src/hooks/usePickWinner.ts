import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { RAFFLE_PACKAGE_ID } from '../utils/constants';
import { detectTransactionErrors, parseTransactionError } from '../utils/transactionErrorDetection';

/**
 * 🏆 PICK WINNER HOOK
 * 
 * This custom hook handles picking winners for raffles.
 * Only the raffle owner can call this function.
 */
export function usePickWinner() {
  const [isPicking, setIsPicking] = useState(false);
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

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
          tx.object('0x8'),     // Random object - Sui's system Random object
        ],
      });

      // Set gas budget for the transaction
      tx.setGasBudget(10000000); // 0.01 SUI

      // Sign and execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      // Use centralized error detection with retry logic
      await detectTransactionErrors(result, suiClient, 'Pick winner');

      console.log('Winner picked successfully:', result);
      return result;
    } catch (error) {
      console.error('Error picking winner:', error);
      // Use enhanced error parsing for better user messages
      const errorMessage = parseTransactionError(error, 'Pick winner');
      throw new Error(errorMessage);
    } finally {
      setIsPicking(false);
    }
  };

  return {
    pickWinner,
    isPicking,
  };
}
