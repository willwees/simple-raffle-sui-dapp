import { ERROR_CODES, ERROR_MESSAGES } from './constants';

/**
 * Format a Sui address to show first 6 and last 4 characters
 */
export const formatAddress = (address: string): string => {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format SUI amount from MIST to SUI
 */
export const formatSUI = (mist: number | string): string => {
  const amount = typeof mist === "string" ? parseInt(mist) : mist;
  return (amount / 1_000_000_000).toFixed(2);
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy: ", err);
    return false;
  }
};

/**
 * Validate if string is a valid Sui object ID
 */
export const isValidSuiObjectId = (id: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(id);
};

/**
 * Parse raffle events from transaction events
 */
export const parseRaffleEvents = (events: any[]) => {
  return events
    .filter(event => event.type.includes("simple_raffle"))
    .map(event => ({
      ...event.parsedJson,
      timestamp: event.timestampMs,
      txDigest: event.id.txDigest,
    }));
};

/**
 * Parse error message from blockchain error
 */
export const parseRaffleError = (error: any): string => {
  console.log('parseRaffleError input:', typeof error, error);
  
  // Check if it's a string error message
  if (typeof error === 'string') {
    console.log('Parsing string error:', error.substring(0, 300));
    
    // Check for Sui network-level errors first (before parsing numbers)
    if (error.includes('InsufficientCoinBalance')) {
      return 'Insufficient SUI balance to complete the transaction - please add more SUI to your wallet';
    }
    
    if (error.includes('InsufficientGas')) {
      return 'Insufficient gas to complete the transaction - please try again';
    }
    
    // Look for MoveAbort error pattern with error code (from SuiScan format)
    const moveAbortMatch = error.match(/MoveAbort.*?(\d+)\)/i);
    if (moveAbortMatch) {
      const errorCode = parseInt(moveAbortMatch[1]);
      console.log('Found MoveAbort error code:', errorCode);
      return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || `Move abort error (code: ${errorCode})`;
    }

    // Look for simple error code pattern like "MoveAbort error code: 4"
    const codeMatch = error.match(/error code:?\s*(\d+)/i);
    if (codeMatch) {
      const errorCode = parseInt(codeMatch[1]);
      console.log('Found error code:', errorCode);
      return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || `Error code: ${errorCode}`;
    }

    // Look for general abort codes in the error message (but not in network errors)
    if (!error.includes('InsufficientCoinBalance') && !error.includes('command')) {
      const abortMatch = error.match(/abort.*?(\d+)/i);
      if (abortMatch) {
        const errorCode = parseInt(abortMatch[1]);
        console.log('Found abort error code:', errorCode);
        return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || `Unknown error (code: ${errorCode})`;
      }
    }

    // Look for numeric error codes in various formats (but be more specific and avoid network errors)
    if (!error.includes('InsufficientCoinBalance') && !error.includes('command') && !error.includes('Insufficient')) {
      const numericMatch = error.match(/\b(\d+)\b/);
      if (numericMatch) {
        const errorCode = parseInt(numericMatch[1]);
        console.log('Found numeric error code:', errorCode);
        // Only treat small numbers as error codes (0-10)
        if (errorCode >= 0 && errorCode <= 10) {
          const message = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
          if (message) {
            console.log('Mapped error code to message:', message);
            return message;
          }
        }
      }
    }

    // Check for specific error patterns
    if (error.includes('ERaffleNotOpen')) return ERROR_MESSAGES[ERROR_CODES.ERaffleNotOpen];
    if (error.includes('EInsufficientPayment')) return ERROR_MESSAGES[ERROR_CODES.EInsufficientPayment];
    if (error.includes('ENotOwner')) return ERROR_MESSAGES[ERROR_CODES.ENotOwner];
    if (error.includes('EAlreadyJoined')) return ERROR_MESSAGES[ERROR_CODES.EAlreadyJoined];
    if (error.includes('EInsufficientParticipants')) return ERROR_MESSAGES[ERROR_CODES.EInsufficientParticipants];
  }

  // Check if it's an error object with a message
  if (error?.message) {
    return parseRaffleError(error.message);
  }

  // Check if it's a blockchain execution error
  if (error?.cause?.message) {
    return parseRaffleError(error.cause.message);
  }

  // Check for nested error structures that might contain the actual error
  if (error?.error?.message) {
    return parseRaffleError(error.error.message);
  }

  // Check for transaction execution errors
  if (error?.data?.message) {
    return parseRaffleError(error.data.message);
  }

  // Log the full error structure for debugging
  console.error('Full error object:', error);

  // Fallback to generic error message
  return 'Transaction failed. Please try again.';
};
