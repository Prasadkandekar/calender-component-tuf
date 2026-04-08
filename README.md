# Wall Calendar — 3D Interactive Calendar Component

A wall-mounted calendar built with Next.js, React 19, and TypeScript. Features a realistic 3D page-flip animation, per-date notes, monthly goals, and date range selection — all persisted in the browser with no backend required.

---

## Links

| | |
|---|---|
| **Live Demo** | [calender-component-tuf.vercel.app](https://calender-component-tuf.vercel.app/) |
| **Video Walkthrough** | [youtu.be/jRN_1Is9CvE](https://youtu.be/jRN_1Is9CvE) |
| **Source Code** | [github.com/Prasadkandekar/calender-component-tuf](https://github.com/Prasadkandekar/calender-component-tuf) |

---

## Features

- **3D page flip** — smooth 1400ms `rotateX` animation with paper-flip sound, triggered by dragging the notes panel, scrolling, or the nav buttons
- **Per-date notes** — click any date to open a note editor; dates with notes show a visual indicator and hover preview
- **Monthly goals** — a persistent notepad panel alongside the calendar grid
- **Date range selection** — shift-click a start and end date; the range highlights in blue
- **Date navigation** — click the month/year title to jump to any date via the date selector
- **Responsive layout** — stacks vertically on mobile, side-by-side on desktop
- **No backend** — all data lives in a module-level in-memory store (easily swappable for `localStorage` or a database)

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | File-based routing, SSR-ready, fast dev experience |
| UI | React 19 + TypeScript | Concurrent features, full type safety |
| Styling | Tailwind CSS 4 | Utility-first, no separate CSS files to maintain |
| Components | shadcn/ui (Radix primitives) | Accessible, unstyled base components |
| Date logic | date-fns 4 | Lightweight, tree-shakeable, immutable date utilities |
| Icons | lucide-react | Consistent, minimal icon set |
| Animation | CSS 3D transforms + `requestAnimationFrame` | Native GPU-accelerated, no animation library needed |
| State | Module-level store + React `useState` | Lightweight pub/sub — survives component remounts without a Context provider |

### Key design decisions

**Why a module-level store instead of Context or Zustand?**
The calendar grid remounts on every page flip because it's passed as a JSX prop to the flip container. A React Context would require wrapping the entire tree; a module-level store with a simple pub/sub pattern achieves the same result with zero boilerplate and no provider nesting.

**Why `requestAnimationFrame` for the flip instead of CSS transitions?**
The flip needs to swap front/back page content at exactly 60% progress (not 50%) to feel natural. A JS-driven animation loop gives precise control over that timing — something a pure CSS transition cannot do.

**Why React Portals for the note modal?**
The calendar frame uses `perspective` and `transformStyle: preserve-3d`. Any `position: fixed` child inside a 3D transform context is positioned relative to that transformed ancestor rather than the viewport, which breaks click hit-testing. Portaling the modal to `document.body` escapes the transform stacking context entirely.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Install and run

```bash
# Clone the repo
git clone https://github.com/Prasadkandekar/calender-component-tuf.git
cd calender-component-tuf

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npx vercel
```

---

## Project Structure

```
app/
  page.tsx                  # Entry point
  layout.tsx                # Root layout
components/
  wall-calendar.tsx         # Main shell — flip state, navigation, layout
  page-flip-3d.tsx          # 3D flip animation engine
  calendar-month.tsx        # Grid, date cells, note modal
  date-selector.tsx         # Month/year/day picker modal
  monthly-notes-panel.tsx   # Monthly goals panel
hooks/
  use-calendar-data.ts      # Module-level store (notes, date range, selected date)
lib/
  calendar-utils.ts         # Header image mapping per month
  utils.ts                  # cn() helper
public/
  headers/                  # Per-month header images
```

---

## Usage

| Action | How |
|---|---|
| Flip to next month | Drag the notes panel upward, scroll down, or click the bottom nav button |
| Flip to previous month | Drag the notes panel downward, scroll up, or click the top nav button |
| Add a note to a date | Click any date cell |
| Write monthly goals | Type in the yellow panel on the right |
| Select a date range | Shift-click a start date, then shift-click an end date |
| Jump to a specific date | Click the month/year title |

---

## Browser Support

Chrome 88+, Firefox 87+, Safari 14+, Edge 88+, iOS Safari 14+, Android Chrome 88+
