# VedaAI

> AI-powered question paper generator for educators

Create professional, curriculum-aligned question papers in minutes. VedaAI uses GPT-4 to generate diverse questions across multiple difficulty levels, organize them into proper sections, and export to PDF - all with real-time progress updates.

## Architecture

```
Next.js Frontend (React + TypeScript + Tailwind)
         │
         ├─── HTTP API ────────┐
         └─── WebSocket ───────┤
                               │
                    Express Backend
                               │
         ┌─────────────────────┼──────────────┐
         │                     │              │
    MongoDB              Redis Cache    BullMQ Queue
                                              │
                                         AI Worker
                                        (Deepseek API)
```

**Flow:** Create assignment → Queue job → AI generates questions → Real-time updates → PDF export

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Socket.io  
**Backend:** Node.js, Express, MongoDB, Redis, BullMQ, GPT-4, Puppeteer

## Features

- Multiple question types (MCQ, Short, Long, True/False)
- Difficulty levels (Easy, Medium, Hard)
- Real-time generation progress
- Professional PDF export
- Question regeneration
- Responsive design

## Setup

**Prerequisites:** Node.js 18+, MongoDB, Redis, OpenAI API key

**1. Clone & Install**
```bash
git clone https://github.com/yourusername/VedaAI.git
cd VedaAI
cd backend && npm install
cd ../frontend && npm install
```

**2. Environment Variables**

Backend `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=your_api_key
CORS_ORIGIN=http://localhost:3000
```

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**3. Run (3 terminals)**
```bash
cd backend && npm run dev        # Terminal 1
cd backend && npm run worker     # Terminal 2
cd frontend && npm run dev       # Terminal 3
```

Open `http://localhost:3000`

## API Endpoints

- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List all
- `GET /api/assignments/:id` - Get details
- `POST /api/assignments/:id/generate` - Start generation

- `GET /api/assignments/:id/download` - Download PDF
- `POST /api/assignments/upload` - Upload document

**WebSocket:** Real-time progress updates via Socket.io

## Deployment

**Backend:** Railway/Render/Fly.io with MongoDB Atlas + Upstash Redis  
**Frontend:** Vercel (`vercel deploy`)

