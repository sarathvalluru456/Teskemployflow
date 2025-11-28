@echo off
echo ========================================
echo   Starting TaskEmployeeFlow Server
echo ========================================
echo.
echo Server will be available at: http://localhost:5000
echo.
echo Note: You must have a PostgreSQL database available and update
echo       the DATABASE_URL below to point to it.
echo.
echo Press Ctrl+C to stop the server
echo.

set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskemployeeflow
set SESSION_SECRET=task-employee-flow-secret-key-dev-local
set PORT=5000
set NODE_ENV=development

npm run dev

pause

