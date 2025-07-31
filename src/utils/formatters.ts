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
