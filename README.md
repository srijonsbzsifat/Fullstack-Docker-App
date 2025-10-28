# Full-Stack Application with Docker Compose (Multi-Environment Setup)

This project is a full-stack application that demonstrates how to containerize a Node.js backend, a Vue.js frontend, and a MongoDB database using **Docker** and **Docker Compose**.  
It supports separate **development** and **production** environments with simple shell scripts that make it easy to start, stop, or rebuild containers.

---

## Architecture

The application consists of three core services:

* **`backend`** – Node.js + Express + Mongoose REST API.  
* **`frontend`** – Vue.js client that communicates with the backend API.  
* **`mongodb`** – MongoDB database for persistent data.

These services are defined in multiple Compose files:

| File | Purpose |
|------|----------|
| `compose.base.yml` | Shared configuration for all environments |
| `compose.dev.yml` | Development overrides (bind mounts, live reload) |
| `compose.prod.yml` | Production overrides (immutable containers, restart policies) |
| `docker-compose.legacy.yml` | The original single-file Compose kept for reference |

---

## Prerequisites

Install the following before running the project:

* **Git** – for cloning the repository  
* **Docker Desktop** (or Docker Engine + Compose plugin)

> You don’t need Node.js, Vue CLI, or MongoDB installed locally—everything runs in containers.

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/srijonsbzsifat/Fullstack-Docker-App.git
cd Fullstack-Docker-App
```

### 2. Environment configuration

Environment variables live in the `env/` folder:

| File | Purpose |
|------|----------|
| `env/.env.shared` | common credentials and ports |
| `env/.env.dev` | development-specific variables |
| `env/.env.prod` | production-specific variables |

Example `env/.env.shared`:
```env
MONGO_INITDB_ROOT_USERNAME=myuser
MONGO_INITDB_ROOT_PASSWORD=mypassword
MONGO_DATABASE=dockerdatabase
BACKEND_PORT=3000
FRONTEND_PORT=8080
```

### 3. Run with helper scripts

#### Development (hot-reload)
```bash
bash scripts/dev-up.sh
```
- Builds all images with development overrides (`compose.base.yml + compose.dev.yml`)  
- Mounts your local code for instant updates  
- Runs with `NODE_ENV=development`

Access:
- **Frontend:** http://localhost:8080  
- **Backend:** http://localhost:3000  

To stop containers:
```bash
bash scripts/dev-down.sh
```

#### Production (immutable deployment)
```bash
bash scripts/prod-up.sh
```
- Uses production configuration (`compose.base.yml + compose.prod.yml`)  
- Containers restart automatically on failure  
- Runs with `NODE_ENV=production`

To stop production containers:
```bash
bash scripts/prod-down.sh
```

> On Windows, run these commands from **Git Bash** or **WSL**.

---

## Folder Overview

```
.
├── backend/                 # Node.js + Express API
│   ├── Dockerfile
│   └── server.js
├── frontend/                # Vue.js client
│   └── Dockerfile
├── env/
│   ├── .env.shared
│   ├── .env.dev
│   └── .env.prod
├── scripts/                 # Convenience scripts
│   ├── _compose_common.sh
│   ├── dev-up.sh
│   ├── dev-down.sh
│   ├── dev-build.sh
│   ├── prod-up.sh
│   ├── prod-down.sh
├── compose.base.yml
├── compose.dev.yml
├── compose.prod.yml
├── .dockerignore
├── docker-compose.legacy.yml   # old single-file compose (kept for reference)
└── README.md
```

---


## Cleanup

Remove containers and volumes (e.g., to reset Mongo data):

```bash
bash scripts/dev-down.sh
docker volume prune -f
```

---

## Credits

Originally built as a demo of Docker and Docker Compose for full-stack development, now extended with multi-environment support and simple deployment scripts.
