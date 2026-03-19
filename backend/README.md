# VedaAI Backend

AI-powered assessment creator backend built with Node.js, Express, MongoDB, Redis, and BullMQ.

## Architecture

### Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache/Queue**: Redis + BullMQ
- **Real-time**: Socket.io
- **AI**: OpenAI GPT-4
- **PDF Generation**: Puppeteer

### System Flow
1. Client creates assignment via REST API
2. Assignment stored in MongoDB
3. Generation job added to BullMQ queue
4. Worker processes job using AI service
5. Real-time updates sent via WebSocket
6. Generated paper stored in database
7. PDF can be downloaded on demand

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas
- Redis running locally or cloud Redis

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379

OPENAI_API_KEY=your_openai_api_key

CORS_ORIGIN=http://localhost:3000
```

### Running the Application

Start the API server:
```bash
npm run dev
```

Start the worker process (in separate terminal):
```bash
npm run worker
```

For production:
```bash
npm run build
npm start
```

## API Endpoints

### Assignments

- `POST /api/assignments` - Create new assignment
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments/:id/generate` - Start question generation
- `GET /api/assignments/:id/status` - Get generation status
- `POST /api/assignments/:id/regenerate` - Regenerate questions
- `GET /api/assignments/:id/download` - Download PDF

### Health Check

- `GET /health` - Server health status

## WebSocket Events

### Client to Server
- `join-assignment` - Join assignment room for updates
- `leave-assignment` - Leave assignment room

### Server to Client
- `progress` - Generation progress updates
  ```json
  {
    "status": "processing|completed|failed",
    "progress": 0-100,
    "message": "Status message",
    "error": "Error message if failed"
  }
  ```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, Queue configs
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic (AI, PDF)
│   ├── workers/         # BullMQ workers
│   ├── types/           # TypeScript types
│   ├── utils/           # Validation, helpers
│   └── server.ts        # Main server file
├── package.json
└── tsconfig.json
```

## Features

- Assignment creation with validation
- AI-powered question generation
- Background job processing with BullMQ
- Real-time progress updates via WebSocket
- Redis caching for performance
- PDF export with professional formatting
- Question regeneration capability
- Difficulty level classification
- Section-based question organization
