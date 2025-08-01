import { SuiClient } from '@mysten/sui/client';
import { parseRaffleError } from './formatters';

/**
 * Comprehensive transaction error detection utility
 * 
 * This function checks for various types of transaction failures that might
 * not be immediately apparent from the basic transaction result.
 */
export async function detectTransactionErrors(
  result: any, 
  suiClient: SuiClient,
  context: string = 'transaction'
): Promise<void> {
  console.log(`${context} transaction result:`, result);
  console.log(`${context} transaction digest:`, result.digest);

  // First, check the basic result for immediate error indicators
  // This catches most errors without waiting for block finalization
  const resultStr = JSON.stringify(result);
  console.log(`Checking basic ${context} result for error patterns...`);
  
  if (resultStr.includes('MoveAbort') || 
      resultStr.includes('failure') || 
      resultStr.includes('abort') ||
      resultStr.includes('error')) {
    console.log(`Found error indicators in basic ${context} transaction result`);
    throw new Error(parseRaffleError(resultStr));
  }

  // Then try to get detailed transaction info with retry logic for block finalization
  let detailedResult = null;
  let attempts = 0;
  const maxAttempts = 3;
  
  console.log(`Attempting to fetch detailed ${context} transaction info...`);
  
  while (attempts < maxAttempts && !detailedResult) {
    try {
      // Add a small delay before fetching (blocks need time to be indexed)
      if (attempts > 0) {
        console.log(`Retrying detailed fetch for ${context} (attempt ${attempts + 1}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // 1s, 2s delay
      }
      
      detailedResult = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showEvents: true,
          showBalanceChanges: true,
        },
      });
      
      console.log(`Successfully fetched detailed ${context} transaction result`);
      break;
      
    } catch (fetchError) {
      attempts++;
      console.log(`Attempt ${attempts} to fetch ${context} transaction details failed:`, fetchError);
      
      if (attempts >= maxAttempts) {
        console.log(`Could not fetch detailed ${context} transaction info after ${maxAttempts} retries, using basic result only`);
        break;
      }
    }
  }

  // If we got detailed results, check for errors
  if (detailedResult) {
    console.log(`=== DETAILED ${context.toUpperCase()} TRANSACTION ANALYSIS ===`);
    
    // Check the execution status from the detailed result  
    if (detailedResult.effects?.status?.status === 'failure') {
      console.log(`${context} transaction execution failed:`, detailedResult.effects.status);
      const errorMessage = detailedResult.effects.status.error || 'Transaction execution failed';
      throw new Error(parseRaffleError(errorMessage));
    }

    // Check for different status structures that might indicate failure
    const status = detailedResult.effects?.status as any;
    if (status && typeof status === 'object' && status.status === 'failure') {
      console.log(`${context} transaction failed (nested status):`, status);
      const errorMessage = status.error || 'Transaction execution failed';
      throw new Error(parseRaffleError(errorMessage));
    }

    // Additional check for abortError field (as seen in SuiScan data)
    if ((detailedResult as any).abortError) {
      const abortError = (detailedResult as any).abortError;
      console.log(`Found abortError in ${context} transaction:`, abortError);
      const errorCode = abortError.error_code;
      throw new Error(parseRaffleError(`MoveAbort error code: ${errorCode}`));
    }

    // Check effects for any error patterns
    if (detailedResult.effects) {
      const effectsStr = JSON.stringify(detailedResult.effects);
      console.log(`Checking ${context} effects for error patterns...`);
      
      // Look for failure status in the JSON
      if (effectsStr.includes('"status":"failure"') || 
          effectsStr.includes('"status": "failure"') ||
          effectsStr.includes('MoveAbort') || 
          effectsStr.includes('failure')) {
        console.log(`Found error pattern in ${context} transaction effects`);
        
        // Try to extract error code from MoveAbort pattern
        const moveAbortMatch = effectsStr.match(/MoveAbort.*?(\d+)\)/);
        if (moveAbortMatch) {
          const errorCode = parseInt(moveAbortMatch[1]);
          console.log(`Extracted error code ${errorCode} from ${context} effects`);
          throw new Error(parseRaffleError(`MoveAbort error code: ${errorCode}`));
        }
        
        throw new Error(parseRaffleError(effectsStr));
      }
    }

    // Check the entire detailed result for abort patterns
    const fullResultStr = JSON.stringify(detailedResult);
    console.log(`Checking full ${context} result for error patterns...`);
    
    // Look for abort error patterns anywhere in the result
    if (fullResultStr.includes('abortError') || 
        fullResultStr.includes('MoveAbort') ||
        fullResultStr.includes('"status":"failure"')) {
      console.log(`Found error indicators in full ${context} transaction result`);
      
      // Try to extract error code
      const errorCodeMatch = fullResultStr.match(/"error_code":(\d+)/);
      if (errorCodeMatch) {
        const errorCode = parseInt(errorCodeMatch[1]);
        console.log(`Extracted error code ${errorCode} from full ${context} result`);
        throw new Error(parseRaffleError(`MoveAbort error code: ${errorCode}`));
      }
      
      const moveAbortMatch = fullResultStr.match(/MoveAbort.*?(\d+)\)/);
      if (moveAbortMatch) {
        const errorCode = parseInt(moveAbortMatch[1]);
        console.log(`Extracted MoveAbort error code ${errorCode} from full ${context} result`);
        throw new Error(parseRaffleError(`MoveAbort error code: ${errorCode}`));
      }
      
      throw new Error(parseRaffleError(fullResultStr));
    }
  }

  console.log(`${context} completed successfully - no errors detected`);
}

/**
 * Enhanced error parsing specifically for transaction execution errors
 * 
 * This adds additional context and better error messages for common
 * transaction failure scenarios.
 */
export function parseTransactionError(error: any, context: string = 'Transaction'): string {
  console.log(`Parsing ${context} error:`, error);

  // Handle Sui network-level errors first
  if (error?.message?.includes('InsufficientCoinBalance') || 
      (typeof error === 'string' && error.includes('InsufficientCoinBalance'))) {
    return 'Insufficient SUI balance to complete the transaction - please add more SUI to your wallet';
  }

  // Handle network/connection errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return 'Network error - please check your connection and try again';
  }

  // Handle wallet/signature errors
  if (error?.message?.includes('rejected') || error?.message?.includes('cancelled')) {
    return 'Transaction was cancelled or rejected';
  }

  // Handle insufficient gas errors
  if (error?.message?.includes('InsufficientGas') || error?.message?.includes('gas')) {
    return 'Insufficient gas to complete the transaction - please try again';
  }

  // Handle object not found errors (common when objects are consumed/deleted)
  if (error?.message?.includes('ObjectNotFound') || error?.message?.includes('not found')) {
    return 'Required object not found - the raffle may have been completed or deleted';
  }

  // Use the general raffle error parser for contract-specific errors
  return parseRaffleError(error);
}
