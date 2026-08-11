# Team Task Manager with RBAC

A clean, minimal, and secure Team Task Management application implementing Role-Based Access Control (RBAC).

## Architecture

This application consists of two main components:
1. **Backend**: A Node.js + Express API server (`/backend`) connecting to MongoDB using Mongoose. Authentication is managed using JSON Web Tokens (JWT) stored in secure, HTTP-only cookies. Authorizations (RBAC) are verified on the backend using express middleware. Incoming requests are validated using Zod.
2. **Frontend**: A Next.js App Router application (`/frontend`) styled with Tailwind CSS. Navigation elements, status operations, and administrative pages render conditionally according to the user's role.

---

## Role-Based Access Control (RBAC) Matrix

| Permission / Action | ADMIN | MANAGER | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| **User Management (Create/Read Users)** | Yes | No | No |
| **Create Tasks** | Yes | Yes | No |
| **Assign Tasks** | Yes | Yes | No |
| **View All Tasks** | Yes | Yes | Only assigned to self |
| **Edit All Task Fields** | Yes | Yes | No |
| **Update Assigned Task Status** | Yes | Yes | Yes |
| **Delete Tasks** | Yes | No | No |

---

## Test Credentials

For quick local testing and evaluation, use the following pre-configured credentials (seeded via the development seed script):

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@taskmanager.local` | `password123` |
| **MANAGER** | `manager@taskmanager.local` | `password123` |
| **EMPLOYEE (Assignee 1)** | `employee@taskmanager.local` | `password123` |
| **EMPLOYEE (Assignee 2)** | `employee2@taskmanager.local` | `password123` |

---

## Local Setup & Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or above recommended)
- A running MongoDB instance (either local or a MongoDB Atlas connection string)

### Running Locally (Without Docker)

#### 1. Backend Configuration & Running
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Set up your environment variables by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Run the seed script to populate test users and sample tasks:
   ```bash
   npm run seed
   ```
4. Start the backend in development mode:
   ```bash
   npm run dev
   ```

#### 2. Frontend Configuration & Running
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start the frontend in development mode:
   ```bash
   npm run dev
   ```

---

## Running with Docker Compose

This project includes multi-stage Docker builds and a Compose configuration to package and run the frontend and backend locally together.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with Docker Compose installed.

### Configuration

Create a `.env` file in the **root** folder (next to `docker-compose.yml`) containing the required variables:
```text
MONGODB_URI=mongodb+srv://... (your MongoDB Atlas connection string)
JWT_SECRET=supersecretkeyreplaceinproduction
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Commands

1. **Build and start the containers**:
   ```bash
   docker compose up --build
   ```
   *The backend will run on port `5000` and the frontend will run on port `3000`.*

2. **Stop the containers**:
   ```bash
   docker compose down
   ```
