import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Card, Flex, Text, Spinner } from "@radix-ui/themes";
import { Plus, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { CONTRACT_MODULE, FUNCTIONS } from "../utils/constants";
import { copyToClipboard, formatAddress } from "../utils/formatters";

interface CreateRaffleProps {
  packageId: string;
  onRaffleCreated?: (raffleId: string) => void;
}

export const CreateRaffle = ({ packageId, onRaffleCreated }: CreateRaffleProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdRaffleId, setCreatedRaffleId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const createRaffle = async () => {
    if (!packageId) {
      toast.error("Please enter a package ID first");
      return;
    }

    setIsCreating(true);
    
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${CONTRACT_MODULE}::${FUNCTIONS.CREATE_RAFFLE}`,
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            
            // Try multiple methods to extract the raffle ID
            let raffleId = null;
            
            // Method 1: Check objectChanges for created objects (newer SDK format)
            if ((result as any).objectChanges) {
              const createdObject = (result as any).objectChanges.find(
                (change: any) => change.type === 'created'
              );
              if (createdObject) {
                raffleId = createdObject.objectId;
              }
            }
            
            // Method 2: Check effects.created (older format)
            if (!raffleId) {
              const effects = (result as any).effects;
              if (effects?.created && effects.created.length > 0) {
                raffleId = effects.created[0].reference?.objectId || effects.created[0].objectId;
              }
            }
            
            // Method 3: Check digest and log for debugging
            if (!raffleId) {
              console.log("Full transaction result:", JSON.stringify(result, null, 2));
              
              // Show the transaction was successful but we couldn't get the ID
              toast.success("Raffle created successfully! Check console for transaction details.");
              
              // Use the transaction digest as a fallback indicator
              const digest = (result as any).digest;
              if (digest) {
                setCreatedRaffleId(digest);
                onRaffleCreated?.(digest);
              }
              return;
            }
            
            setCreatedRaffleId(raffleId);
            onRaffleCreated?.(raffleId);
            toast.success("Raffle created successfully!");
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            toast.error("Failed to create raffle");
          },
        }
      );
    } catch (error) {
      console.error("Error creating raffle:", error);
      toast.error("Failed to create raffle");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (createdRaffleId) {
      const success = await copyToClipboard(createdRaffleId);
      if (success) {
        setCopied(true);
        toast.success("Raffle ID copied!");
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <Card className="p-6">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Plus size={20} />
          <Text size="5" weight="bold">Create New Raffle</Text>
        </Flex>
        
        <Text size="2" color="gray" className="leading-relaxed">
          Create a new raffle where players can join for 1 SUI. You'll be the owner and can pick the winner when there are at least 2 participants.
        </Text>

        {!createdRaffleId ? (
          <Button
            onClick={createRaffle}
            disabled={isCreating || !packageId}
            size="3"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <Flex align="center" gap="2">
                <Spinner size="1" />
                Creating Raffle...
              </Flex>
            ) : (
              "Create Raffle"
            )}
          </Button>
        ) : (
          <Flex direction="column" gap="3" className="p-4 bg-green-50 rounded-lg border border-green-200">
            <Text size="3" weight="bold" color="green">
              🎉 Raffle Created Successfully!
            </Text>
            
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">Raffle ID:</Text>
              <Flex align="center" gap="2" className="p-2 bg-white rounded border">
                <Text size="1" className="font-mono flex-1">
                  {formatAddress(createdRaffleId)}
                </Text>
                <Button
                  variant="ghost"
                  size="1"
                  onClick={handleCopy}
                  className="hover:bg-gray-100"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </Flex>
            </Flex>
            
            <Text size="1" color="gray">
              Share this ID with others so they can join your raffle!
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
