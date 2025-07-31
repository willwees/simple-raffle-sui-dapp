import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, Flex, Text, TextField, Button, Tabs } from "@radix-ui/themes";
import { Package, Shuffle } from "lucide-react";
import toast from "react-hot-toast";
import { CreateRaffle } from "./CreateRaffle";
import { JoinRaffle } from "./JoinRaffle";
import { RaffleCard } from "./RaffleCard";
import { WinnerAnnouncement } from "./WinnerAnnouncement";
import { DebugViewFunctions } from "./DebugViewFunctions";
import { useRaffleEvents } from "../hooks/useRaffleEvents";
import { useRaffleData } from "../hooks/useRaffleData";
import { DEFAULT_PACKAGE_ID } from "../utils/constants";
import { isValidSuiObjectId } from "../utils/formatters";

export const RaffleManager = () => {
  const [packageId, setPackageId] = useState(DEFAULT_PACKAGE_ID);
  const [myRaffles, setMyRaffles] = useState<any[]>([]);
  const [joinedRaffles, setJoinedRaffles] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loadingRaffles, setLoadingRaffles] = useState(false);
  const currentAccount = useCurrentAccount();
  const { events } = useRaffleEvents(packageId);
  const { fetchRaffleData } = useRaffleData(packageId);

  // Helper function to fetch real raffle data for a list of raffle IDs
  const fetchRealRaffleData = async (raffleIds: string[]) => {
    if (!raffleIds.length) return [];
    
    setLoadingRaffles(true);
    const realRaffleData = [];
    
    // Add delay between requests to avoid rate limiting
    for (let i = 0; i < raffleIds.length; i++) {
      const raffleId = raffleIds[i];
      try {
        const data = await fetchRaffleData(raffleId);
        if (data) {
          realRaffleData.push(data);
        }
        
        // Add delay between requests (except for the last one)
        if (i < raffleIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
      } catch (error) {
        console.warn(`Failed to fetch data for raffle ${raffleId}:`, error);
        
        // If it's a rate limit error, add longer delay
        if (error instanceof Error && error.message.includes('429')) {
          console.warn('Rate limited, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay for rate limits
        }
      }
    }
    
    setLoadingRaffles(false);
    return realRaffleData;
  };

  // Process events to extract raffles and winners
  useEffect(() => {
    if (!events.length || !currentAccount) {
      setMyRaffles([]);
      setJoinedRaffles([]);
      setWinners([]);
      return;
    }

    const myCreatedRaffleIds = new Set<string>();
    const myJoinedRaffleIds = new Set<string>();
    const recentWinners: any[] = [];

    events.forEach((event: any) => {
      // Process RaffleCreated events
      if (event.type?.includes('RaffleCreated') && event.owner === currentAccount.address) {
        myCreatedRaffleIds.add(event.raffle_id);
      }

      // Process PlayerJoined events
      if (event.type?.includes('PlayerJoined') && event.player === currentAccount.address) {
        myJoinedRaffleIds.add(event.raffle_id);
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

    // Create placeholder raffles with basic info from events
    const myPlaceholderRaffles = Array.from(myCreatedRaffleIds).map(id => ({
      id,
      owner: currentAccount.address,
      entrants: [],
      entrantCount: 0,
      poolValue: 0,
      isOpen: true,
      isPlaceholder: true, // Mark as placeholder
    }));

    const joinedPlaceholderRaffles = Array.from(myJoinedRaffleIds).map(id => ({
      id,
      owner: '',
      entrants: [],
      entrantCount: 0,
      poolValue: 0,
      isOpen: true,
      isPlaceholder: true, // Mark as placeholder
    }));

    setMyRaffles(myPlaceholderRaffles);
    setJoinedRaffles(joinedPlaceholderRaffles);
    setWinners(recentWinners.slice(0, 3)); // Show only recent 3 winners
  }, [events, currentAccount]);

  const handlePackageIdChange = (value: string) => {
    setPackageId(value);
    if (value && !isValidSuiObjectId(value)) {
      toast.error("Invalid package ID format");
    }
  };

  const refreshData = async () => {
    // This will trigger a re-fetch of events and real raffle data
    toast.success("Refreshing raffle data...");
    
    try {
      // Fetch real data for all raffles
      const [myRaffleData, joinedRaffleData] = await Promise.all([
        myRaffles.length > 0 ? fetchRealRaffleData(myRaffles.map(r => r.id)) : Promise.resolve([]),
        joinedRaffles.length > 0 ? fetchRealRaffleData(joinedRaffles.map(r => r.id)) : Promise.resolve([]),
      ]);

      if (myRaffleData.length > 0) {
        setMyRaffles(myRaffleData);
      }
      
      if (joinedRaffleData.length > 0) {
        setJoinedRaffles(joinedRaffleData);
      }
      
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data. Check console for details.");
    }
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
            Current: {packageId || "No package ID set"} | Network: devnet
          </Text>
          <Text size="1" color="orange">
            💡 Tip: Raffles show basic info from events. Click refresh (🔄) to get real-time status and details.
          </Text>
        </Flex>
      </Card>

      {/* Debug Component - Remove in production */}
      <DebugViewFunctions />

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
            <Flex justify="between" align="center">
              <Text size="4" weight="bold">My Created Raffles</Text>
              {loadingRaffles && <Text size="2" color="gray">Loading...</Text>}
            </Flex>
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
            ) : loadingRaffles ? (
              <Card className="p-6 text-center">
                <Text size="3" color="gray">
                  Loading your raffles...
                </Text>
              </Card>
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
            <Flex justify="between" align="center">
              <Text size="4" weight="bold">Raffles I've Joined</Text>
              {loadingRaffles && <Text size="2" color="gray">Loading...</Text>}
            </Flex>
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
            ) : loadingRaffles ? (
              <Card className="p-6 text-center">
                <Text size="3" color="gray">
                  Loading joined raffles...
                </Text>
              </Card>
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
