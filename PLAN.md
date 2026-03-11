# Plan: Rive Animation Testing Site

## Project Overview

**Goal:** Create a web application for testing and showcasing Rive animations.

**Stack:**
- **Framework:** Next.js 15 (App Router)
- **Rive:** @rive-app/react-webgl2
- **Deploy:** Vercel

---

## Development Stages

### Stage 1: Project Initialization
- [ ] Create Next.js project (`npx create-next-app@latest`)
- [ ] Install `@rive-app/react-webgl2`
- [ ] Configure TypeScript, ESLint, Tailwind CSS
- [ ] Prepare folder structure

### Stage 2: Basic Rive Integration
- [ ] Create client component for Rive (important: Rive uses WebGL, needs `"use client"`)
- [ ] Implement simple animation viewer with URL/file
- [ ] Add support for State Machines and Animations
- [ ] Handle SSR (dynamic import or lazy loading for Rive)

### Stage 3: Testing Features
- [ ] **Load animations:**
  - By URL (CDN, e.g. cdn.rive.app)
  - Upload .riv file from device
- [ ] **Playback control:**
  - Play / Pause
  - Scrub
  - Playback speed
- [ ] **State Machine parameters:**
  - Dynamic UI for inputs (Number, Boolean, Trigger)
  - List of available artboards and animations
- [ ] **Display settings:**
  - Fit (Contain, Cover, Fill, FitWidth, FitHeight)
  - Alignment
  - Canvas size

### Stage 4: UI and UX
- [ ] Home page with example list
- [ ] Testing page with control panel
- [ ] Responsive design
- [ ] Dark/light theme (optional)

### Stage 5: Deploy to Vercel
- [ ] Connect repository to Vercel
- [ ] Configure environment variables (if needed)
- [ ] Verify build and production run

---

## What We Need

### Dependencies (package.json)
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@rive-app/react-webgl2": "^4.27.0"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^22.x",
    "@types/react": "^19.x",
    "tailwindcss": "^3.x",
    "eslint": "^9.x"
  }
}
```

### Important Technical Notes

1. **Client Components:** Rive uses WebGL and DOM API — all components with Rive must be `"use client"`.

2. **WASM:** Rive loads WASM. To speed up:
   - Self-host WASM file in `/public`
   - Use preload (see [documentation](https://rive.app/docs/runtimes/web/preloading-wasm))

3. **Next.js + Rive:** Avoid SSR for Rive — use dynamic import with `ssr: false`:
   ```tsx
   const RiveComponent = dynamic(() => import('@/components/RiveViewer'), { ssr: false });
   ```

4. **Vercel:** Next.js works great on Vercel out of the box. No Rive limitations.

### Project Structure (proposed)
```
rive-pages/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Home
│   ├── test/
│   │   └── page.tsx           # Testing page
│   └── globals.css
├── components/
│   ├── RiveViewer.tsx         # Main viewer component
│   ├── RiveControls.tsx       # Control panel
│   └── AnimationPicker.tsx    # Animation picker/upload
├── public/
│   └── (example .riv files, optional)
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

### Animation Examples for Testing
- `https://cdn.rive.app/animations/vehicles.riv` — State Machine "bumpy"
- `https://cdn.rive.app/animations/off_road_car.riv`
- Your own .riv files from [Rive Community](https://rive.app/community/)

---

## Time Estimate
- Stage 1: ~15 min
- Stage 2: ~30 min  
- Stage 3: ~1–2 hours
- Stage 4: ~1 hour
- Stage 5: ~15 min

**Total:** ~3–4 hours for MVP

---

## Next Step
Start with Stage 1 — Next.js project initialization and dependency installation.
