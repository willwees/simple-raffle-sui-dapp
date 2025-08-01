# 🎲 Simple Raffle dApp - Beginner's Guide

A clean, educational blockchain raffle application built on the Sui network using React and TypeScript.

## 🎯 What This App Does

This is a **decentralized raffle application** where users can:

1. **Create Raffles** - Set entry fee and duration
2. **Join Raffles** - Pay entry fee to participate  
3. **View Raffles** - See all active raffles and their status

## 📚 Learning React Through This Project

This project is perfect for understanding React concepts:

### 🧱 **Components** (UI Building Blocks)
- `SimpleApp.tsx` - Main app layout
- `SimpleRaffleInterface.tsx` - Core raffle functionality
- `WalletStatus.tsx` - Shows wallet connection status

### 📊 **State Management** (Data That Changes)
```typescript
const [activeTab, setActiveTab] = useState('view'); // Which tab is active
const [entryFee, setEntryFee] = useState('');       // Form input values
const [raffles, setRaffles] = useState([]);         // List of raffles
```

### 🎣 **Custom Hooks** (Reusable Logic)
- `useCreateRaffle()` - Handles creating new raffles
- `useJoinRaffle()` - Handles joining existing raffles  
- `useRaffleList()` - Fetches and manages raffle data

### 🔄 **Effects** (Side Effects)
```typescript
useEffect(() => {
  fetchRaffles(); // Fetch data when component loads
}, []);
```

## 📁 Project Structure (Simplified)

```
src/
├── SimpleApp.tsx                 # 🏠 Main app component
├── SimpleRaffleInterface.tsx     # 🎮 Core raffle interface
├── WalletStatus.tsx             # 👛 Wallet connection status
├── hooks/                       # 🎣 Custom React hooks
│   ├── useCreateRaffle.ts       #   - Create new raffles
│   ├── useJoinRaffle.ts         #   - Join existing raffles
│   └── useRaffleList.ts         #   - Fetch raffle data
└── utils/                       # 🛠️ Helper functions
    ├── constants.ts             #   - Contract addresses, config
    └── formatters.ts            #   - Format addresses, numbers
```

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

2. **Start development server:**
   ```bash
   bun dev
   # or
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 🎮 How to Use the App

### 1. **Connect Wallet**
- Click "Connect Wallet" button
- Choose your Sui wallet (like Sui Wallet or Martian)
- Approve the connection

### 2. **View Raffles**
- Default tab shows all active raffles
- See entry fees, prize pools, and participant counts
- Click "🔄 Refresh" to update data

### 3. **Create a Raffle**
- Click "➕ Create Raffle" tab
- Enter entry fee (e.g., 0.1 SUI)
- Enter duration in hours (e.g., 24)
- Click "🎲 Create Raffle"

### 4. **Join a Raffle**
- Click "🎫 Join Raffle" tab
- Enter the raffle ID you want to join
- Click "🎫 Join Raffle" and pay the entry fee

## 🧠 React Concepts Explained

### **Props** - Passing Data Down
```typescript
// Parent passes data to child
<RaffleCard raffle={raffleData} />

// Child receives data
function RaffleCard({ raffle }) {
  return <div>{raffle.entryFee}</div>;
}
```

### **State** - Managing Changing Data
```typescript
// Create state variable
const [count, setCount] = useState(0);

// Update state
setCount(count + 1);
```

### **Custom Hooks** - Reusable Logic
```typescript
// Custom hook (starts with "use")
function useCreateRaffle() {
  const [isLoading, setIsLoading] = useState(false);
  
  const createRaffle = async (data) => {
    setIsLoading(true);
    // ... blockchain logic
    setIsLoading(false);
  };
  
  return { createRaffle, isLoading };
}

// Use in component
const { createRaffle, isLoading } = useCreateRaffle();
```

### **Conditional Rendering** - Show Different Content
```typescript
{isLoading ? (
  <div>Loading...</div>
) : (
  <div>Content loaded!</div>
)}
```

## 🔗 Blockchain Integration

### **Smart Contract Calls**
```typescript
// Create transaction
const tx = new Transaction();

// Call smart contract function
tx.moveCall({
  package: RAFFLE_PACKAGE_ID,
  module: 'simple_raffle',
  function: 'create_raffle',
  arguments: [entryFee, duration],
});

// Sign and execute
await signAndExecuteTransaction({ transaction: tx });
```

### **Reading Blockchain Data**
```typescript
// Query events to find raffles
const events = await suiClient.queryEvents({
  query: { MoveEventType: `${PACKAGE_ID}::simple_raffle::RaffleCreated` }
});
```

## 🎨 Styling

This project uses:
- **Radix UI** - Pre-built accessible components
- **Tailwind CSS** - Utility-first styling
- **CSS Grid/Flexbox** - Layout

## 🚧 Current Limitations

1. **Mock Data** - Uses placeholder raffle data for demonstration
2. **Event Parsing** - Simplified event handling
3. **Error Handling** - Basic error messages

## 📖 Next Steps for Learning

1. **Add Real Data** - Implement proper event parsing
2. **Add Features** - Winner selection, raffle history
3. **Improve UI** - Better loading states, animations
4. **Testing** - Add unit tests for components and hooks

## 🤝 Contributing

This is an educational project! Feel free to:
- Add features
- Improve documentation  
- Fix bugs
- Add tests

---

**Happy Learning! 🎉**

This project demonstrates core React concepts while building a real blockchain application. Start by reading the code, making small changes, and gradually understanding how everything connects together.
