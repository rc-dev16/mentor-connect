# Migration Plan: Railway to Interslice VPS

This document outlines the step-by-step plan to migrate **Mentor Connect** from Railway to an **Interslice VPS (1 Slice)**, utilizing **Open Ship** for automated deployments and manually configuring custom domain URLs.

## 1. VPS Provisioning (Interslice)
- Purchase the **1 Slice** VPS plan from Interslice.
- Select a Linux distribution (Ubuntu 24.04 LTS or 22.04 LTS is recommended).
- Note down the **Public IP Address** of your new VPS.
- SSH into the VPS and secure it (create a non-root user, set up SSH keys, and configure UFW firewall).

## 2. Database Migration (PostgreSQL)
Since you are moving away from Railway's managed PostgreSQL, you will need to host your database. You can deploy PostgreSQL directly on the VPS or via Open Ship.

### Step 2.1: Export Data from Railway
- Use `pg_dump` to export your existing database from Railway. You can find the Railway DB connection string in your Railway dashboard:
  ```bash
  pg_dump "postgresql://postgres:PASSWORD@containers-us-west-...railway.app:5432/railway" > mentor_connect_dump.sql
  ```

### Step 2.2: Setup PostgreSQL on Interslice VPS
- Install PostgreSQL on your VPS:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  ```
- Create a new database and user for Mentor Connect:
  ```sql
  CREATE DATABASE mentor_connect;
  CREATE USER mentor_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
  GRANT ALL PRIVILEGES ON DATABASE mentor_connect TO mentor_admin;
  ```
- Restore the database dump:
  ```bash
  psql -U mentor_admin -d mentor_connect < mentor_connect_dump.sql
  ```

## 3. Automated Deployment Setup (Open Ship)
Open Ship will handle pulling code from GitHub and deploying both the frontend and backend services.

- **Install Open Ship** on your Interslice VPS following their official documentation.
- **Connect GitHub**: Authorize Open Ship to access your `mentor-connect` repository.

### Frontend Service Configuration (in Open Ship)
- **Source**: Select your GitHub repo.
- **Root Directory**: `/`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start` (or `./start.sh` which runs `node server.js`)
- **Port**: Expose port `8080` (or let Open Ship assign one).

### Backend Service Configuration (in Open Ship)
- **Source**: Select your GitHub repo.
- **Root Directory**: `/backend`
- **Build Command**: `npm ci`
- **Start Command**: `node src/server.js`
- **Port**: Expose port `5001`.

## 4. Manual URL & Domain Configuration
You need to manually configure your custom domains (e.g., `mentorconnect.com` and `api.mentorconnect.com` or `mentorconnect.com/api`).

### Step 4.1: DNS Configuration
Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and create **A Records** pointing to your Interslice VPS IP:
- **Type**: A | **Name**: `@` | **Value**: `<VPS_PUBLIC_IP>`
- **Type**: A | **Name**: `www` | **Value**: `<VPS_PUBLIC_IP>`
- *(Optional, if hosting API on a subdomain)* **Type**: A | **Name**: `api` | **Value**: `<VPS_PUBLIC_IP>`

### Step 4.2: Reverse Proxy & SSL Setup
If Open Ship handles domain mapping automatically:
- Add your custom domain to the Frontend and Backend services in the Open Ship dashboard.
- Enable automatic SSL (Let's Encrypt) within the dashboard.

If you need to configure it manually via Nginx:
- Install Nginx and Certbot.
- Create Server Blocks routing `yourdomain.com` to your frontend's port (e.g., `8080`) and `yourdomain.com/api` (or `api.yourdomain.com`) to your backend's port (e.g., `5001`).
- Run `sudo certbot --nginx -d yourdomain.com` to secure the URLs with HTTPS.

## 5. Environment Variables Update
Once your URLs are set up, update the environment variables in **Open Ship** for both services to use the new manual URLs.

### Frontend Env Vars
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_BASE_URL=https://yourdomain.com/api  # (Or https://api.yourdomain.com)
```

### Backend Env Vars
```env
NODE_ENV=production
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
# Update with your new local VPS database credentials
DATABASE_URL=postgresql://mentor_admin:your_secure_password@localhost:5432/mentor_connect
CORS_ORIGIN=https://yourdomain.com
CLERK_AUTHORIZED_PARTIES=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## 6. Clerk Authentication Update
Since your domain has changed, you must update Clerk to allow authentication from the new URL:
1. Go to the [Clerk Dashboard](https://dashboard.clerk.com).
2. Navigate to **Custom Domains** or **Domains & URLs** depending on your Clerk plan.
3. Add your new custom domain (`yourdomain.com`).
4. Follow Clerk's instructions to add CNAME records to your DNS registrar to verify the domain.
5. Ensure your new domain is listed under **Authorized Parties**.

## 7. Go-Live & Testing
1. **Health Check**: Visit `https://yourdomain.com/api/health` to verify the backend and Clerk configuration are properly linked.
2. **Smoke Test**: 
   - Log in as a Mentee.
   - Request a session and check notifications.
   - Log in as a Mentor.
   - Approve the request, verify dashboard stats, and schedule a meeting.
3. **Cutover**: Once verified and DNS has propagated, you can safely spin down and delete your Railway project.
