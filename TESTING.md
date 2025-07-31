# 🧪 Testing Guide for Simple Raffle dApp

This guide helps you test the raffle functionality step by step.

## 🚀 Quick Setup

1. **Start the dApp**
   ```bash
   cd simple-raffle-dapp
   bun dev
   ```
   Open http://localhost:5173

2. **Connect Sui Wallet**
   - Install Sui Wallet browser extension
   - Set it to devnet mode
   - Get devnet SUI from faucet: https://discord.gg/sui (use !faucet command)

3. **Set Package ID**
   - Copy your deployed package ID from commands.md
   - Paste it in the "Package Configuration" field: `0xac7aec8a42876bdde5fe440bc624a5458f322db3a66eb394ee67745ebc20c804`

## 🎯 Testing Scenarios

### Scenario 1: Single User Raffle Creation
1. Go to "Create Raffle" tab
2. Click "Create Raffle" button
3. Approve transaction in wallet
4. ✅ Should see success message with raffle ID
5. ✅ Copy raffle ID should work
6. ✅ Check "My Raffles" tab to see the created raffle

### Scenario 2: Multi-User Raffle Testing
1. **User A (Creator)**: Create a raffle, copy the ID
2. **User B (Player 1)**: 
   - Go to "Join Raffle" tab
   - Paste raffle ID, click "Load Raffle Info"
   - ✅ Should see raffle details (0 SUI prize, 0 participants)
   - Click "Join for 1.00 SUI"
   - Approve transaction
   - ✅ Should see updated participant count
3. **User C (Player 2)**: Repeat step 2
4. **User A (Creator)**: 
   - Go to "My Raffles" tab
   - ✅ Should see 2 participants, 2 SUI prize pool
   - Click "Pick Winner 🎲"
   - Approve transaction
   - ✅ Should see winner announcement with confetti

### Scenario 3: Event Monitoring Test
1. Create a raffle and note the current time
2. Join the raffle from another account
3. ✅ Within 5 seconds, the UI should update automatically
4. Pick a winner
5. ✅ Winner announcement should appear automatically

### Scenario 4: Error Handling Test
1. **Invalid Raffle ID**: Try joining with "0x123" 
   - ✅ Should show "Invalid raffle ID format"
2. **Pick Winner Too Early**: Try picking winner with 0-1 participants
   - ✅ Button should be disabled with "(Need 2+ players)"
3. **Insufficient Funds**: Try joining with less than 1 SUI
   - ✅ Wallet should show insufficient funds error

## 🔍 Debug Checklist

### If Create Raffle Fails:
- [ ] Wallet connected to devnet?
- [ ] Sufficient SUI for gas fees?
- [ ] Package ID is valid (64 chars, starts with 0x)?
- [ ] Check browser console for errors

### If Join Raffle Fails:
- [ ] Raffle ID is valid (64 chars, starts with 0x)?
- [ ] Raffle still open?
- [ ] Have at least 1 SUI + gas fees?
- [ ] Not trying to join your own raffle?

### If Pick Winner Fails:
- [ ] You are the raffle owner?
- [ ] At least 2 participants joined?
- [ ] Raffle still open?
- [ ] Sufficient gas fees?

## 📊 Expected Behavior

### Create Raffle
- **Input**: None required (uses gas coin automatically)
- **Cost**: Gas fees only (~0.001 SUI)
- **Output**: New raffle object created
- **UI**: Success toast + raffle ID + copy button

### Join Raffle  
- **Input**: Valid raffle ID
- **Cost**: 1 SUI entry fee + gas fees
- **Output**: Updated raffle with new participant
- **UI**: Updated participant count and prize pool

### Pick Winner
- **Input**: Raffle with 2+ participants
- **Cost**: Gas fees only
- **Output**: Winner selected, prize transferred
- **UI**: Winner announcement with confetti animation

## 🐛 Common Issues

### "Package not found" Error
- Double-check the package ID in commands.md
- Ensure contract is deployed to devnet
- Verify you're on the correct network

### "Insufficient funds" Error
- Get more devnet SUI from Discord faucet
- Need at least 1 SUI + gas fees (~ 1.01 SUI total)

### Events Not Updating
- Check browser console for errors
- Try refreshing the page
- Verify package ID is correct

### Wallet Connection Issues
- Try disconnecting and reconnecting wallet
- Clear browser cache
- Make sure wallet is on devnet

## 🎉 Success Indicators

✅ **Everything Working When You See:**
- Smooth wallet connection
- Raffle creation with valid ID
- Real-time participant updates
- Winner selection with celebration
- Copy-to-clipboard functionality
- Toast notifications for all actions
- Responsive design on mobile

## 🔧 Advanced Testing

### Load Testing
1. Create multiple raffles quickly
2. Join same raffle multiple times (should fail)
3. Try picking winner multiple times (should fail after first success)

### Network Switching
1. Test on devnet first
2. Deploy to testnet and update package ID
3. Verify all functions work on testnet

### Mobile Testing
1. Open on mobile browser
2. Test all functions with touch interface
3. Verify responsive design works

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12)
2. Verify wallet is connected to devnet
3. Ensure package ID matches your deployment
4. Try with a fresh browser session

**Happy Testing!** 🎲✨
