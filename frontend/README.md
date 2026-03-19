# VedaAI Frontend

AI-powered assessment creator frontend built with Next.js 14, TypeScript, Zustand, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **UI Components**: shadcn/ui + Tailwind CSS
- **Real-time**: Socket.io-client
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

## Features

- Assignment creation with dynamic question type management
- Real-time AI question generation with WebSocket progress updates
- Professional question paper display with difficulty badges
- PDF download functionality
- Mobile-responsive design
- Assignment list with search and filters
- Regeneration capability

## Setup

### Prerequisites

- Node.js 18+
- Backend server running (see backend README)

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Application

Development:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── assignments/        # Assignment list and detail pages
│   ├── create/            # Assignment creation page
│   ├── groups/            # Groups page
│   ├── toolkit/           # AI Toolkit page
│   ├── library/           # Library page
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── Sidebar.tsx        # Desktop sidebar navigation
│   ├── MobileNav.tsx      # Mobile bottom navigation
│   ├── Header.tsx         # Page header
│   └── EmptyState.tsx     # Empty state component
├── lib/
│   ├── api.ts             # API client
│   ├── socket.ts          # WebSocket client
│   └── utils.ts           # Utility functions
├── store/
│   └── useAssignmentStore.ts  # Zustand store
└── types/
    └── index.ts           # TypeScript types
```

## Key Pages

### Assignments List (`/assignments`)
- View all created assignments
- Search and filter assignments
- Create new assignments
- Empty state for first-time users

### Create Assignment (`/create`)
- Multi-step form for assignment creation
- File upload support
- Dynamic question type rows
- Real-time total calculation
- Due date picker

### Assignment Detail (`/assignments/[id]`)
- Real-time generation progress
- Professional question paper display
- Student info fields
- Section-based organization
- Difficulty badges (Easy/Medium/Hard)
- PDF download
- Regenerate functionality

## WebSocket Integration

The app connects to the backend WebSocket server for real-time updates:

- Automatic connection on assignment detail page
- Join assignment room for updates
- Progress events with status and percentage
- Automatic UI updates on completion

## Responsive Design

- Desktop: Sidebar navigation with full layout
- Mobile: Bottom tab navigation with hamburger menu
- Optimized for all screen sizes
- Touch-friendly interactions

## Deploy on Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your backend API URL
