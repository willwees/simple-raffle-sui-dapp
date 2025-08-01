# 🎲 Simple Raffle dApp

A clean, simple React frontend for the Sui blockchain raffle smart contract built with the Mysten Labs dApp template.

![Raffle dApp Screenshot](https://img.shields.io/badge/Built_with-Sui-blue?style=for-the-badge&logo=sui)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🚀 Features

- **Create Raffles**: Start new raffles with 1 SUI entry fee
- **Join Raffles**: Participate in existing raffles  
- **Pick Winners**: Random winner selection for raffle owners
- **Real-time Updates**: Event-driven updates using Sui blockchain events
- **Responsive Design**: Clean UI built with Radix UI and Tailwind CSS
- **Testing Friendly**: Easy package ID switching for different deployments

## 📋 Contract Interface

### Entry Functions
```typescript
create_raffle()                                    // Creates new raffle
join(raffle_id: string, payment: TransactionObjectInput)  // Join with 1 SUI
pick_winner(raffle_id: string, random: "0x8")     // Pick winner (owner only)
```

### Constants
- **Entry Fee**: 1 SUI (1,000,000,000 MIST)
- **Min Participants**: 2 players
- **Random Object**: `0x8`

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ or Bun
- Sui Wallet browser extension
- Access to Sui devnet/testnet

### Quick Start
```bash
# Clone the repository
git clone https://github.com/willwees/simple-raffle-sui
cd simple-raffle-dapp

# Install dependencies
bun install

# Start development server
bun dev
```

### Package Configuration
1. Deploy your raffle smart contract to Sui
2. Copy the package ID from deployment
3. Enter the package ID in the dApp's package configuration field
4. Start creating and joining raffles!

## 🎯 How to Use

### For Raffle Creators
1. **Connect Wallet** - Connect your Sui wallet
2. **Set Package ID** - Enter your deployed contract's package ID
3. **Create Raffle** - Click "Create Raffle" button
4. **Share Raffle ID** - Copy and share the raffle ID with participants
5. **Pick Winner** - Once 2+ players join, click "Pick Winner"

### For Participants
1. **Connect Wallet** - Connect your Sui wallet with at least 1 SUI
2. **Join Raffle** - Enter the raffle ID and click "Load Raffle Info"
3. **Pay Entry Fee** - Click "Join for 1 SUI" to participate
4. **Wait for Winner** - Wait for the raffle owner to pick a winner

## 🏗️ Project Structure

```
src/
├── components/
│   ├── CreateRaffle.tsx      # Create new raffles
│   ├── JoinRaffle.tsx        # Join existing raffles  
│   ├── RaffleCard.tsx        # Display raffle information
│   ├── RaffleManager.tsx     # Main component with tabs
│   └── WinnerAnnouncement.tsx # Winner celebration
├── hooks/
│   ├── useCreateRaffle.ts    # Create new raffles
│   ├── useJoinRaffle.ts      # Join existing raffles  
│   ├── usePickWinner.ts      # Pick raffle winners
│   ├── useRaffle.ts          # Single raffle data fetching
│   ├── useRaffleEvents.ts    # Real-time event listening
│   ├── useRaffleList.ts      # List all raffles
│   └── useRaffleData.ts      # ⚠️ DEPRECATED - use useRaffle instead
├── utils/
│   ├── constants.ts          # Contract constants 
│   └── formatters.ts         # Utility functions
├── App.tsx                   # Main app component
└── main.tsx                  # App entry point
```

## 🎨 UI Components

### Features
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live event updates every 5 seconds
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: Success/error feedback
- **Copy to Clipboard**: Easy sharing of raffle IDs
- **Winner Celebrations**: Confetti animation for winners

### Design System
- **Primary Color**: Blue (#3b82f6)
- **Success Color**: Green (#10b981)  
- **Error Color**: Red (#ef4444)
- **Typography**: Clean, readable fonts
- **Cards**: White background with subtle shadows

## 🔧 Development

### Available Scripts
```bash
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build
bun lint         # Run ESLint
```

### Environment Setup
The app works with:
- **Devnet**: For development and testing
- **Testnet**: For more realistic testing
- **Mainnet**: For production (update package IDs)

### Contract Integration
The app integrates with your Sui Move smart contract:

```move
// Example contract structure
module simple_raffle {
    public entry fun create_raffle(ctx: &mut TxContext)
    public entry fun join(raffle: &mut Raffle, payment: Coin<SUI>, ctx: &mut TxContext)  
    public entry fun pick_winner(raffle: &mut Raffle, r: &Random, ctx: &mut TxContext)
}
```

## 📱 Mobile Support

The dApp is fully responsive and works on:
- Desktop browsers
- Mobile browsers  
- Tablet devices

## 🚨 Testing Guide

### Local Testing
1. Deploy contract to Sui devnet
2. Copy package ID to the dApp
3. Connect Sui wallet with devnet SUI
4. Create a test raffle
5. Join with different accounts
6. Pick winner when ready

### Multi-Account Testing
1. Use multiple browser profiles
2. Or use different devices
3. Each needs Sui wallet with devnet SUI
4. Test the full raffle lifecycle

## 🔐 Security Notes

- **Wallet Connection**: Only connects to authorized Sui wallets
- **Transaction Signing**: All transactions require user approval
- **No Private Keys**: App never handles private keys directly
- **Client-Side Only**: No backend servers storing user data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Mysten Labs dApp Kit](https://github.com/MystenLabs/dapp-kit)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Notifications by [React Hot Toast](https://react-hot-toast.com/)

## 📞 Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/willwees/simple-raffle-sui/issues)
2. Create a new issue with detailed description
3. Include error messages and browser console logs

---

**Happy Raffling!** 🎉

To build your app for deployment you can run

```bash
pnpm build
```
