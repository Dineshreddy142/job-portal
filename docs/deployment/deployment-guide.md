# Job Portal Deployment Guide

This guide covers how to deploy the Job Portal project using different strategies, ranging from a simple Docker Compose setup for a VPS to a scalable cloud deployment.

## Prerequisites
- **Docker** and **Docker Compose** installed on your server.
- A domain name (optional but recommended).
- A server (VPS from DigitalOcean, AWS EC2, or similar) with at least 2GB of RAM.

---

## Strategy 1: Docker Compose (Recommended for VPS / Small Scale)

This is the easiest way to deploy the entire stack (Frontend, Backend, and Database) on a single server.

### 1. Update Environment Variables
On your server, create `.env` files for both the frontend and backend. 

**Backend (`backend/.env`):**
Ensure `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` point to your production domain.
```env
DB_USERNAME=your_prod_user
DB_PASSWORD=your_prod_password
JWT_SECRET=generate_a_very_long_random_hex_string_here
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

**Frontend (`frontend/.env`):**
Ensure the API URL points to your backend.
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 2. Configure `docker-compose.yml`
Ensure your `docker-compose.yml` at the root of the project defines all three services:
1. **db**: MySQL/PostgreSQL container.
2. **backend**: Builds from `backend/Dockerfile`.
3. **frontend**: Builds from `frontend/Dockerfile` (typically served via Nginx).

### 3. Build and Run
Navigate to the root of the project and run:
```bash
docker-compose up -d --build
```
This will build the Docker images and start the containers in detached mode.

### 4. Reverse Proxy & SSL (Nginx / Certbot)
It's highly recommended to place Nginx in front of your Docker containers to handle SSL/TLS termination.
- Map `yourdomain.com` to your server's IP.
- Install Nginx and Certbot.
- Proxy requests for `/` to your frontend container (usually port 80/3000).
- Proxy requests for `/api` to your backend container (usually port 8080).

---

## Strategy 2: Cloud PaaS (Railway / Render / Heroku)

If you prefer not to manage servers, you can use PaaS providers. This requires deploying the frontend and backend separately.

### Backend Deployment (e.g., Railway/Render)
1. **Database**: Create a managed MySQL/PostgreSQL database in your cloud provider.
2. **App Service**: Connect your GitHub repository and point the root directory to `/backend`.
3. **Environment Variables**: Add the database connection string and your `JWT_SECRET` in the provider's dashboard.
4. **Build Command**: `mvn clean package -DskipTests`
5. **Start Command**: `java -jar target/jobportal-0.0.1-SNAPSHOT.jar`

### Frontend Deployment (e.g., Vercel / Netlify)
1. Connect your GitHub repository to Vercel/Netlify.
2. Set the root directory to `/frontend`.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**: Set `VITE_API_BASE_URL` to the URL of your deployed backend.

---

## CI/CD Pipeline (GitHub Actions)

For automated deployments, utilize the `.github/workflows/deploy.yml` file. 

A standard workflow will:
1. Trigger on pushes to the `main` branch.
2. Run tests to ensure stability.
3. Build Docker images.
4. Push images to a registry (e.g., Docker Hub or AWS ECR).
5. SSH into your production server and run `docker-compose pull && docker-compose up -d` to deploy the new images.
