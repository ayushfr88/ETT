💰 Finance Tracker (Auth Starter)
Full Stack — React + Express + PostgreSQL + Docker

A Docker-ready full-stack starter template for building a finance tracker app.
This project currently focuses on authentication and core infrastructure, making it a solid base to extend into a complete finance management system.

🚀 Features
🔐 User Authentication
Register & Login (Email + Password)
JWT-based authentication (backend ready)
⚙️ Backend
Node.js + Express
PostgreSQL integration
Auto-creates users table on startup
🎨 Frontend
React (Create React App)
Login / Signup UI
API integration with backend
🐳 Docker Support
One command to run entire stack
Pre-configured services (frontend, backend, database)
📁 Project Structure
.
├── backend/
│   ├── server.js        # Entry point
│   ├── db.js            # DB connection + schema init
│   └── routes/
│       └── auth.js      # Auth routes (login/register)
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── AuthPage.js
│       ├── hooks/
│       │   └── useAuth.js
│       └── api/
│           └── auth.js
│
└── docker-compose.yml   # Full stack setup
🧰 Tech Stack
Layer	Technology
Frontend	React
Backend	Node.js, Express
Database	PostgreSQL
Auth	JWT
DevOps	Docker, Docker Compose
⚡ Getting Started
🐳 Run with Docker (Recommended)
docker compose up --build
Services:
Service	URL
Frontend	http://localhost:3000

Backend	http://localhost:5000

Postgres	localhost:5432

Database credentials:

User: postgres
Password: postgres
DB: finance_tracker
🔧 Environment Variables
Backend
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/finance_tracker
JWT_SECRET=your-secret-key
Frontend
REACT_APP_API_URL=http://localhost:5000
🖥️ Run Locally (Without Docker)
1️⃣ Setup PostgreSQL
createdb finance_tracker
2️⃣ Start Backend
cd backend
npm install

Create .env:

PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/finance_tracker
JWT_SECRET=change-me

Run:

npm run dev

Health check:

GET /health → { "ok": true }
3️⃣ Start Frontend
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start

Open:

http://localhost:3000
📡 API Reference
🔐 Register

POST /auth/register

{
  "email": "you@example.com",
  "password": "yourpassword"
}

Responses:

201 Created → success
409 Conflict → email already exists
🔑 Login

POST /auth/login

{
  "email": "you@example.com",
  "password": "yourpassword"
}

Response:

{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>"
}

⚠️ Note: The frontend currently does not persist the JWT.

⚠️ Current Limitations
❌ No expense/income tracking yet
❌ No protected routes on frontend
❌ JWT not stored (no session handling)
❌ No validation layer (e.g., Joi/Zod)
🛠️ Roadmap / Future Improvements
📊 Add transactions (income/expenses)
📈 Dashboard & analytics
🔒 Protected routes (frontend + backend)
💾 JWT storage (localStorage / cookies)
🧾 Categories & budgeting
👤 User profile management
📦 Migrate to TypeScript (optional)
🤝 Contributing

Contributions are welcome!

Fork the repo
Create a new branch
Make your changes
Submit a PR 🚀
