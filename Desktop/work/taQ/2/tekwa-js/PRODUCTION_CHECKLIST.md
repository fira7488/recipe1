# 🚀 Production Deployment Checklist

This checklist ensures your Tekwa Restaurant deployment is secure and production-ready.

---

## ✅ Pre-Deployment (Before Going Live)

### Security
- [ ] **JWT_SECRET** is set and strong (32+ characters)
  ```bash
  # Generate secure random string:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **ADMIN_PASSWORD** is set and strong
- [ ] **.env file is in .gitignore** (never commit secrets)
- [ ] **All credentials rotated** from development
- [ ] **Firebase API key** not exposed in public code
- [ ] **HTTPS/SSL certificate** obtained (Let's Encrypt recommended)
- [ ] **CORS_ORIGIN** configured for your domain only
- [ ] **No console.log() of sensitive data** in production code
- [ ] **Helmet.js security headers** enabled

### Testing
- [ ] **All tests pass** (`npm run test`)
- [ ] **Test coverage > 60%** (`npm run test:coverage`)
- [ ] **No TypeScript errors** (`npm run lint`)
- [ ] **Manual API testing completed**
  ```bash
  # Test login
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"password":"your-password"}'
  ```
- [ ] **Admin panel tested** in browser

### Code Quality
- [ ] **Dependencies up to date** (`npm update`)
- [ ] **No security vulnerabilities** (`npm audit`)
- [ ] **Code reviewed** by another developer
- [ ] **Comments added** for complex logic
- [ ] **Error messages** don't expose sensitive info

### Infrastructure
- [ ] **Server/host provisioned** with 2GB+ RAM
- [ ] **Node.js 20.x installed** on server
- [ ] **Docker** installed (if using containers)
- [ ] **Nginx/Reverse proxy** configured
- [ ] **SSL certificate** installed and valid
- [ ] **Firewall rules** configured
  - [ ] Port 80 (HTTP) → 443 (HTTPS)
  - [ ] Port 443 (HTTPS) open
  - [ ] Port 3000 (app) closed to external, open to localhost
  - [ ] SSH (22) limited to authorized IPs
- [ ] **DNS records** point to your server
- [ ] **Backup strategy** in place (daily db.json backups)
- [ ] **Monitoring/alerting** set up (Sentry, CloudWatch, etc.)

### Documentation
- [ ] **Deployment guide** reviewed (DEPLOYMENT.md)
- [ ] **Runbooks** created for common issues
- [ ] **Team trained** on deployment process
- [ ] **Recovery procedure** documented (how to restore from backup)

---

## 🔍 Verification Commands

Run these commands to verify production readiness:

### 1. Environment Check
```bash
# Verify all required env vars are set
if [ -z "$JWT_SECRET" ] || [ -z "$ADMIN_PASSWORD" ]; then
  echo "❌ Missing critical env vars"
  exit 1
fi
echo "✅ Environment variables OK"
```

### 2. Dependency Security
```bash
npm audit --production
# Output should show: "up to date, audited X packages"
```

### 3. TypeScript Build
```bash
npm run lint
# Should complete with no errors
```

### 4. API Health Check
```bash
curl http://localhost:3000/api/health
# Response: {"status":"ok"}
```

### 5. Authentication Test
```bash
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}')

echo $RESPONSE | grep -q "token" && echo "✅ Auth OK" || echo "❌ Auth failed"
```

### 6. Database Check
```bash
# Verify db.json exists and is readable
if [ -r db.json ]; then
  echo "✅ Database OK"
else
  echo "❌ Database not accessible"
fi
```

### 7. Docker Image Check (if using Docker)
```bash
docker run --rm \
  -e JWT_SECRET="test" \
  -e ADMIN_PASSWORD="test" \
  -e NODE_ENV="production" \
  tekwa:latest node -v
# Should output: v20.x.x
```

---

## 📋 Pre-Launch Verification (24 Hours Before)

### 1. Staging Deployment
```bash
# Deploy to staging environment
# Run through all checklist items
```

### 2. Load Testing
```bash
# Simulate production load
# Install Apache Bench: apt install apache2-utils
ab -n 1000 -c 10 http://your-staging-url/api/state
```

### 3. Backup Verification
```bash
# Test backup/restore process
cp db.json db.backup.json
# ... verify restore works
```

### 4. Failover Test
```bash
# Kill the application
kill $(ps aux | grep "node dist/server.cjs" | grep -v grep | awk '{print $2}')

# Verify auto-restart (if using PM2 or systemd)
pm2 status
```

---

## ⚡ Deployment Day

### Pre-Deployment (30 min before)
- [ ] Notify team of deployment
- [ ] Backup current database: `cp db.json db.backup.$(date +%s).json`
- [ ] Create rollback branch: `git branch backup-$(date +%Y-%m-%d)`
- [ ] Stop current application: `pm2 stop tekwa`

### Deployment
- [ ] Pull latest code: `git pull origin main`
- [ ] Install dependencies: `npm ci`
- [ ] Run tests: `npm run test`
- [ ] Build: `npm run build`
- [ ] Start application: `npm start` or `pm2 start dist/server.cjs`

### Post-Deployment (30 min monitoring)
- [ ] Check health: `curl http://localhost:3000/api/health`
- [ ] Check logs: `pm2 logs tekwa`
- [ ] Test login: Try admin panel
- [ ] Monitor CPU/Memory: `top`, `free -h`
- [ ] Check error rate: Should be < 1%
- [ ] Monitor traffic: Check for unusual patterns

### Success Criteria
- ✅ Health check returns `{"status":"ok"}`
- ✅ No errors in logs
- ✅ Admin login works
- ✅ Menu loads correctly
- ✅ No spike in CPU/memory
- ✅ Response time < 500ms (p95)

---

## 🚨 Rollback Procedure

If deployment fails:

```bash
# Stop application
pm2 stop tekwa

# Revert code
git checkout backup-$(date +%Y-%m-%d)
npm ci
npm run build

# Restore database if needed
cp db.backup.$(date +%s).json db.json

# Restart
pm2 start dist/server.cjs

# Verify
curl http://localhost:3000/api/health
```

---

## 📊 Post-Deployment Monitoring

### Daily
- [ ] Check logs for errors: `pm2 logs tekwa | tail -100`
- [ ] Monitor disk space: `df -h`
- [ ] Check database size: `ls -lh db.json`

### Weekly
- [ ] Review error tracking (Sentry, CloudWatch)
- [ ] Check security audit: `npm audit`
- [ ] Backup verification
- [ ] Performance metrics review

### Monthly
- [ ] Dependency updates: `npm update && npm audit`
- [ ] Database optimization/cleanup
- [ ] SSL certificate expiry check
- [ ] Security review

---

## 🔐 Security Maintenance

### Every Rotation (Quarterly)
- [ ] Rotate JWT_SECRET
- [ ] Rotate ADMIN_PASSWORD
- [ ] Update SSL certificate (Let's Encrypt)
- [ ] Review firewall rules
- [ ] Review user access logs

### Incident Response
If security breach suspected:
1. Immediately rotate all secrets
2. Review logs for unauthorized access
3. Backup current state
4. Deploy security patch
5. Monitor for 24 hours
6. Post-incident review

---

## 📈 Performance Benchmarks

Target metrics for production:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | < 500ms | > 1000ms |
| CPU Usage | < 50% | > 80% |
| Memory Usage | < 512MB | > 1GB |
| Error Rate | < 0.1% | > 1% |
| Disk Space Used | < 50% | > 80% |

---

**Status:** Ready for Production ✅  
**Last Updated:** June 2026
