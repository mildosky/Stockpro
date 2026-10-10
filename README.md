# StockPro - Restaurant & Supermarket Management System

A comprehensive standalone desktop application for managing restaurants and supermarkets/minimarts.

## 🚀 Quick Start (Windows)

**Just double-click `start.bat`** - that's it!

The app will:
1. Build automatically (if needed)
2. Start a local server
3. Open in your browser automatically

## 📋 Manual Setup

If you prefer manual setup:

```bash
# Install dependencies (first time only)
npm install

# Build the app
npm run build

# Start the server
node server.cjs
```

Then open http://localhost:3000 in your browser.

## 📦 Features

### 📊 Dashboard
- Real-time business overview
- Revenue and profit charts
- Low stock alerts
- Recent sales tracking

### 📦 Products & Items
- Full product management (CRUD)
- Category organization
- SKU and barcode tracking
- Cost and selling price management
- Profit margin calculation

### 📈 Stock & Inventory
- Real-time stock level tracking
- Stock movement logging (in/out/adjustments)
- Price change history
- Low stock alerts
- Stock value calculation

### 🛒 Point of Sale (POS)
- Quick checkout interface
- Multiple payment methods (Cash/Card/Mobile)
- Automatic stock deduction
- Receipt generation
- Profit tracking per sale

### 🏷️ Price Stickers
- Generate printable price tags
- 3 styles: Standard, Compact, Detailed
- Barcode labels
- Batch printing

### 📋 Reports & Analytics
- Sales reports with date filtering
- Product performance analysis
- Profit & Loss statements
- Stock movement reports
- Revenue trends
- Payment method breakdown

## 💾 Data Storage

All data is stored locally in your browser's localStorage:
- ✅ No server required
- ✅ Works offline
- ✅ Data persists between sessions
- ✅ Private and secure

**Note:** Data is stored per browser. If you clear browser data, your records will be lost.

## 🖥️ Install as Desktop App (PWA)

To install as a standalone desktop application:

### Chrome/Edge:
1. Open the app in your browser
2. Click the install icon (⊕) in the address bar
3. Click "Install"

### Safari (Mac):
1. Open the app in Safari
2. File → Add to Dock

### Safari (iOS):
1. Open the app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

Once installed, it runs like a native desktop app with its own window and offline support!

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## 📁 Project Structure

```
stockpro/
├── src/
│   ├── components/       # React components
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── dist/                # Build output (generated)
├── server.cjs           # Node.js server
├── start.bat            # Windows launcher
└── package.json         # Dependencies
```

## 🔧 Troubleshooting

### Blank page after opening dist/index.html directly
The app needs to be served via HTTP. Use:
```bash
node server.js
```

### Port 3000 already in use
Edit `server.cjs` and change the PORT variable.

### Data not saving
Make sure your browser allows localStorage. Check browser settings.

### Build fails
Try:
```bash
rm -rf node_modules
npm install
npm run build
```

## 📝 Requirements

- Node.js 18+ (tested on 20.x)
- Modern web browser (Chrome, Edge, Firefox, Safari)

## 🎨 Business Modes

Switch between two modes:
- **Supermarket/Mini Mart** - Track physical products with stock levels
- **Restaurant** - Manage menu items (stock tracking disabled for prepared items)

## 💡 Tips

1. **Backup your data**: Export important reports regularly
2. **Low stock alerts**: Set minimum stock levels to get automatic alerts
3. **Price stickers**: Use the sticker generator for shelf labels
4. **Reports**: Check the Reports section for detailed analytics
5. **POS**: Use the Point of Sale for quick transactions

## 📄 License

This is a standalone application for business use.

## 🆘 Support

For issues or questions, check the troubleshooting section above.

---

**Made with ❤️ for restaurants and retailers**
