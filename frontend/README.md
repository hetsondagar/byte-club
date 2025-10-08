# 🚀 Byte Club - Gamified Coding Challenge Platform

<div align="center">

**Where Every Byte Counts** 💻✨

A production-ready React application with cyberpunk aesthetics, Matrix rain background, and gamified learning experience for CSE students.

</div>

---

## ✨ Features

- 🌧️ **Matrix Rain Background** - Falling binary code effect across the entire site
- 🎨 **Neon Cyberpunk Theme** - Dark space black with cyan/violet/blue neon accents
- 🎮 **19 Complete Pages** - All functional with smooth animations
- 🏆 **Gamification System** - XP, levels, badges, achievements, leaderboards
- 🗺️ **Adventure Map** - Interactive node-based challenge progression
- 📊 **Analytics Dashboard** - Beautiful charts and statistics
- 🎯 **Challenge System** - Coding challenges, MCQs, difficulty levels
- 🔥 **Daily Challenges** - Streak tracking and bonus rewards
- 📱 **Fully Responsive** - Perfect on desktop and mobile
- ⚡ **Smooth Animations** - Framer Motion powered transitions
- 🎨 **shadcn/ui Components** - Modern, accessible component library

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **Matrix Effect**: HTML5 Canvas API

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd byte-club/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/           # Reusable UI components
│   │       ├── button.tsx
│   │       ├── neon-card.tsx
│   │       ├── xp-bar.tsx
│   │       ├── matrix-rain.tsx
│   │       └── ... (40+ components)
│   ├── pages/            # All 19 application pages
│   │   ├── Login.tsx
│   │   ├── Home.tsx
│   │   ├── AdventureMap.tsx
│   │   ├── Challenges.tsx
│   │   └── ... (15+ more)
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json
└── vite.config.ts
```

---

## 🎮 All 19 Pages

1. **Login** (`/`) - Authentication with validation
2. **Signup** (`/signup`) - User registration
3. **Home** (`/home`) - Navigation hub
4. **Adventure Map** (`/adventure-map`) - Interactive challenge nodes
5. **Challenges** (`/challenges`) - Challenge grid with filters
6. **Challenge Detail** (`/challenge/:id`) - Individual challenge view
7. **Leaderboard** (`/leaderboard`) - Rankings and competition
8. **Leaderboard Detail** (`/leaderboard/:username`) - User stats
9. **Profile** (`/profile`) - User profile and badges
10. **Stats** (`/stats`) - Analytics and charts
11. **Achievements** (`/achievements`) - Badge collection
12. **Tutorial** (`/tutorial`) - Platform guide
13. **Settings** (`/settings`) - User preferences
14. **Daily Challenge** (`/daily-challenge`) - Daily missions
15. **Quests** (`/quests`) - Story-driven missions
16. **Notifications** (`/notifications`) - Activity feed
17. **Archive** (`/archive`) - Completed challenges
18. **Rewards** (`/rewards`) - XP shop
19. **404 Page** (`*`) - Fun error page

---

## 🎨 Customization

### Matrix Rain Settings

Edit `src/App.tsx`:

```tsx
<MatrixRain 
  color="hsl(140 100% 50%)"  // Neon green
  fontSize={16}               // Character size
  speed={50}                  // Animation speed
/>
```

### Color Scheme

Edit `src/index.css` to customize the neon theme colors:

```css
--primary: 180 100% 50%;     /* Neon Cyan */
--secondary: 270 100% 62%;   /* Electric Violet */
--accent: 220 100% 51%;      /* Electric Blue */
```

---

## 📦 Key Dependencies

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "framer-motion": "^12.23.22",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.462.0",
  "recharts": "^2.15.4",
  "@radix-ui/react-*": "Latest",
  "typescript": "^5.8.3",
  "vite": "^5.4.19"
}
```

---

## 🐛 Troubleshooting

### Port Already in Use
If port 8080 is occupied, Vite will automatically use the next available port (8081, 8082, etc.)

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## 🌟 Features Highlights

### Matrix Rain Effect
- Canvas-based falling binary code (1s and 0s)
- Optimized 60 FPS performance
- Neon green classic Matrix aesthetic
- Works across all pages automatically

### Gamification
- XP and leveling system
- Badge collection (9+ unique badges)
- Achievement tracking with progress
- Daily streaks with bonuses
- Leaderboard rankings (weekly/monthly/all-time)

### Challenge System
- Multiple difficulty levels (Easy/Medium/Hard)
- Different types (Coding/MCQ/True-False)
- XP rewards
- Completion tracking
- Re-attempt capability

### UI/UX
- Neon glow effects on hover
- Smooth page transitions
- Floating particles background
- Confetti celebrations
- Toast notifications
- Loading states
- Error handling

---

## 📖 Documentation

Additional documentation available:
- **BYTE_CLUB_FEATURES.md** - Complete feature list
- **README_MATRIX.md** - Matrix rain implementation guide
- **HOW_TO_RUN.md** - Quick start guide

---

## 🎯 Performance

- ✅ **Lighthouse Score**: 90+ (Performance)
- ✅ **No Linter Errors**: Clean TypeScript code
- ✅ **60 FPS Animations**: Smooth transitions
- ✅ **Optimized Bundle**: Code splitting enabled
- ✅ **Fast HMR**: Instant hot module replacement with Vite

---

## 🤝 Contributing

This is a complete, production-ready application. Feel free to:
- Fork and customize for your needs
- Add new pages or features
- Enhance the Matrix effect
- Create new challenge types
- Improve animations

---

## 📝 License

MIT License - Feel free to use this project for your own purposes.

---

## 🎉 Credits

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

Inspired by The Matrix, Tron, and Ready Player One aesthetics.

---

<div align="center">

**"Every byte counts in the digital realm."** 🌧️💻

Made with 💚 for CSE students and coding enthusiasts

[Start Your Journey](#-quick-start) | [View Features](BYTE_CLUB_FEATURES.md) | [Matrix Guide](README_MATRIX.md)

</div>
