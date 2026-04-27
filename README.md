# ทานอะไรดี (Than a rai dee) — Night Market Edition

A production-quality React application rebuilt from the Night Market prototype. This app helps you decide what to cook based on what's in your fridge.

## 🏮 Features

- **Fridge Management**: Add/remove ingredients and see real-time recipe matches.
- **Match Engine**: Smart calculation of ingredient percentages for every dish.
- **Wok Randomizer**: A high-fidelity slot machine to help you choose when you're undecided.
- **Advanced Search**: Filter by dish type, calories, spice level, and cook time.
- **Local Cookbook**: Save your favorite recipes to your local storage.
- **Community Feed**: View trending dishes and community "remixes".
- **Admin Dashboard**: Visualized analytics for daily active cooks and dish trends.

## 🛠 Tech Stack

- **Vite + React + TypeScript**: Modern, fast development and type safety.
- **Tailwind CSS**: Custom "Night Market" theme with neon aesthetics and grain effects.
- **React Router**: Multi-page navigation with state persistence.
- **Framer Motion**: Smooth micro-animations and slot machine physics.
- **LocalStorage**: Zero-backend state persistence for your fridge and saved recipes.
- **@fontsource**: Self-hosted fonts for 100% offline capability.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
This will generate a `dist/` folder. Because of our `vite.config.ts` setup, you can open `dist/index.html` directly in your browser (no server required) or serve it with any local static server.

## 📁 Project Structure

- `src/components/`: Reusable UI elements and layout frames.
- `src/pages/`: Individual route components (Home, Fridge, RecipeDetail, etc.).
- `src/data/`: Typed TypeScript modules for ingredients, dishes, and social posts.
- `src/hooks/`: Custom hooks like `useLocalStorage`.
- `src/utils/`: Helper functions for match math.
- `src/index.css`: Global styles, Tailwind directives, and the "grain" design system.

## 📝 Note on Data
All data is stored locally in `src/data/` and user changes are saved to your browser's `localStorage`. No external APIs or databases are used.
