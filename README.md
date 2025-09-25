# Social Community Moderator & Content Curator

This project is a full-stack, AI-powered platform designed to automatically moderate community content. It uses the Google Gemini API to analyze user-submitted posts for rule violations in the background, flagging inappropriate content for human review in a real-time dashboard.

## ✨ Key Features

- **AI-Powered Moderation**: Utilizes the **Google Gemini API** to analyze text content for toxicity, spam, and rule violations.
- **Asynchronous Job Processing**: Employs **Redis** and **BullMQ** to process AI analysis jobs in the background, ensuring the user-facing API remains fast and responsive.
- **Real-Time Dashboard**: Features a moderator dashboard built with **React** and **Chakra UI** that updates instantly with newly flagged content via **WebSockets (Socket.IO)**.
- **Full Authentication**: Includes a complete authentication system with local (email/password) and **Google OAuth 2.0** login.
- **Modern Tech Stack**: Built with Node.js, Express, PostgreSQL, Prisma, React, and Vite for a robust and scalable application.
- **Fully Containerized**: The entire application stack (backend, worker, frontend, database, Redis) is containerized with **Docker** for easy setup and consistent deployments.

---

## 🛠️ Tech Stack

| Component               | Technology                               |
| :---------------------- | :--------------------------------------- |
| **Frontend**            | React, Vite, Chakra UI, Socket.IO Client |
| **Backend**             | Node.js, Express.js                      |
| **Database**            | PostgreSQL, Prisma ORM                   |
| **Real-time & Queuing** | Socket.IO, Redis, BullMQ                 |
| **AI**                  | Google Gemini API                        |
| **Authentication**      | JWT, Passport.js, Google OAuth 2.0       |
| **Containerization**    | Docker, Docker Compose                   |

---

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
- **Google OAuth 2.0 Credentials** (Client ID and Client Secret) from the [Google Cloud Console](https://console.cloud.google.com/).

### Installation & Setup

**1. Clone the repository:**

```bash
git clone https://github.com/abhishekkushwahaa/Social-Community-Moderator.git
cd Social-Community-Moderator
```

**2. Configure Backend Environment Variables:**

Navigate to the `backend` directory, create a new file named `.env`.

**File: `backend/.env`**

```
# PostgreSQL Connection
DATABASE_URL="postgresql://user:password@db:5432/mydb?schema=public"

# Authentication
JWT_SECRET="YOUR_STRONG_SECRET_KEY"

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# Google Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**3. Install Dependencies:**

Install the necessary `bun` packages for both the backend and frontend.

```bash
# Install backend dependencies
cd backend
bun install

# Install frontend dependencies
cd ../client
bun install
```

### Running the Application

From the **root directory** of the project, use Docker Compose to build and start all the services.

**1. Launch the Application:**

```bash
docker-compose up --build
```

**2. Run the Database Migration:**

Once the containers are running, open a **new terminal window** and execute the Prisma migration command to set up your database tables.

```bash
docker-compose exec api bunx prisma migrate dev --name init
```

You're all set\! The application is now running:

- **Frontend (React App):** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
- **Backend API Server:** [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001)
