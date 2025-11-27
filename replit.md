# TaskEmployeeFlow - Task Management System

## Overview
TaskEmployeeFlow is a comprehensive task management system with role-based access control for managers and employees. It features task assignment, employee management, and a complaint system.

## Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   │   ├── manager/  # Manager-only pages
│   │   │   └── employee/ # Employee-only pages
│   │   ├── lib/          # Utilities and context
│   │   └── hooks/        # Custom React hooks
├── server/               # Express backend
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
└── shared/               # Shared types and schemas
    └── schema.ts         # Drizzle ORM schemas
```

## User Roles

### Manager
- Access to manager dashboard
- Create, edit, delete tasks
- Add employees and view their credentials
- View and manage complaints

### Employee
- Access to employee dashboard
- View and update assigned tasks
- Submit complaints
- Cannot access manager features

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- POST /api/auth/logout - Logout user

### Tasks
- GET /api/tasks - Get all tasks (manager only)
- GET /api/my-tasks - Get assigned tasks (employee)
- POST /api/tasks - Create task (manager only)
- PATCH /api/tasks/:id - Update task status
- DELETE /api/tasks/:id - Delete task (manager only)

### Employees
- GET /api/employees - Get all employees (manager only)
- POST /api/employees - Add new employee (manager only)

### Complaints
- GET /api/complaints - Get complaints
- GET /api/my-complaints - Get employee's complaints
- POST /api/complaints - Submit complaint
- PATCH /api/complaints/:id - Update complaint status (manager only)

## Database Schema

### Users
- id (UUID)
- name
- email (unique)
- password (hashed)
- role (manager/employee)
- createdAt

### Tasks
- id (UUID)
- title
- description
- link (optional)
- status (pending/in_progress/completed)
- assignedTo (user reference)
- createdBy (user reference)
- createdAt

### Complaints
- id (UUID)
- title
- description
- status (open/in_review/resolved)
- employeeId (user reference)
- createdAt

## Development

### Running the app
The application runs on port 5000 using the "Start application" workflow.

### Database
Using PostgreSQL with Drizzle ORM. Run `npm run db:push` to sync schema changes.

## Deployment to Render

### Prerequisites
1. A Render account
2. A PostgreSQL database on Render

### Steps to Deploy

1. **Create PostgreSQL Database on Render:**
   - Go to Render Dashboard → New → PostgreSQL
   - Choose a name (e.g., "taskemployeeflow-db") and region
   - Select the Free tier or your preferred plan
   - Click "Create Database"
   - Wait for the database to be provisioned
   - Copy the "External Database URL" from the database info page

2. **Prepare Your Repository:**
   - Push your code to GitHub/GitLab
   - Ensure `package.json` has these scripts:
     ```json
     "build": "npm run build:client && npm run build:server",
     "build:client": "vite build",
     "build:server": "esbuild server/index.ts --bundle --platform=node --outdir=dist --external:pg-native",
     "start": "NODE_ENV=production node dist/index.js"
     ```

3. **Create Web Service on Render:**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub/GitLab repository
   - Configure the service:
     - **Name:** taskemployeeflow (or your preferred name)
     - **Region:** Same region as your database for best performance
     - **Branch:** main (or your default branch)
     - **Root Directory:** Leave empty
     - **Runtime:** Node
     - **Build Command:** `npm install && npm run db:push && npm run build`
     - **Start Command:** `npm start`
     - **Instance Type:** Free (or select based on needs)

4. **Set Environment Variables:**
   In the "Environment" section, add:
   - `DATABASE_URL`: Paste the External Database URL from step 1
   - `SESSION_SECRET`: Generate a secure random string (32+ characters)
   - `NODE_ENV`: production
   - `PGHOST`: Your Render PostgreSQL host (from database info)
   - `PGUSER`: Your Render PostgreSQL user (from database info)
   - `PGPASSWORD`: Your Render PostgreSQL password (from database info)
   - `PGDATABASE`: Your Render PostgreSQL database name (from database info)
   - `PGPORT`: 5432

5. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Monitor the deployment logs for any errors
   - Once complete, your app will be available at: `https://your-app-name.onrender.com`

### Post-Deployment Checklist
- [ ] Verify the app loads at your Render URL
- [ ] Test registration flow for both Manager and Employee roles
- [ ] Test login/logout functionality
- [ ] Create a test task as a manager
- [ ] Verify employee can see assigned tasks
- [ ] Test complaint submission

### Troubleshooting

**Database Connection Issues:**
- Verify DATABASE_URL is correctly formatted: `postgres://user:password@host:port/database`
- Ensure the database is in the same region as your web service
- Check that your database allows external connections

**Build Failures:**
- Check the build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify there are no TypeScript errors

**Session Issues:**
- Ensure SESSION_SECRET is set
- For production, sessions use the default memory store. For high-availability, consider adding a Redis or PostgreSQL session store.

### Security Notes
- The SESSION_SECRET should be a unique, random string for production
- Employee passwords shown to managers are stored in memory only (cleared on server restart)
- All passwords are hashed using bcrypt before storage in the database
- Session cookies are secure (HTTPS only) in production mode
