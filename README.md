# Social Community Moderator & Content Curator

This is a full-stack, AI-powered platform that helps automatically moderate user content in online communities. It uses the **Google Gemini API** to detect inappropriate posts in the background and lets moderators review flagged content in real-time.

## Key Features

- **AI Moderation:** Automatically checks posts for spam, toxicity, or rule violations using the Google Gemini API.
- **Real-Time Dashboard:** Moderators see flagged posts instantly with a **React** dashboard and **Socket.IO** updates.
- **Secure Login:** Supports email/password login and **OAuth 2.0**.
- **Modern Stack:** Built with Node.js, Express, PostgreSQL, Prisma, React, and Vite.
- **Containerized:** Everything runs in Docker for easy setup and consistent deployments.

## Tech Stack

| Component            | Technology                         |
| -------------------- | ---------------------------------- |
| Frontend             | React, Vite, Chakra UI, Socket.IO  |
| Backend              | Node.js, Express.js                |
| Database             | PostgreSQL, Prisma ORM             |
| Real-time & Queueing | Socket.IO                          |
| AI                   | Google Gemini API                  |
| Authentication       | JWT, Passport.js, Google OAuth 2.0 |
| Containerization     | Docker, Docker Compose             |

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js v18 or higher
- Docker and Docker Compose
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/abhishekkushwahaa/Social-Community-Moderator.git
cd Social-Community-Moderator
```

**2. Set up backend environment variables**

Create a `.env` file inside the `backend` folder:

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@db:5432/mydb?schema=public"

# JWT Secret
JWT_SECRET="YOUR_STRONG_SECRET_KEY"

# Google Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**3. Install dependencies**

```bash
# Backend
cd backend
bun install

# Frontend
cd frontend
bun install
```

### Running the App

**1. Start all services with Docker**

```bash
docker-compose up --build
```

**2. Set up the database**

In a new terminal window:

```bash
docker-compose exec api bunx prisma migrate dev --name init
```

### Access the App

- **Frontend (React App):** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)
