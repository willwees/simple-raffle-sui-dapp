import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { RAFFLE_PACKAGE_ID } from '../utils/constants';
import { detectTransactionErrors, parseTransactionError } from '../utils/transactionErrorDetection';

/**
 * 🎫 JOIN RAFFLE HOOK
 * 
 * This custom hook handles joining existing raffles.
 * Users need to pay the entry fee to participate.
 */
export function useJoinRaffle() {
  const [isJoining, setIsJoining] = useState(false);
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const joinRaffle = async (raffleId: string) => {
    setIsJoining(true);
    
    try {
      // Create a new transaction
      const tx = new Transaction();
      
      // Fixed payment amount: 1 SUI (converted to MIST)
      const paymentInMist = 1_000_000_000; // 1 SUI = 1 billion MIST
      
      // Split coins for the payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [paymentInMist]);
      
      // Call the smart contract function to join a raffle
      tx.moveCall({
        package: RAFFLE_PACKAGE_ID,
        module: 'simple_raffle',
        function: 'join',
        arguments: [
          tx.object(raffleId),  // The raffle object to join
          paymentCoin,          // Payment coin (mutable reference)
        ],
      });

      // After the join call, any remainder from paymentCoin should be handled
      // The contract function will automatically return the remainder, but we need to
      // explicitly transfer it to avoid the UnusedValueWithoutDrop error
      if (currentAccount?.address) {
        tx.transferObjects([paymentCoin], currentAccount.address);
      }
      
      // Set gas budget explicitly
      tx.setGasBudget(10000000); // 0.01 SUI

      // Sign and execute the transaction
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      // Use centralized error detection with retry logic
      await detectTransactionErrors(result, suiClient, 'Join raffle');

      console.log('Joined raffle successfully:', result);
      return result;
    } catch (error) {
      console.error('Error joining raffle:', error);
      // Use enhanced error parsing for better user messages
      const errorMessage = parseTransactionError(error, 'Join raffle');
      throw new Error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return {
    joinRaffle,
    isJoining,
  };
}
