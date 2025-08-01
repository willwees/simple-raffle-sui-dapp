import { Button, Flex } from "@radix-ui/themes";

export type TabType = 'create' | 'join' | 'view';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <Flex gap="2" mb="4">
      <Button 
        variant={activeTab === 'view' ? 'solid' : 'outline'}
        onClick={() => onTabChange('view')}
      >
        📋 View Raffles
      </Button>
      <Button 
        variant={activeTab === 'create' ? 'solid' : 'outline'}
        onClick={() => onTabChange('create')}
      >
        ➕ Create Raffle
      </Button>
      <Button 
        variant={activeTab === 'join' ? 'solid' : 'outline'}
        onClick={() => onTabChange('join')}
      >
        🎫 Join Raffle
      </Button>
    </Flex>
  );
}
