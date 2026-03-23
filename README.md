# Afterglow Movie Research Platform

Afterglow is a production-oriented movie research and recommendation platform built with React, Tailwind CSS, React Query, React Three Fiber, Framer Motion, Recharts, and an Express API scaffold.

## Live Link 
https://movie-research-app.vercel.app/

## What is included

- 3D movie carousel with floating posters
- 3D movie galaxy exploration view
- Framer Motion page and modal transitions
- Glassmorphism + neumorphism design system
- Dynamic cinematic background driven by the featured movie
- Smart search with typo-tolerant "Did you mean?"
- Voice search with Web Speech API
- Real-time TMDB lanes for Trending, Now Playing, and Upcoming
- Browser notifications for new releases
- Real-time watch party rooms with synchronized trailer playback, live chat, host controls, reactions, and presence
- Hybrid recommendation engine scaffold
- Explainable AI panel with pros/cons review summaries
- Similar taste users panel
- Profile/watchlist/social-sharing API scaffolding
- Radar-chart movie comparison
- Analytics dashboard with Recharts
- PWA support via `vite-plugin-pwa`
- Docker and GitHub Actions CI scaffolding

## Architecture

### Frontend

- `src/App.jsx`: app shell and route entry
- `src/pages/HomePage.jsx`: top-level page
- `src/pages/WatchPartyPage.jsx`: watch party lobby and live room route
- `src/components/home/*`: product experience modules
- `src/components/watch-party/*`: watch party lobby, room, video player, chat, and presence UI
- `src/components/three/*`: React Three Fiber scenes
- `src/context/AppContext.jsx`: global UI, profile, interaction, and local persistence state
- `src/context/WatchPartyContext.jsx`: socket lifecycle, room state, synced playback, and chat presence state
- `src/hooks/useMovieData.js`: React Query powered TMDB data layer
- `src/services/*`: TMDB, auth, search, sentiment, recommendation, and watch party services
- `src/utils/*`: storage and movie helpers

### Backend

- `server/index.js`: Express API plus Socket.io room management, in-memory playback state, chat history, host transfer, reactions, and sync events
- `server/.env.example`: backend environment contract

## Setup

### Frontend

```bash
npm install
copy .env.example .env
npm run dev
```

Required:

- `VITE_TMDB_API_KEY`

Optional:

- `VITE_API_URL`
- `VITE_API_ORIGIN`
- `VITE_NLP_API_URL`
- `VITE_RECOMMENDER_API_URL`
- `VITE_NOTIFICATION_POLL_INTERVAL_MS`

### Backend

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Optional backend environment values for the watch party flow:

- `PORT=8787`
- `PUBLIC_APP_URL=http://localhost:5173`
- `CORS_ORIGIN=http://localhost:5173`

## Watch Party flow

1. Open `/watch-party`
2. Pick a movie trailer and create a room
3. Share the generated room link
4. The first viewer becomes host and controls play, pause, seek, and movie changes
5. Everyone else follows the host state, joins the live chat, and appears in the presence list

Socket events implemented:

- `join-room`
- `leave-room`
- `play`
- `pause`
- `seek`
- `sync-state`
- `chat-message`
- `user-joined`
- `user-left`
- `typing-status`
- `transfer-host`
- `select-movie`
- `reaction`

## Deployment

### Docker

```bash
docker compose up --build
```

### Suggested hosting

- Frontend: Vercel or Netlify
- Backend: Render, AWS App Runner, or ECS/Fargate
- Cache/queue in production: Redis + BullMQ or managed equivalents
- Monitoring: Winston logs to a log drain; Grafana/Prometheus optional

## Production notes

- Move TMDB access behind the backend before shipping to avoid exposing secrets client-side.
- Replace the recommendation stub with a real candidate generation and reranking pipeline.
- Replace the in-memory cache and queue with Redis/BullMQ.
- Replace the in-memory watch party room store with Redis pub/sub or a durable state layer before multi-instance deployment.
- Add persistent user storage for auth, public/private watchlists, and shareable list ownership.
- Add SSR or migrate to Next.js if SEO-heavy landing pages are a priority.
