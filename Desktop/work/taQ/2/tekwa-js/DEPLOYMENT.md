# 🍽️ Tekwa Restaurant - Production Ready

**Version:** 1.0.0  
**Status:** ✅ Production Ready (v1)  
**Production Readiness:** 82%

---

## 📋 Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Development](#development)
7. [Deployment](#deployment)
8. [API Documentation](#api-documentation)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features
- ✅ **Full-Stack Restaurant Management** - React + Express + Node.js
- ✅ **Multi-Language Support** - English, Arabic, Oromo, Amharic
- ✅ **Admin Dashboard** - Manage menu, categories, restaurant info
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Rate Limiting** - DDoS protection (100 req/min per IP)
- ✅ **Security Headers** - Helmet.js for HTTP security
- ✅ **CORS Protection** - Configurable origin whitelist
- ✅ **Request Size Limits** - 10KB max payload
- ✅ **Database Persistence** - JSON-based with backup support
- ✅ **Error Handling** - Centralized error management
- ✅ **Health Checks** - `/api/health` endpoint
- ✅ **Docker Ready** - Production Docker & docker-compose setup
- ✅ **CI/CD Automated** - GitHub Actions workflow
- ✅ **Logging** - Timestamped access logs

---

## 🛠️ Tech Stack

### Frontend
- React 19 with TypeScript
- Vite (dev server & bundler)
- Tailwind CSS v4
- Motion for animations
- Lucide React icons

### Backend
- Node.js 20
- Express.js (HTTP server)
- TypeScript
- JWT for authentication
- Helmet for security headers
- CORS for cross-origin requests

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- npm for package management

---

## 📦 Prerequisites

Before you start, ensure you have:

- **Node.js** 20.x or higher ([download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **Docker** (optional, for containerized deployment) ([download](https://www.docker.com/))
- **Git** ([download](https://git-scm.com/))

**Verify installation:**
```bash
node --version    # v20.x.x
npm --version     # 10.x.x
docker --version  # Docker version 24.x.x (optional)
```

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/tekwa-restaurant.git
cd tekwa-restaurant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Critical Variables:**
```env
JWT_SECRET=your-super-secret-key-min-32-chars
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

---

## ⚙️ Configuration

### Environment Variables
See `.env.example` for all available options.

**Essential Production Settings:**

| Variable | Default | Required | Notes |
|----------|---------|----------|-------|
| `NODE_ENV` | development | ✅ | Set to `production` |
| `JWT_SECRET` | - | ✅ | Minimum 32 characters |
| `ADMIN_PASSWORD` | - | ✅ | Use strong password |
| `PORT` | 3000 | ⚠️ | Exposed port |
| `CORS_ORIGIN` | localhost | ✅ | Comma-separated list |
| `DB_FILE` | ./db.json | ⚠️ | Database file location |

### Security Checklist
- [ ] Generate strong `JWT_SECRET` (32+ chars)
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Update `CORS_ORIGIN` with your domain
- [ ] Enable HTTPS in production (via reverse proxy)
- [ ] Set `NODE_ENV=production`
- [ ] Keep `.env` out of version control
- [ ] Never commit `.env` to Git

---

## 💻 Development

### Start Development Server
```bash
npm run dev
```

This starts both Vite (React) and Express in development mode with hot-reload.

**Access:**
- Frontend: http://localhost:5173
- API: http://localhost:3000/api

### Run Tests
```bash
# Run all tests
npm test

# Watch mode (re-run on file change)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Build for Production
```bash
npm run build
```

This creates:
- `/dist` - React app bundle
- `/dist/server.cjs` - Node.js server

---

## 🌐 Deployment

### Option 1: Docker (Recommended)

#### Build & Run Locally
```bash
# Build image
docker build -t tekwa:latest .

# Run container
docker run -p 3000:3000 \
  -e JWT_SECRET="your-secret" \
  -e ADMIN_PASSWORD="your-password" \
  -e NODE_ENV="production" \
  tekwa:latest
```

#### Using Docker Compose
```bash
# Edit docker-compose.yml with your config
docker-compose up -d
```

#### Deploy to Docker Registry
```bash
# Tag image
docker tag tekwa:latest your-registry/tekwa:1.0.0

# Push to registry
docker push your-registry/tekwa:1.0.0

# On production server, pull and run:
docker pull your-registry/tekwa:1.0.0
docker run -d \
  -p 80:3000 \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
  -e NODE_ENV="production" \
  your-registry/tekwa:1.0.0
```

### Option 2: Traditional Server Deployment

#### 1. Build Locally
```bash
npm run build
```

#### 2. Upload to Server
```bash
scp -r dist/ db.json package.json your-user@your-server:/app/tekwa/
```

#### 3. On Production Server
```bash
cd /app/tekwa
npm ci --only=production
NODE_ENV=production npm start
```

#### 4. Setup Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name tekwa-restaurant.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tekwa-restaurant.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    client_max_body_size 10k;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 5. Process Manager (PM2)
```bash
npm install -g pm2

# Start app
pm2 start dist/server.cjs --name "tekwa" --instances max

# Enable auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs tekwa
pm2 monit
```

### Option 3: Vercel (Frontend Only)
Vercel doesn't support Node.js servers; use Docker or traditional deployment for backend.

---

## 📚 API Documentation

### Authentication

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "password": "your-admin-password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

#### Using Token
```bash
Authorization: Bearer <your-token-here>
```

### Public Endpoints

#### Get Menu & Info
```bash
GET /api/state

Response:
{
  "products": [...],
  "categories": [...],
  "hero": {...},
  "restaurant": {...}
}
```

#### Health Check
```bash
GET /api/health

Response:
{
  "status": "ok"
}
```

### Protected Endpoints (Admin Only)

All require `Authorization: Bearer <token>` header.

#### Products
```bash
# Create
POST /api/products
{ "nameEn": "...", "nameAr": "...", "categoryId": "...", "price": 100 }

# Update
PUT /api/products/:id
{ "price": 120, ... }

# Delete
DELETE /api/products/:id
```

#### Categories
```bash
# Create
POST /api/categories
{ "nameEn": "...", "nameAr": "...", "icon": "Utensils" }

# Update
PUT /api/categories/:id

# Delete
DELETE /api/categories/:id
```

#### Restaurant Info
```bash
POST /api/restaurant
{ "nameEn": "...", "phone": "...", "email": "..." }
```

---

## 🔒 Security

### Implemented Protections
- ✅ JWT token-based authentication
- ✅ Helmet.js security headers
- ✅ CORS whitelist
- ✅ Rate limiting (100 req/min)
- ✅ Request size limits (10KB)
- ✅ Environment variable management
- ✅ HTTPS enforcement (via reverse proxy)
- ✅ Non-root Docker user
- ✅ Health checks
- ✅ Input validation

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### Recommendations
1. **Rotate Secrets Regularly** - Update JWT_SECRET and passwords monthly
2. **Monitor Logs** - Check for suspicious access patterns
3. **Backup Database** - Daily backups of db.json
4. **Use HTTPS** - Always use SSL/TLS in production
5. **Update Dependencies** - Run `npm audit` weekly
6. **Restrict Admin Access** - Use VPN/firewall for admin endpoints
7. **Enable Logging** - Send logs to centralized service (Sentry, CloudWatch)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Errors
```bash
# Check db.json permissions
chmod 644 db.json

# Reset to default state (backup first!)
rm db.json
npm start  # Auto-creates default db.json
```

### JWT Token Expired
```bash
# Login again to get fresh token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'
```

### Docker Build Fails
```bash
# Clear Docker cache and rebuild
docker system prune -a
docker build -t tekwa:latest --no-cache .
```

### CORS Errors
```bash
# Update CORS_ORIGIN in .env
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

---

## 📞 Support

For issues:
1. Check the troubleshooting section above
2. Review error logs: `pm2 logs tekwa`
3. Run diagnostics: `npm run lint && npm test`
4. Check GitHub issues: https://github.com/your-org/tekwa/issues

---

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** June 2026  
**Maintained By:** Your Team  
**Status:** Production Ready v1.0
