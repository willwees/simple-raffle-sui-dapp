import { useState } from "react";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Card, Flex, Text, Button, Badge, Spinner } from "@radix-ui/themes";
import { Copy, Check, Crown, Users } from "lucide-react";
import toast from "react-hot-toast";
import { CONTRACT_MODULE, FUNCTIONS, RANDOM_OBJECT } from "../utils/constants";
import { formatAddress, formatSUI, copyToClipboard } from "../utils/formatters";

interface RaffleCardProps {
  raffle: {
    id: string;
    owner: string;
    entrants: string[];
    entrantCount: number;
    poolValue: number;
    isOpen: boolean;
  };
  packageId: string;
  onUpdate?: () => void;
}

export const RaffleCard = ({ raffle, packageId, onUpdate }: RaffleCardProps) => {
  const [copied, setCopied] = useState(false);
  const [picking, setPicking] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const isOwner = currentAccount?.address === raffle.owner;
  const hasMinParticipants = raffle.entrantCount >= 2;

  const handleCopyId = async () => {
    const success = await copyToClipboard(raffle.id);
    if (success) {
      setCopied(true);
      toast.success("Raffle ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pickWinner = async () => {
    if (!hasMinParticipants) {
      toast.error("Need at least 2 participants to pick a winner");
      return;
    }

    setPicking(true);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${CONTRACT_MODULE}::${FUNCTIONS.PICK_WINNER}`,
        arguments: [tx.object(raffle.id), tx.object(RANDOM_OBJECT)],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            toast.success("Winner picked successfully! 🎉");
            onUpdate?.();
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            toast.error("Failed to pick winner");
          },
        }
      );
    } catch (error) {
      console.error("Error picking winner:", error);
      toast.error("Failed to pick winner");
    } finally {
      setPicking(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <Flex direction="column" gap="3">
        {/* Header */}
        <Flex justify="between" align="center">
          <Flex align="center" gap="2">
            <Text size="3" weight="bold">Raffle</Text>
            {isOwner && <Crown size={16} className="text-yellow-500" />}
          </Flex>
          <Badge color={raffle.isOpen ? "green" : "gray"}>
            {raffle.isOpen ? "OPEN" : "CLOSED"}
          </Badge>
        </Flex>

        {/* Raffle ID */}
        <Flex align="center" gap="2" className="p-2 bg-gray-50 rounded">
          <Text size="1" className="font-mono flex-1">
            {formatAddress(raffle.id)}
          </Text>
          <Button
            variant="ghost"
            size="1"
            onClick={handleCopyId}
            className="hover:bg-gray-200"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </Button>
        </Flex>

        {/* Stats */}
        <Flex justify="between" align="center">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Prize Pool</Text>
            <Text size="2" weight="bold">
              {formatSUI(raffle.poolValue)} SUI
            </Text>
          </Flex>
          
          <Flex direction="column" gap="1" align="end">
            <Text size="1" color="gray">Participants</Text>
            <Flex align="center" gap="1">
              <Users size={14} />
              <Text size="2" weight="bold">{raffle.entrantCount}</Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Owner info */}
        <Flex justify="between" align="center">
          <Text size="1" color="gray">Owner:</Text>
          <Text size="1" className="font-mono">
            {formatAddress(raffle.owner)}
          </Text>
        </Flex>

        {/* Participants list */}
        {raffle.entrants && raffle.entrants.length > 0 && (
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">Participants:</Text>
            <Flex direction="column" gap="1" className="max-h-20 overflow-y-auto">
              {raffle.entrants.map((entrant: string, index: number) => (
                <Text key={entrant} size="1" className="font-mono">
                  {index + 1}. {formatAddress(entrant)}
                </Text>
              ))}
            </Flex>
          </Flex>
        )}

        {/* Actions */}
        {isOwner && raffle.isOpen && (
          <Button
            onClick={pickWinner}
            disabled={!hasMinParticipants || picking}
            size="2"
            className={hasMinParticipants 
              ? "bg-purple-600 hover:bg-purple-700" 
              : "bg-gray-400 cursor-not-allowed"
            }
          >
            {picking ? (
              <Flex align="center" gap="2">
                <Spinner size="1" />
                Picking Winner...
              </Flex>
            ) : (
              `Pick Winner ${hasMinParticipants ? "🎲" : "(Need 2+ players)"}`
            )}
          </Button>
        )}
      </Flex>
    </Card>
  );
};
