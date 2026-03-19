# VedaAI - AI Assessment Creator

Full-stack AI-powered assessment creator that generates structured question papers using GPT-4.

## Overview

VedaAI allows teachers to create assignments and automatically generate well-structured question papers with:
- Multiple sections (A, B, C, etc.)
- Mixed difficulty levels (Easy, Medium, Hard)
- Different question types (MCQ, Short, Long, True/False)
- Professional formatting
- PDF export capability

## Architecture

```
┌─────────────────┐
│   Next.js UI    │
│  (Zustand +     │
│   Socket.io)    │
└────────┬────────┘
         │
         ├─── HTTP API ────┐
         │                 │
         └─── WebSocket ───┤
                           │
                    ┌──────▼──────┐
                    │   Express   │
                    │   Server    │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ MongoDB │      │  Redis  │      │ BullMQ  │
    │         │      │ (Cache) │      │ Worker  │
    └─────────┘      └─────────┘      └────┬────┘
                                            │
                                       ┌────▼────┐
                                       │   AI    │
                                       │  (GPT)  │
                                       └─────────┘
```

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- Redis + BullMQ
- Socket.io
- OpenAI GPT-4
- Puppeteer (PDF generation)
- Zod (validation)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Zustand (state management)
- shadcn/ui + Tailwind CSS
- Socket.io-client
- Axios
- React Hook Form

## Features

### Core Features
- Assignment creation with validation
- AI-powered question generation
- Real-time progress updates via WebSocket
- Professional question paper display
- PDF export with proper formatting
- Question regeneration
- Redis caching for performance
- Background job processing with BullMQ

### UI Features
- Desktop sidebar navigation
- Mobile bottom navigation
- Empty states
- Search and filters
- Difficulty badges
- Loading states
- Responsive design

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd VedaAI
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create backend `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key
CORS_ORIGIN=http://localhost:3000
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

5. Create frontend `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Application

1. Start MongoDB and Redis (if running locally)

2. Start backend server:
```bash
cd backend
npm run dev
```

3. Start backend worker (in new terminal):
```bash
cd backend
npm run worker
```

4. Start frontend (in new terminal):
```bash
cd frontend
npm run dev
```

5. Open http://localhost:3000

## API Endpoints

### Assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments/:id/generate` - Start generation
- `GET /api/assignments/:id/status` - Get job status
- `POST /api/assignments/:id/regenerate` - Regenerate questions
- `GET /api/assignments/:id/download` - Download PDF

### WebSocket Events
- `join-assignment` - Join assignment room
- `leave-assignment` - Leave assignment room
- `progress` - Generation progress updates

## Project Structure

```
VedaAI/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Queue
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # AI, PDF services
│   │   ├── workers/         # BullMQ workers
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Validation, helpers
│   │   └── server.ts        # Main server
│   └── package.json
│
└── frontend/
    ├── app/                 # Next.js pages
    ├── components/          # React components
    ├── lib/                 # API, Socket clients
    ├── store/               # Zustand store
    ├── types/               # TypeScript types
    └── package.json
```

## Deployment

### Backend
Deploy to Railway, Render, or Fly.io:
1. Set environment variables
2. Connect MongoDB Atlas
3. Use Upstash Redis
4. Deploy

### Frontend
Deploy to Vercel:
```bash
cd frontend
vercel
```

Set `NEXT_PUBLIC_API_URL` in Vercel dashboard.

## License

MIT

## Author

Built for VedaAI Full Stack Engineering Assignment
