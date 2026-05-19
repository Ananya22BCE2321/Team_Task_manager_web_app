# Team Task Manager

A full-stack task management app with role-based access, project teams, task assignment, and progress tracking.

## Features
- User authentication with signup/login
- Admin / Member role-based control
- Project creation and team membership
- Task creation, assignment, status updates, and overdue tracking
- Dashboard with tasks, project summaries, and overdue counts
- REST API backend with SQLite local support and PostgreSQL-ready deployment
- React/Vite frontend

## Local setup
1. Open a terminal in the `submission` folder.
2. Run `npm install`.
3. Create a `.env` file in `server` if you want custom values:

```env
PORT=4000
JWT_SECRET=change-this-secret
DB_FILE=server/database.sqlite
```

4. Run the app:
```bash
npm run dev
```

5. Visit `http://localhost:5173`.

## Deployment
This repo is ready for Railway deployment. Add the following environment variables in Railway:
- `JWT_SECRET`
- `DATABASE_URL` (optional, for PostgreSQL)
- `PORT`

Railway will install dependencies, build the React app, and start the Express server.

## Railway deployment
1. Push the `submission` repository to GitHub.
2. Create a new Railway project and connect your GitHub repository.
3. Set these environment variables in Railway:
   - `JWT_SECRET` (required)
   - `DATABASE_URL` (recommended with a Railway Postgres plugin)
   - `PORT` (Railway usually injects this automatically)
4. Railway will run `npm install` at the repo root. The `postinstall` script builds the React client automatically.
5. In Railway, ensure the root `Start Command` is `npm start`.

The deployed app serves the React build and Express API from the same domain, so the frontend uses a relative `/api` base path in production.
