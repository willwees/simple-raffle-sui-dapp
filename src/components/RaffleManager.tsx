import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, Flex, Text, TextField, Button, Tabs } from "@radix-ui/themes";
import { Package, Shuffle } from "lucide-react";
import toast from "react-hot-toast";
import { CreateRaffle } from "./CreateRaffle";
import { JoinRaffle } from "./JoinRaffle";
import { RaffleCard } from "./RaffleCard";
import { WinnerAnnouncement } from "./WinnerAnnouncement";
import { useRaffleEvents } from "../hooks/useRaffleEvents";
import { DEFAULT_PACKAGE_ID } from "../utils/constants";
import { isValidSuiObjectId } from "../utils/formatters";

export const RaffleManager = () => {
  const [packageId, setPackageId] = useState(DEFAULT_PACKAGE_ID);
  const [myRaffles, setMyRaffles] = useState<any[]>([]);
  const [joinedRaffles, setJoinedRaffles] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const currentAccount = useCurrentAccount();
  const { events } = useRaffleEvents(packageId);

  // Process events to extract raffles and winners
  useEffect(() => {
    if (!events.length || !currentAccount) return;

    const myCreatedRaffles: any[] = [];
    const myJoinedRaffles: any[] = [];
    const recentWinners: any[] = [];

    events.forEach((event: any) => {
      // Process RaffleCreated events
      if (event.type?.includes('RaffleCreated') && event.owner === currentAccount.address) {
        myCreatedRaffles.push({
          id: event.raffle_id,
          owner: event.owner,
          entrants: [],
          entrantCount: 0,
          poolValue: 0,
          isOpen: true,
        });
      }

      // Process PlayerJoined events
      if (event.type?.includes('PlayerJoined') && event.player === currentAccount.address) {
        const existingRaffle = myJoinedRaffles.find(r => r.id === event.raffle_id);
        if (!existingRaffle) {
          myJoinedRaffles.push({
            id: event.raffle_id,
            owner: '', // We don't have owner info in join events
            entrants: [event.player],
            entrantCount: event.total_entrants || 1,
            poolValue: event.total_entrants * 1_000_000_000 || 0,
            isOpen: true,
          });
        }
      }

      // Process WinnerPicked events
      if (event.type?.includes('WinnerPicked')) {
        recentWinners.push({
          raffleId: event.raffle_id,
          winner: event.winner,
          prize: event.prize_amount || 0,
          timestamp: event.timestamp,
        });
      }
    });

    setMyRaffles(myCreatedRaffles);
    setJoinedRaffles(myJoinedRaffles);
    setWinners(recentWinners.slice(0, 3)); // Show only recent 3 winners
  }, [events, currentAccount]);

  const handlePackageIdChange = (value: string) => {
    setPackageId(value);
    if (value && !isValidSuiObjectId(value)) {
      toast.error("Invalid package ID format");
    }
  };

  const refreshData = () => {
    // This will trigger a re-fetch of events
    toast.success("Data refreshed!");
  };

  if (!currentAccount) {
    return (
      <Card className="p-8 text-center">
        <Text size="4" weight="bold" className="mb-4">
          Please connect your wallet to use the raffle dApp
        </Text>
        <Text size="2" color="gray">
          Connect your Sui wallet to create and join raffles
        </Text>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="6" className="max-w-4xl mx-auto">
      {/* Package ID Input */}
      <Card className="p-4">
        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <Package size={20} />
            <Text size="3" weight="bold">Package Configuration</Text>
          </Flex>
          <Flex gap="2">
            <TextField.Root
              placeholder="Enter Package ID (0x...)"
              value={packageId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackageIdChange(e.target.value)}
              style={{ fontFamily: "monospace", fontSize: "14px", flex: 1 }}
            />
            <Button onClick={refreshData} variant="outline">
              <Shuffle size={16} />
            </Button>
          </Flex>
          <Text size="1" color="gray">
            Current: {packageId || "No package ID set"}
          </Text>
        </Flex>
      </Card>

      {/* Winner Announcements */}
      {winners.length > 0 && (
        <Flex direction="column" gap="3">
          <Text size="4" weight="bold">🎉 Recent Winners</Text>
          {winners.map((winner, index) => (
            <WinnerAnnouncement
              key={`${winner.raffleId}-${index}`}
              winner={winner.winner}
              prize={winner.prize}
            />
          ))}
        </Flex>
      )}

      {/* Main Content Tabs */}
      <Tabs.Root defaultValue="create">
        <Tabs.List>
          <Tabs.Trigger value="create">Create Raffle</Tabs.Trigger>
          <Tabs.Trigger value="join">Join Raffle</Tabs.Trigger>
          <Tabs.Trigger value="my-raffles">My Raffles ({myRaffles.length})</Tabs.Trigger>
          <Tabs.Trigger value="joined">Joined ({joinedRaffles.length})</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="create" className="mt-4">
          <CreateRaffle 
            packageId={packageId} 
            onRaffleCreated={refreshData}
          />
        </Tabs.Content>

        <Tabs.Content value="join" className="mt-4">
          <JoinRaffle packageId={packageId} />
        </Tabs.Content>

        <Tabs.Content value="my-raffles" className="mt-4">
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold">My Created Raffles</Text>
            {myRaffles.length > 0 ? (
              <Flex direction="column" gap="3">
                {myRaffles.map((raffle) => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    packageId={packageId}
                    onUpdate={refreshData}
                  />
                ))}
              </Flex>
            ) : (
              <Card className="p-6 text-center">
                <Text size="3" color="gray">
                  You haven't created any raffles yet
                </Text>
                <Text size="2" color="gray" className="mt-2">
                  Create your first raffle in the "Create Raffle" tab
                </Text>
              </Card>
            )}
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="joined" className="mt-4">
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold">Raffles I've Joined</Text>
            {joinedRaffles.length > 0 ? (
              <Flex direction="column" gap="3">
                {joinedRaffles.map((raffle) => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    packageId={packageId}
                    onUpdate={refreshData}
                  />
                ))}
              </Flex>
            ) : (
              <Card className="p-6 text-center">
                <Text size="3" color="gray">
                  You haven't joined any raffles yet
                </Text>
                <Text size="2" color="gray" className="mt-2">
                  Join a raffle in the "Join Raffle" tab
                </Text>
              </Card>
            )}
          </Flex>
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
};
