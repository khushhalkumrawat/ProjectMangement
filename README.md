# 🚀 Project Management

A modern, full-stack project management platform designed to help teams organize projects, manage tasks, collaborate efficiently, and streamline their development workflow.

Built with a modern JavaScript stack, the application combines project management, task tracking, authentication, automation, and a responsive user experience into a single platform.

---

## ✨ Features

### 📊 Project & Task Management

* Create and manage multiple projects
* Organize work into tasks
* Track task progress and status
* Assign tasks to team members
* Set priorities and deadlines
* Monitor project progress from a centralized dashboard

### 👥 Team Collaboration

* Create and manage teams
* Invite team members to projects
* Assign responsibilities to team members
* Manage project-level collaboration
* Track team activity and project updates

### 🔐 Authentication & Security

* Secure authentication with Clerk
* Protected application routes
* User-specific project and task access
* Secure server-side API operations
* Role-based project management capabilities

### 🤖 AI-Powered Productivity

* AI-assisted project/task workflows
* Generate useful content and suggestions for project management
* Reduce repetitive work using AI-powered functionality
* Designed to support developers and teams in managing their workflow efficiently

### ⚡ Automated Workflows

* Event-driven background workflows using Inngest
* Automated processing of application events
* Background task execution
* Scalable workflow architecture

### 📈 Dashboard & Analytics

* Centralized project dashboard
* Project progress overview
* Task statistics
* Team activity insights
* Visual representation of project data

### 🎨 Modern UI

* Responsive design for desktop, tablet, and mobile
* Clean and modern interface
* Reusable React components
* Smooth navigation and user interactions
* Consistent design across the application

---

## 🛠️ Tech Stack

### Frontend

* **React.js** — UI development
* **Vite** — Frontend build tool
* **JavaScript** — Application logic
* **Tailwind CSS** — Styling
* **React Router** — Client-side routing
* **Axios** — API communication

### Backend

* **Node.js** — Runtime environment
* **Express.js** — Backend framework
* **Prisma ORM** — Database access and type-safe queries
* **PostgreSQL** — Relational database
* **Neon** — Serverless PostgreSQL
* **Inngest** — Event-driven background workflows

### Authentication

* **Clerk** — Authentication and user management

### AI

* **AI / Generative AI APIs** — AI-powered productivity features

### Deployment

* **Vercel** — Application deployment
* **Neon** — Production PostgreSQL database

---

## 🏗️ Architecture

The application follows a full-stack architecture where the frontend communicates with backend APIs, while the backend handles business logic, authentication, database operations, and background workflows.

```text
                    ┌──────────────────────┐
                    │       User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite       │
                    │    Frontend          │
                    └──────────┬───────────┘
                               │
                         HTTP / API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │      Backend         │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────┘       └──────────┐
                 ▼                             ▼
        ┌─────────────────┐          ┌─────────────────┐
        │ Prisma ORM      │          │    Inngest      │
        └────────┬────────┘          │  Workflows      │
                 │                   └─────────────────┘
                 ▼
        ┌─────────────────┐
        │ PostgreSQL      │
        │     Neon        │
        └─────────────────┘

                 ┌─────────────────┐
                 │     Clerk       │
                 │ Authentication  │
                 └─────────────────┘
```

---

## 📁 Project Structure

```text
Project-Management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── configs/
│   ├── inngest/
│   ├── prisma/
│   ├── utils/
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md
```

> The exact directory structure may vary depending on the current implementation.

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have the following installed:

* Node.js 18+
* npm
* Git
* PostgreSQL / Neon database
* Clerk account

---

## 1. Clone the Repository

```bash
git clone https://github.com/khushhalkumrawat/Project-Management.git

cd Project-Management
```

---

## 2. Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

Open another terminal:

```bash
cd server
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the backend/server directory.

```env
DATABASE_URL="your_neon_database_url"
DIRECT_URL="your_direct_database_url"

CLERK_SECRET_KEY="your_clerk_secret_key"

PORT=5000
NODE_ENV=development
```

Add the required frontend environment variables according to your Clerk and API configuration.

Example:

```env
VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
VITE_API_URL="http://localhost:5000"
```

> Never commit `.env` files or API keys to GitHub.

---

## 4. Setup Prisma

Run the Prisma commands from the server directory:

```bash
npx prisma generate
```

Apply your database schema:

```bash
npx prisma db push
```

To inspect your database using Prisma Studio:

```bash
npx prisma studio
```

---

## 5. Start the Backend

```bash
npm run dev
```

The backend will start on:

```text
http://localhost:5000
```

---

## 6. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔄 Application Workflow

```text
User
  │
  ▼
Authentication
  │
  ▼
Dashboard
  │
  ├── Create Project
  │       │
  │       ▼
  │    Add Tasks
  │       │
  │       ▼
  │    Assign Members
  │       │
  │       ▼
  │    Track Progress
  │
  └── Monitor Project Activity
```

---

# 🗄️ Database

The project uses **PostgreSQL** with **Prisma ORM**.

The database stores application data such as:

* Users
* Projects
* Tasks
* Project members
* Task assignments
* Project metadata
* Application events

Prisma provides a structured way to interact with PostgreSQL while keeping database operations organized and maintainable.

---

# ⚡ Background Workflows

The application uses **Inngest** for event-driven background processing.

Instead of performing every operation directly during an HTTP request, suitable tasks can be processed asynchronously through workflows.

Example:

```text
Application Event
       │
       ▼
    Inngest
       │
       ▼
Background Function
       │
       ▼
Database / External Service
```

This approach helps keep the application architecture modular and makes background operations easier to manage.

---

# 🔐 Authentication

Authentication and user management are handled using **Clerk**.

The authentication flow provides:

* User registration
* User login
* Session management
* Protected routes
* User identity management
* Secure access to application features

---

# 📱 Responsive Design

The interface is designed to work across different screen sizes:

```text
Desktop
   │
   ├── Dashboard
   ├── Projects
   └── Task Management

Tablet
   │
   └── Responsive layouts

Mobile
   │
   └── Mobile-friendly navigation
```

---

# 🚀 Deployment

The application can be deployed using:

### Frontend

**Vercel**

```text
GitHub → Vercel → Production
```

### Database

**Neon PostgreSQL**

```text
Application → Prisma → Neon PostgreSQL
```

### Backend / Server

The backend can be deployed using a Node.js-compatible hosting platform.

Make sure all production environment variables are configured in the deployment platform.

---

# 🧪 Development

Run the frontend:

```bash
cd frontend
npm run dev
```

Run the backend:

```bash
cd server
npm run dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Update the database schema:

```bash
npx prisma db push
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# 🛡️ Environment Variables

Never commit sensitive credentials.

Your `.gitignore` should include:

```gitignore
node_modules/
.env
.env.local
.env.development
.env.production
dist/
build/
*.log
```

---

# 🔮 Future Improvements

Potential improvements include:

* Real-time collaborative task updates
* Kanban board with drag-and-drop
* Calendar and timeline views
* Advanced project analytics
* AI task generation
* AI project summaries
* GitHub integration
* Slack integration
* File and document management
* Advanced team permissions
* Activity history
* Notifications
* Time tracking
* Sprint management
* Project templates
* Mobile application

---

# 📌 Key Highlights

* Full-stack project management platform
* Modern React-based frontend
* REST API backend
* PostgreSQL database with Prisma ORM
* Secure authentication using Clerk
* Event-driven workflows with Inngest
* AI-powered productivity features
* Responsive and modern UI
* Production-oriented architecture
* Cloud database using Neon
* Deployment-ready application

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git fork https://github.com/khushhalkumrawat/Project-Management.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

### 3. Commit your changes

```bash
git add .
git commit -m "Add new feature"
```

### 4. Push the branch

```bash
git push origin feature/new-feature
```

### 5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Khushhal**

Software Development Enthusiast

* Full-Stack Development
* React.js
* Node.js
* PostgreSQL
* Prisma

---

## ⭐ Show Your Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

**Built with JavaScript, React, Node.js, PostgreSQL & AI.**
