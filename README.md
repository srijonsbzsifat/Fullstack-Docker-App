# Full-Stack Application with Docker Compose (Multi-Environment + Logging Setup)

This project is a full-stack application that demonstrates how to containerize a Node.js backend, a Vue.js frontend, and a MongoDB database using **Docker** and **Docker Compose**.  
It supports separate **development** and **production** environments, and now includes an integrated **ELK logging stack (Elasticsearch, Logstash, Kibana)** for centralized log management and monitoring.  
Helper scripts make it easy to start, stop, or rebuild both the app and the logging stack.

---

## Architecture

The application consists of the following services:

### Core Application
* **`backend`** – Node.js + Express + Mongoose REST API.  
* **`frontend`** – Vue.js client that communicates with the backend API.  
* **`mongodb`** – MongoDB database for persistent data.

### Logging Stack
* **`elasticsearch`** – Stores and indexes application logs.  
* **`logstash`** – Ingests and transforms logs from the backend.  
* **`kibana`** – Provides a UI for visualizing logs and metrics.

These are managed using multiple Compose files:

| File | Purpose |
|------|----------|
| `compose.base.yml` | Shared configuration for all environments |
| `compose.dev.yml` | Development overrides (bind mounts, live reload) |
| `compose.prod.yml` | Production overrides (immutable containers, restart policies) |
| `compose.elk.yml` | Adds Elasticsearch, Logstash, and Kibana logging stack |
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

---

## Running the Application

### Development (hot-reload)
```bash
scripts/dev-up.sh
```
- Builds and runs all app containers (`compose.base.yml + compose.dev.yml`)  
- Mounts local source code for live reload  
- Runs with `NODE_ENV=development`

Access:
- **Frontend:** http://localhost:8080  
- **Backend:** http://localhost:3000  

To stop containers:
```bash
scripts/dev-down.sh
```

### Production (immutable deployment)
```bash
scripts/prod-up.sh
```
- Uses production configuration (`compose.base.yml + compose.prod.yml`)  
- Runs containers with `NODE_ENV=production`  
- Automatically restarts on crash

To stop production containers:
```bash
scripts/prod-down.sh
```

> On Windows, run these commands using **Git Bash** or **WSL**.

---

## Logging Stack (ELK)

The ELK stack can be run on top of either environment.

### Start ELK + Application (Development)
```bash
scripts/dev-elk-up.sh
```
Starts:
- `backend`, `frontend`, `mongodb`
- `elasticsearch`, `logstash`, and `kibana`

Access Kibana at: [http://localhost:5601](http://localhost:5601)

To stop everything:
```bash
scripts/dev-elk-down.sh
```

### Start ELK + Application (Production)
```bash
scripts/prod-elk-up.sh
```
To stop:
```bash
scripts/prod-elk-down.sh
```

Logs sent via HTTP to Logstash (port 5000) are indexed in Elasticsearch under `app-logs-*` and visualized in Kibana.

---

## Folder Overview

```
.
├── backend/                 # Node.js + Express API
│   ├── Dockerfile
│   └── server.js
├── frontend/                # Vue.js client
│   └── Dockerfile
├── logstash/                # Logstash configuration
│   └── config/
│       └── logstash.conf
├── env/
│   ├── .env.shared
│   ├── .env.dev
│   └── .env.prod
├── scripts/                 # Convenience scripts
│   ├── _compose_common.sh
│   ├── dev-up.sh
│   ├── dev-down.sh
│   ├── dev-build.sh
│   ├── dev-elk-up.sh
│   ├── dev-elk-down.sh
│   ├── prod-up.sh
│   ├── prod-down.sh
│   ├── prod-elk-up.sh
│   ├── prod-elk-down.sh
├── compose.base.yml
├── compose.dev.yml
├── compose.prod.yml
├── compose.elk.yml
├── .dockerignore
├── docker-compose.legacy.yml
└── README.md
```

---

## Cleanup

Remove containers and volumes (for resetting Mongo data or clearing Elasticsearch indices):

```bash
scripts/dev-down.sh
docker volume prune -f
```

To clean ELK-specific data only:
```bash
scripts/dev-elk-down.sh
docker volume rm fullstack-docker-app_elasticsearch-data
```

---

## Viewing Logs in Kibana

1. Open [http://localhost:5601](http://localhost:5601)
2. Go to **Management -> Stack Management -> Create Data View** → create a new data view for `app-logs-*`
3. Go to **Analytics -> Discover** -> Add fields like `message`, `status`, `event`, `service` etc.
4. You’ll now see logs such as *“Successfully fetched 42 items.”* per request.

---

## Credits

Originally built as a demo of Docker and Docker Compose for full-stack development.  
Now enhanced with multi-environment support and a complete ELK logging stack for real-time log monitoring and analysis.
