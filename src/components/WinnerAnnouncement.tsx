import { Card, Flex, Text, Button } from "@radix-ui/themes";
import { Trophy, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { formatAddress, formatSUI, copyToClipboard } from "../utils/formatters";

interface WinnerAnnouncementProps {
  winner: string;
  prize: number;
}

export const WinnerAnnouncement = ({ winner, prize }: WinnerAnnouncementProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(winner);
    if (success) {
      setCopied(true);
      toast.success("Winner address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0 animate-pulse">
      <Flex direction="column" align="center" gap="4">
        {/* Celebration */}
        <Flex direction="column" align="center" gap="2">
          <div className="text-6xl animate-bounce">🎉</div>
          <Text size="6" weight="bold" className="text-center">
            Winner Selected!
          </Text>
        </Flex>

        {/* Winner info */}
        <Card className="p-4 bg-white/10 backdrop-blur border-white/20 w-full">
          <Flex direction="column" align="center" gap="3">
            <Flex align="center" gap="2">
              <Trophy className="text-yellow-300" size={24} />
              <Text size="4" weight="bold">Champion</Text>
            </Flex>
            
            <Flex align="center" gap="2" className="p-2 bg-white/10 rounded w-full justify-center">
              <Text className="font-mono text-lg">
                {formatAddress(winner)}
              </Text>
              <Button
                variant="ghost"
                size="1"
                onClick={handleCopy}
                className="hover:bg-white/20 text-white"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </Flex>

            <Flex direction="column" align="center" gap="1">
              <Text size="2" className="opacity-90">Prize Amount</Text>
              <Text size="5" weight="bold" className="text-yellow-300">
                {formatSUI(prize)} SUI
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Confetti effect with CSS */}
        <style>
          {`
          @keyframes confetti {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #f43f5e;
            animation: confetti 3s ease-in-out infinite;
          }
          .confetti:nth-child(odd) {
            background: #8b5cf6;
            animation-delay: 0.5s;
          }
          .confetti:nth-child(even) {
            background: #06d6a0;
            animation-delay: 1s;
          }
          `}
        </style>
        
        {/* Create confetti elements */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </Flex>
    </Card>
  );
};
