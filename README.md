# Full-Stack Developer Assessment: Team Task Manager with RBAC

**Candidate:** Ritesh  
**Assessment Title:** Full-Stack Developer Assessment – Build a Role-Based Access Control (RBAC) Application

---

## Project Overview
This is a **Team Task Manager** application designed to demonstrate the implementation of Role-Based Access Control (RBAC). 

The system allows team members to create, edit, view, and organize tasks based on their specific company roles:
*   **Admin**: Full system access. Can manage (create/list) users, create/edit/delete tasks, and assign tasks to anyone.
*   **Manager**: Can view all tasks, create tasks, edit tasks, and assign them to employees. Cannot delete tasks or access user management.
*   **Employee**: Can only view tasks assigned to them and update their status (TODO, IN_PROGRESS, DONE). All other fields are read-only.

---

## Technology Stack
*   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express, TypeScript.
*   **Database**: MongoDB Atlas (NoSQL) with Mongoose ORM.
*   **Authentication & Validation**: JSON Web Tokens (JWT), bcrypt for password hashing, and Zod for request body validation.

---

## Default Test Credentials
Use the pre-configured buttons on the login screen or enter these credentials manually to test the roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@taskmanager.local` | `password123` | Full access, user management, deletes tasks |
| **Manager** | `manager@taskmanager.local` | `password123` | Create, update, and assign tasks. No delete/users access. |
| **Employee 1** | `employee@taskmanager.local` | `password123` | View own tasks, update status only |
| **Employee 2** | `employee2@taskmanager.local` | `password123` | View own tasks, update status only |

---

## Deployment Links
*   **Frontend (Vercel)**: `https://braviching-assessment.vercel.app`
*   **Backend (Render)**: `https://braviching-assessment.onrender.com`

---

## Assumptions and Design Decisions

1.  **Strict Backend Security**: The frontend shows or hides buttons and inputs for UX convenience, but all authorization and role restrictions are strictly checked and enforced on the Node.js backend using custom middlewares (`authenticate` and `authorize`).
2.  **Hybrid Token Authentication**: Standard HTTP-only cookies are used for security. However, to handle modern browsers (Safari, Brave, and Incognito Chrome) that block third-party cross-site cookies by default, the app implements a localStorage header fallback. On login, the JWT is returned in the response body, saved in localStorage, and automatically attached as an `Authorization: Bearer <token>` header to all API requests.
3.  **Task Resource Ownership**: For safety, the GET single task details and PUT task updates endpoints verify resource ownership. An Employee trying to view or edit a task not assigned to them will be blocked by the backend with a `403 Forbidden` response.
4.  **Database Seeding**: A local database seeder script was created to quickly reset and populate the MongoDB database with standard test credentials.

---

## Setup and Installation Instructions

### Prerequisites
*   Node.js (v18+)
*   A running MongoDB instance (local or Atlas)

### Local Development

#### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` file based on the environment configurations:
   ```text
   PORT=5000
   MONGODB_URI=mongodb+srv://... (your MongoDB URL)
   JWT_SECRET=supersecretkey
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```
3. Run the database seed script to populate test data:
   ```bash
   npm run seed
   ```
4. Start the Express server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Create your `.env` file:
   ```text
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. Start the Next.js app:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Setup (Bonus)

To run the complete application inside Docker:

1.  Create a `.env` file in the **root** folder containing:
    ```text
    MONGODB_URI=mongodb+srv://... (your Atlas connection URL)
    JWT_SECRET=supersecretkey
    FRONTEND_URL=http://localhost:3000
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```
2.  Start the containers:
    ```bash
    docker compose up --build
    ```
3.  Stop the containers:
    ```bash
    docker compose down
    ```
