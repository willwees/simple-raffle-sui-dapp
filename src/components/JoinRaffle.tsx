import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Card, Flex, Text, TextField, Spinner, Badge } from "@radix-ui/themes";
import toast from "react-hot-toast";
import { CONTRACT_MODULE, FUNCTIONS, ENTRY_FEE } from "../utils/constants";
import { formatAddress, formatSUI, isValidSuiObjectId } from "../utils/formatters";
import { useRaffle } from "../hooks/useRaffle";

interface JoinRaffleProps {
  packageId: string;
}

export const JoinRaffle = ({ packageId }: JoinRaffleProps) => {
  const [raffleId, setRaffleId] = useState("");
  const [raffleData, setRaffleData] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const { fetchRaffle, loading: dataLoading } = useRaffle();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const loadRaffleInfo = async () => {
    if (!raffleId.trim()) {
      toast.error("Please enter a raffle ID");
      return;
    }

    if (!isValidSuiObjectId(raffleId)) {
      toast.error("Invalid raffle ID format");
      return;
    }

    const data = await fetchRaffle(raffleId);
    if (data) {
      setRaffleData(data);
      toast.success("Raffle loaded successfully!");
    } else {
      toast.error("Raffle not found or invalid");
      setRaffleData(null);
    }
  };

  const joinRaffle = async () => {
    if (!raffleData) {
      toast.error("Please load raffle info first");
      return;
    }

    if (!raffleData.isOpen) {
      toast.error("This raffle is closed");
      return;
    }

    setIsJoining(true);

    try {
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [ENTRY_FEE]);
      
      tx.moveCall({
        target: `${packageId}::${CONTRACT_MODULE}::${FUNCTIONS.JOIN}`,
        arguments: [tx.object(raffleId), coin],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            toast.success("Successfully joined the raffle!");
            // Refresh raffle data
            loadRaffleInfo();
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            toast.error("Failed to join raffle");
          },
        }
      );
    } catch (error) {
      console.error("Error joining raffle:", error);
      toast.error("Failed to join raffle");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="p-6">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Text size="5">👥</Text>
          <Text size="5" weight="bold">Join Existing Raffle</Text>
        </Flex>

        <Flex direction="column" gap="3">
          <Text size="2">Enter the raffle ID to join:</Text>
          <Flex gap="2">
            <TextField.Root
              placeholder="0x..."
              value={raffleId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRaffleId(e.target.value)}
              style={{ fontFamily: "monospace", fontSize: "14px", flex: 1 }}
            />
            <Button
              onClick={loadRaffleInfo}
              disabled={dataLoading}
              variant="outline"
            >
              {dataLoading ? "🔄" : "🔍"}
            </Button>
          </Flex>
        </Flex>

        {raffleData && (
          <Card className="p-4 bg-gray-50">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text size="3" weight="bold">Raffle Information</Text>
                <Badge color={raffleData.isOpen ? "green" : "gray"}>
                  {raffleData.isOpen ? "OPEN" : "CLOSED"}
                </Badge>
              </Flex>

              <Flex direction="column" gap="2">
                <Flex justify="between">
                  <Text size="2" color="gray">Prize Pool:</Text>
                  <Text size="2" weight="medium">
                    {formatSUI(raffleData.poolValue)} SUI
                  </Text>
                </Flex>
                
                <Flex justify="between">
                  <Text size="2" color="gray">Participants:</Text>
                  <Text size="2" weight="medium">{raffleData.entrantCount}</Text>
                </Flex>

                <Flex justify="between">
                  <Text size="2" color="gray">Owner:</Text>
                  <Text size="2" weight="medium" className="font-mono">
                    {formatAddress(raffleData.owner)}
                  </Text>
                </Flex>
              </Flex>

              {raffleData.entrants && raffleData.entrants.length > 0 && (
                <Flex direction="column" gap="2">
                  <Text size="2" color="gray">Participants:</Text>
                  <Flex direction="column" gap="1">
                    {raffleData.entrants.map((entrant: string, index: number) => (
                      <Text key={entrant} size="1" className="font-mono">
                        {index + 1}. {formatAddress(entrant)}
                      </Text>
                    ))}
                  </Flex>
                </Flex>
              )}

              {raffleData.isOpen && (
                <Button
                  onClick={joinRaffle}
                  disabled={isJoining}
                  size="3"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isJoining ? (
                    <Flex align="center" gap="2">
                      <Spinner size="1" />
                      Joining...
                    </Flex>
                  ) : (
                    `Join for ${formatSUI(ENTRY_FEE)} SUI`
                  )}
                </Button>
              )}
            </Flex>
          </Card>
        )}
      </Flex>
    </Card>
  );
};
