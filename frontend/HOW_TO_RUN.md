# 🚀 How to Run Byte Club

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

#### On Windows PowerShell:
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

#### On Mac/Linux Terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### Access the Application
Once the server starts, open your browser and navigate to:
```
http://localhost:5173
```

## 🎯 What You'll See

### Matrix Rain Background
- **Falling binary code** (1s and 0s) across the entire screen
- **Neon green color** matching the Matrix aesthetic
- **Subtle and non-intrusive** - set to 15% opacity
- **Continuous animation** on all 19 pages

### Features to Test

1. **Login Page** (`/`)
   - Test the Matrix rain in the background
   - Login with any username/password

2. **Home Page** (`/home`)
   - See the Matrix effect behind navigation cards
   - Notice how it doesn't interfere with UI elements

3. **Adventure Map** (`/adventure-map`)
   - Interactive nodes with Matrix rain background
   - Perfect cyberpunk atmosphere

4. **All Other Pages**
   - Matrix rain is consistent across all 19 pages
   - Enhances the hacker/digital realm theme

## 🎨 Customization

Want to change the Matrix effect? Edit `frontend/src/App.tsx`:

```tsx
// Change color from green to cyan
<MatrixRain color="hsl(180 100% 50%)" fontSize={16} speed={50} />

// Make it faster
<MatrixRain color="hsl(140 100% 50%)" fontSize={16} speed={30} />

// Make characters larger
<MatrixRain color="hsl(140 100% 50%)" fontSize={20} speed={50} />
```

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is busy:
```powershell
# Kill the process or Vite will automatically use next available port
# Usually it will try 5174, 5175, etc.
```

### Dependencies Issues
```powershell
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Build for Production
```powershell
npm run build
npm run preview
```

## 📦 Tech Stack
- **React 18** + **Vite** (Fast!)
- **TypeScript** (Type-safe)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Canvas API** (Matrix Rain)
- **shadcn/ui** (Components)

## 🎮 Navigation

All pages are accessible from the home page after login:
- Adventure Map
- Challenges
- Leaderboard
- Profile
- Stats
- Achievements
- Tutorial
- Settings
- Daily Challenge
- Quests
- Notifications
- Archive
- Rewards

## 🔥 Pro Tips

1. **Full Screen**: Press F11 for immersive experience
2. **Dev Tools**: Press F12 to inspect the Matrix canvas
3. **Performance**: Check FPS in dev tools (should be ~60 FPS)
4. **Responsive**: Resize window to see Matrix adapt

## 🌟 Enjoy the Digital Realm!

**"Every byte counts. Welcome to the Matrix."** 🌧️💚

