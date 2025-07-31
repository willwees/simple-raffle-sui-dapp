import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { RAFFLE_PACKAGE_ID } from '../utils/constants';
import { detectTransactionErrors, parseTransactionError } from '../utils/transactionErrorDetection';

/**
 * 🎯 CREATE RAFFLE HOOK
 * 
 * This custom hook handles creating new raffles on the blockchain.
 * 
 * React Hook concepts:
 * - Custom hooks: Functions that start with "use" and can use other hooks
 * - useState: Manages loading state
 * - Returns: An object with functions and state that components can use
 */
export function useCreateRaffle() {
  const [isCreating, setIsCreating] = useState(false);
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const createRaffle = async () => {
    setIsCreating(true);
    
    try {
      // Create a new transaction
      const tx = new Transaction();
      
      // Call the smart contract function to create a raffle
      // Note: create_raffle() takes no parameters according to the contract
      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'create_raffle',
        arguments: [], // No arguments needed
      });

      // Sign and execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      // Use centralized error detection with retry logic
      await detectTransactionErrors(result, suiClient, 'Create raffle');

      console.log('Raffle created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating raffle:', error);
      // Use enhanced error parsing for better user messages
      const errorMessage = parseTransactionError(error, 'Create raffle');
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createRaffle,
    isCreating,
  };
}
