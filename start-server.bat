@echo off
echo ========================================
echo   Starting TaskEmployeeFlow Server
echo ========================================
echo.
echo Server will be available at: http://localhost:5000
echo.
echo Note: If MongoDB is not running, you'll see a connection error
echo       but the server will still start (database features won't work)
echo.
echo Press Ctrl+C to stop the server
echo.

set DATABASE_URL=mongodb+srv://vamsi_database:IGGkXDs8u4NAnrI0@cluster0.oo65nnz.mongodb.net/taskemployeeflow?appName=Cluster0
set SESSION_SECRET=task-employee-flow-secret-key-dev-local
set PORT=5000
set NODE_ENV=development

npm run dev

pause

