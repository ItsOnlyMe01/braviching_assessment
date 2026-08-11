# Team Task Manager with RBAC

A simple full-stack task management application demonstrating Role-Based Access Control (RBAC) with three distinct roles (Admin, Manager, Employee).

## Deployment Links
*   **Frontend**: https://braviching-assessment.vercel.app
*   **Backend**: https://braviching-assessment.onrender.com

## Technology Stack
*   **Frontend**: Next.js 14, Tailwind CSS
*   **Backend**: Node.js, Express, TypeScript
*   **Database**: MongoDB Atlas (Mongoose ORM)
*   **Auth & Validation**: JWT, bcrypt, Zod

## Default Test Credentials
*   **Admin**: `admin@taskmanager.local` / `password123`
*   **Manager**: `manager@taskmanager.local` / `password123`
*   **Employee 1**: `employee@taskmanager.local` / `password123`
*   **Employee 2**: `employee2@taskmanager.local` / `password123`

## Setup and Installation

### 1. Backend Setup
1. Go to the `backend` folder and create a `.env` file:
   ```text
   PORT=5000
   MONGODB_URI=mongodb+srv://... (your MongoDB Atlas URL)
   JWT_SECRET=supersecretkey
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```
2. Install dependencies and seed the database:
   ```bash
   npm install
   npm run seed
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Go to the `frontend` folder and create a `.env` file:
   ```text
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
2. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

## Docker Setup (Optional)
Run both services together locally:
```bash
docker compose up --build
```
*(Requires a root `.env` file configured with the same variables).*

## Assumptions & Design Decisions
*   **Backend Security**: Role checks and task ownership are strictly checked on the backend using Express middleware.
*   **Auth Fallback**: JWT tokens are sent via cookies, with a localStorage header fallback to handle browsers that block third-party cookies by default.
