# 🛒 SwiftCart — Full-Stack E-Commerce Platform

SwiftCart is a modern, full-stack e-commerce web application built with React (Vite) on the frontend and Node.js (Express) on the backend, backed by a PostgreSQL database hosted on AWS RDS. The entire application is containerized with Docker and deployed to AWS EC2 via an automated GitHub Actions CI/CD pipeline.

---

## 📌 Summary

SwiftCart allows users to browse products, add items to their cart, proceed through a checkout flow with auto-calculated billing, and place orders. All user registrations and orders are automatically saved to the database. An admin panel lets administrators view all users and orders in real time.

Key highlights:
- 🔐 Auto login/signup — users are saved to the DB on first login
- 🛍️ Product catalog seeded from the database
- 🧾 Checkout with auto-calculated subtotal, tax, and total
- 👨‍💼 Admin dashboard to monitor users and orders
- 🐳 Fully Dockerized — runs locally or in production with one command
- 🚀 CI/CD via GitHub Actions — auto deploys to AWS EC2 on every push to `main`

---

## 📸 Screenshots

| | |
|---|---|
| ![Shop Page](public/ec2.png) | ![Checkout & Billing](public/bill.png) |
| **Shop Page** — Product catalog deployed live on AWS EC2, showing 8 seeded accessories with prices and Add to Cart buttons. | **Checkout & Billing** — Shopping cart page with auto-calculated subtotal, 18% tax, and total bill for the selected items. |
| ![Database Orders](public/Db.png) | ![CI/CD Pipeline](public/git.png) |
| **Database Orders** — PostgreSQL orders table on AWS RDS showing real user orders saved automatically on checkout. | **CI/CD Pipeline** — GitHub Actions workflow successfully building and deploying SwiftCart to AWS EC2 in 46 seconds. |

---

## 🧱 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 19, Vite, Axios, Lucide React |
| Backend      | Node.js, Express 5, pg (PostgreSQL) |
| Database     | PostgreSQL via AWS RDS               |
| Styling      | Vanilla CSS                         |
| Web Server   | Nginx (serves frontend + API proxy) |
| Containers   | Docker, Docker Compose              |
| CI/CD        | GitHub Actions                      |
| Hosting      | AWS EC2 (app) + AWS RDS (database)  |

---

## 📁 Project Structure

```
smartcart-e-commerce/
├── backend/
│   ├── index.js              # Express server & all API routes
│   ├── package.json
│   ├── Dockerfile
│   └── .env                  # Local environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app with all pages & routing
│   │   └── App.css           # Global styles
│   ├── nginx.conf            # Nginx config (serves app + proxies /api/)
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── main.yml          # GitHub Actions CI/CD pipeline
├── docker-compose.yml            # Production compose (uses Docker Hub images)
├── docker-compose.build.yml      # Build & run from source code locally
├── docker-compose.local.yml      # Run pre-built local images
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_NAME=postgres
DB_PORT=5432
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose
- A running PostgreSQL database (local or AWS RDS)

---

### 1️⃣ Run Frontend Locally (Dev Mode)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:5173**

> The Vite dev server proxies `/api` requests to the backend automatically.

---

### 2️⃣ Run Backend Locally (Dev Mode)

```bash
cd backend
npm install
npm run dev       # uses nodemon for hot-reload
# OR
npm start         # standard node start
```

The backend API will be available at **http://localhost:5001**

> Make sure your `backend/.env` file is configured before starting.

---

### 3️⃣ Run with Docker (Build from Source)

Use this when you want to build fresh images from your current code:

```bash
docker compose -f docker-compose.build.yml up -d --build
```

- Frontend → **http://localhost:3000**
- Backend API → **http://localhost:5002**

To stop:

```bash
docker compose -f docker-compose.build.yml down
```

---

### 4️⃣ Run with Docker (Pre-built Local Images)

Use this when you've already built the images and just want to run them:

```bash
docker compose -f docker-compose.local.yml up -d
```

- Frontend → **http://localhost:3000**
- Backend API → **http://localhost:5002**

---

### 5️⃣ Run in Production (Docker Hub Images)

Used by the CI/CD pipeline on AWS EC2. Requires a `.env` file with DB credentials and the `DOCKERHUB_USERNAME` variable set:

```bash
docker compose up -d
```

- Frontend → **http://\<EC2-PUBLIC-IP\>:80**
- Backend API → **http://\<EC2-PUBLIC-IP\>:5001**

---

## 🌐 API Endpoints

| Method | Endpoint          | Description                          |
|--------|-------------------|--------------------------------------|
| POST   | `/api/login`      | Auto login or register a user        |
| POST   | `/api/admin/login`| Admin login/register                 |
| POST   | `/api/orders`     | Place a new order                    |
| GET    | `/api/orders`     | Fetch all orders (admin)             |
| GET    | `/api/users`      | Fetch all registered users (admin)   |
| GET    | `/api/products`   | Fetch all products                   |
| GET    | `/`               | Health check — backend is live       |

---

## 🐳 Docker Overview

### Frontend Dockerfile
- Builds the React app with Vite
- Copies the build output into an **Nginx** container
- Nginx serves the static files and proxies `/api/` requests to the backend container

### Backend Dockerfile
- Runs `node index.js` inside a Node.js container
- Exposes port `5001`

### Nginx Proxy (`nginx.conf`)
```nginx
location /api/ {
    proxy_pass http://swiftcart-backend:5001/api/;
}
```
This means the frontend never needs to know the backend's IP — all API calls go through Nginx on the same host.

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Every push to the `main` branch automatically:

1. ✅ Checks out the code
2. 🔑 Logs into Docker Hub
3. 🏗️ Builds and pushes the **backend** Docker image
4. 🏗️ Builds and pushes the **frontend** Docker image (with `VITE_API_URL` baked in)
5. 🚀 SSHs into the AWS EC2 instance and:
   - Installs Docker if not present
   - Writes the `.env` file with RDS credentials from GitHub Secrets
   - Writes a fresh `docker-compose.yml`
   - Pulls the latest images
   - Restarts the containers

### Required GitHub Secrets

| Secret Name          | Description                          |
|----------------------|--------------------------------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username             |
| `DOCKERHUB_TOKEN`    | Docker Hub access token              |
| `EC2_HOST`           | Public IP of your AWS EC2 instance   |
| `EC2_USERNAME`       | EC2 SSH username (e.g., `ubuntu`)    |
| `EC2_SSH_KEY`        | Private SSH key for EC2              |
| `DB_USER`            | RDS database username                |
| `DB_PASSWORD`        | RDS database password                |
| `DB_HOST`            | RDS endpoint hostname                |
| `DB_NAME`            | RDS database name                    |

---

## 🗄️ Database Schema

The backend auto-creates these tables on startup:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2),
  total_bill DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (auto-seeded with 8 products)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  discount INTEGER,
  image TEXT
);

-- Admins table (default: admin@swiftcart.com / admin123)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 👨‍💼 Default Admin Credentials

| Field    | Value                  |
|----------|------------------------|
| Username | `admin`                |
| Email    | `admin@swiftcart.com`  |
| Password | `admin123`             |

> ⚠️ Change these credentials before going to production.

---

## 📝 License

This project is for educational and portfolio purposes.

---

**Built with ❤️ by Shweta Jadhav**
