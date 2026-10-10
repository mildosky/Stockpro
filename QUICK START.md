# StockPro - Quick Start Guide

## ✅ FIXED: Blank Page Issue

The blank page has been fixed! The issue was that the server file needed to use CommonJS syntax.

## 🚀 How to Run (3 Options)

### Option 1: EASIEST (Recommended)
**Just double-click: `start.bat`**

This will automatically:
- Build the app (if needed)
- Start the server
- Open your browser to http://localhost:3000

### Option 2: Manual Start
Open Command Prompt in this folder and run:
```
node server.cjs
```
Then open: http://localhost:3000

### Option 3: Direct Open
Open this file in your browser:
```
dist\index.html
```

## 📱 Install as Desktop App

Once running in Chrome/Edge:
1. Look for the **⊕ install icon** in the address bar
2. Click it and select "Install"
3. The app will run as a standalone desktop application with its own window

## 🎯 What's New

- ✅ Fixed blank page issue
- ✅ Renamed server.js → server.cjs (CommonJS compatibility)
- ✅ Added auto-open browser feature
- ✅ Simplified setup process
- ✅ Works offline after first load

## 📊 Features Available

- **Dashboard** - Real-time stats and charts
- **Products** - Manage items with categories, SKUs, barcodes
- **Inventory** - Track stock levels and movements
- **Point of Sale** - Quick checkout with multiple payment methods
- **Price Stickers** - Generate printable labels
- **Reports** - Detailed analytics and insights

## 💾 Data Storage

All data is stored locally in your browser's localStorage:
- No server database needed
- Works completely offline
- Data persists between sessions
- Private and secure

## 🆘 Troubleshooting

**Port 3000 already in use?**
- Edit `server.cjs` and change `PORT = 3000` to another number (e.g., 3001)

**Need to rebuild?**
- Delete the `dist` folder
- Run `start.bat` again

**Browser doesn't auto-open?**
- Manually open: http://localhost:3000

---

**Ready to go! Double-click `start.bat` and enjoy StockPro!** 🎉
