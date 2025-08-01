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
- **Default Networks**: Devnet, Testnet, Mainnet support
- **Package IDs**: Environment-based configuration with automatic fallbacks

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

# Copy environment configuration
cp .env.example .env

# Update .env with your package ID (optional - has working defaults)
# VITE_SUI_NETWORK=testnet
# VITE_RAFFLE_PACKAGE_ID=your_package_id

# Start development server
bun dev
```

### Environment Configuration
The app supports multiple Sui networks with automatic package ID management:

```bash
# .env file
VITE_SUI_NETWORK=testnet  # Options: devnet, testnet, mainnet
VITE_RAFFLE_PACKAGE_ID=0xac7aec8a42876bdde5fe440bc624a5458f322db3a66eb394ee67745ebc20c804
```

**Network Support:**
- **Devnet**: Development and testing (automatic fallback)
- **Testnet**: More realistic testing environment (default)
- **Mainnet**: Production deployment

### Package Configuration
The app automatically handles package IDs for different networks:

1. **Environment Variables** (Recommended):
   - Copy `.env.example` to `.env`
   - Set your `VITE_SUI_NETWORK` and `VITE_RAFFLE_PACKAGE_ID`

2. **Automatic Fallback**:
   - Uses hardcoded package IDs in `networkConfig.ts` if environment variables are not set
   - Testnet: `0xac7aec8a42876bdde5fe440bc624a5458f322db3a66eb394ee67745ebc20c804`

3. **Custom Deployment**:
   - Deploy your smart contract to Sui
   - Update the package ID in `.env` or `networkConfig.ts`

## 🎯 How to Use

### For Raffle Creators
1. **Connect Wallet** - Connect your Sui wallet
2. **Create Raffle** - Click "Create Raffle" button in the Create tab
3. **Share Raffle ID** - Copy and share the raffle ID with participants  
4. **Pick Winner** - Once 2+ players join, click "Pick Winner" on your raffle card

### For Participants
1. **Connect Wallet** - Connect your Sui wallet with at least 1 SUI
2. **Browse Raffles** - View active raffles in the "View Raffles" tab
3. **Join Raffle** - Use "Join Raffle" tab to enter a raffle ID
4. **Pay Entry Fee** - Click "Join Raffle" and pay 1 SUI to participate
5. **Wait for Winner** - Wait for the raffle owner to pick a winner

## 🏗️ Project Structure

```
src/
├── components/
│   ├── CreateRaffleTab.tsx   # Create new raffles tab
│   ├── JoinRaffleTab.tsx     # Join existing raffles tab
│   ├── ViewRafflesTab.tsx    # View all raffles tab
│   ├── TabNavigation.tsx     # Tab switching navigation
│   ├── RaffleCard.tsx        # Individual raffle display
│   ├── WinnerAnnouncement.tsx # Winner celebration
│   └── WinnerNotification.tsx # Winner event notifications
├── hooks/
│   ├── useCreateRaffle.ts    # Create new raffles
│   ├── useJoinRaffle.ts      # Join existing raffles  
│   ├── usePickWinner.ts      # Pick raffle winners
│   ├── useRaffle.ts          # Single raffle data fetching
│   ├── useRaffleEvents.ts    # Real-time event listening
│   └── useRaffleList.ts      # List all raffles
├── utils/
│   ├── constants.ts          # Contract constants 
│   └── formatters.ts         # Utility functions
├── App.tsx                   # Main app component
├── RaffleInterface.tsx       # Main raffle interface
├── WalletStatus.tsx          # Wallet connection status
├── OwnedObjects.tsx          # User's owned objects
├── networkConfig.ts          # Network and package configuration
└── main.tsx                  # App entry point
```

## 🎨 UI Components

### Features
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Event-driven updates every 5 seconds
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: Success/error feedback
- **Copy to Clipboard**: Easy sharing of raffle IDs
- **Winner Celebrations**: Animated winner announcements
- **Tab Interface**: Clean tabbed navigation (Create/Join/View)
- **Event-Driven Refresh**: Automatic UI updates when winners are picked
- **Component Architecture**: Modular, reusable components

### Design System
- **Primary Color**: Blue (#3b82f6)
- **Success Color**: Green (#10b981)  
- **Error Color**: Red (#ef4444)
- **Typography**: Clean, readable fonts
- **Cards**: White background with subtle shadows

## 🏛️ Architecture

### Component Composition
The app uses a modular component architecture:

```
App (Main container)
└── RaffleInterface (Main orchestrator)
    ├── WinnerNotification (Event-driven winner display)
    ├── TabNavigation (Tab switching UI)
    ├── CreateRaffleTab (Raffle creation)
    ├── JoinRaffleTab (Join via raffle ID)
    └── ViewRafflesTab (Browse all raffles)
        └── RaffleCard (Individual raffle with actions)
```

### Event-Driven Updates
The app automatically refreshes when:
- New raffles are created
- Players join raffles  
- Winners are picked
- Uses `useRaffleEvents` hook for real-time blockchain event listening

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
- Notifications by [React Hot Toast](https://react-hot-toast.com/)
- Icons using emoji for consistency and simplicity

## 📞 Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/willwees/simple-raffle-sui-dapp/issues)
2. Create a new issue with detailed description
3. Include error messages and browser console logs

---

**Happy Raffling!** 🎉

To build your app for deployment you can run

```bash
pnpm build
```
