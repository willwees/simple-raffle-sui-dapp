import { useState } from "react";
import { Card, Flex, Text, Button, TextField } from "@radix-ui/themes";
import { useRaffleData } from "../hooks/useRaffleData";
import { DEFAULT_PACKAGE_ID } from "../utils/constants";

/**
 * Debug component to test view functions
 */
export const DebugViewFunctions = () => {
  const [raffleId, setRaffleId] = useState("");
  const [debugData, setDebugData] = useState<any>(null);
  const { fetchRaffleData, fetchEntrants, loading } = useRaffleData(DEFAULT_PACKAGE_ID);

  const testViewFunctions = async () => {
    if (!raffleId.trim()) return;
    
    console.log("Testing view functions for raffle:", raffleId);
    
    const data = await fetchRaffleData(raffleId);
    const entrants = await fetchEntrants(raffleId);
    
    setDebugData({
      ...data,
      entrants,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="p-4 bg-yellow-50 border border-yellow-200">
      <Flex direction="column" gap="3">
        <Text size="3" weight="bold" color="orange">
          🔧 Debug View Functions
        </Text>
        
        <Flex gap="2">
          <TextField.Root
            placeholder="Enter raffle ID to debug..."
            value={raffleId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRaffleId(e.target.value)}
            style={{ flex: 1, fontFamily: "monospace" }}
          />
          <Button 
            onClick={testViewFunctions} 
            disabled={loading || !raffleId.trim()}
            size="2"
          >
            Test
          </Button>
        </Flex>

        {debugData && (
          <Card className="p-3 bg-white border">
            <Text size="2" weight="bold" className="mb-2">View Function Results:</Text>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </Card>
        )}
      </Flex>
    </Card>
  );
};
