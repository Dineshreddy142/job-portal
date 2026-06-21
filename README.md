# Job Portal

A modern, full-stack Job Portal application built with React, Spring Boot, and MySQL.

## Tech Stack
* **Frontend:** React, Vite, TailwindCSS (Optional)
* **Backend:** Java 21, Spring Boot, Spring Security, Hibernate
* **Database:** MySQL 8.0
* **Infrastructure:** Docker, Docker Compose, GitHub Actions

## Running Locally (Development)
You can run the application locally using the provided `run.cmd` script on Windows, or by manually starting the servers:

1. **Database:** Ensure MySQL is running on `localhost:3306` with the credentials configured in `backend/.env`.
2. **Backend:** 
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Running with Docker (Production/Staging)
This repository is fully containerized. You can start the entire stack (Database, Backend, Frontend) with a single command:

```bash
docker compose up -d
```
The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080

## Environment Variables
Before running the application, you must set up your environment variables. 
Copy the `.env.example` files to `.env` in both the `frontend/` and `backend/` directories, and fill in your actual credentials.

## Deployment
This project includes a GitHub Actions CI/CD pipeline (`.github/workflows/deploy.yml`) which automatically builds and tests the Docker images whenever code is pushed to the `main` branch.
