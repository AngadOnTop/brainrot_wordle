<div align="center">

# Brainrot Wordle

Welcome to Brainrot Wordle! a fun little game I made for the Summer of Making projects, had to pick a lil topic as I only had like 3 weeks to finish it, will definitely be adding more functions and features to this game. I hope you guys like it and if you guys have some feedback I would love to hear it, `angadjotd@gmail.com` 

</div>

## ✨ Features

- **On-screen keyboard**: Tap-friendly input with live key coloring
- **Staggered flip reveal**: Satisfying animations on Enter
- **Keyboard shortcuts**: Type letters, Backspace, and Enter – just like Wordle
- **Mobile-friendly**: Fixed bottom keyboard and large touch targets

## 🎮 Demo

- Deployed on Netlify: `https://brainrotwordle.netlify.app/` 

If you see a Netlify 404 on navigation, ensure SPA redirects are configured (see Deployment).

## 🧱 Tech Stack

- React 19 + Vite 7
- Modern CSS (no UI framework)

## 🚀 Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/AngadOnTop/brainrot_wordle
cd brainrot-wordle
npm ci
```

Run in development with HMR:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 🧩 Gameplay

- You have 6 rows to guess the hidden phrase.
- Spaces in the phrase are shown as gaps; you only type letters.
- Colors after submit:
  - Green = correct letter and position
  - Yellow = letter exists elsewhere
  - Gray = not in the phrase

## ⌨️ Controls

- Type letters to fill your current guess
- Backspace to delete
- Enter to submit (locks the row and triggers the flip animation)
- Tap the on-screen keyboard to play on mobile

