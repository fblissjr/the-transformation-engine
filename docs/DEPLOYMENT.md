# Multi-Tenant Deployment Guide

> **Privacy-First Static Hosting for Public Use**

This guide covers deploying The Transformation Engine for public, multi-tenant use while maintaining strong privacy guarantees.

---

## Table of Contents

1. [Privacy Architecture Overview](#privacy-architecture-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Hosting Provider Setup](#hosting-provider-setup)
4. [Verification & Testing](#verification--testing)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

---

## Privacy Architecture Overview

### How It Works

**100% Client-Side Operation**:
- All code runs in the user's browser
- No backend server processes requests
- Hosting provider only serves static files (HTML, JS, CSS)

**Data Storage**:
- All prompts, images, videos stored in user's browser (IndexedDB)
- Nothing uploaded to your hosting provider
- Each user's data is isolated to their browser

**API Calls**:
- Direct browser → Google Gemini API
- Google sees: User's IP address (not your host's IP)
- Your host sees: Only static file requests, zero API traffic

**API Keys**:
- Users provide their own Gemini API keys
- Keys encrypted in browser storage (AES-GCM)
- Configurable TTL (default: 7 days)
- Keys never touch your server

### Privacy Guarantees

1. **No Server-Side Processing**: Your hosting provider never sees user data
2. **No Network Proxying**: API calls go directly from user → Google
3. **No Data Persistence**: Nothing stored on your servers
4. **No Tracking**: No analytics, no telemetry, no logs
5. **No API Key Leakage**: Users bring their own keys

---

## Pre-Deployment Checklist

### 1. Verify User-Provided API Keys

**CRITICAL**: This app requires users to provide their own API keys via the UI.

```bash
# ✅ CORRECT - No API key in build
# Users enter keys in-app, stored encrypted client-side

# ❌ WRONG - Never embed API keys
# Don't use environment variables or hardcode keys
```

**Why**: All API keys are user-provided and stored encrypted in their browser. Your deployment never sees or stores API keys.

### 2. Verify CSP Configuration

Check `index.html` has proper Content Security Policy:

```html
<meta http-equiv="Content-Security-Policy" content="
  connect-src 'self' https://generativelanguage.googleapis.com;
  ...
" />
```

Only `generativelanguage.googleapis.com` should be whitelisted.

### 3. Build for Production

```bash
# Clean build
rm -rf dist node_modules/.vite

# Fresh install
npm install

# Build
npm run build

# Verify dist/ folder
ls -lh dist/
```

### 4. Audit Build Output

```bash
# Check for API keys in bundle
grep -r "AIza" dist/  # Gemini keys start with "AIza"
# Should return: nothing

# Check bundle size
du -sh dist/
# Should be: ~500KB - 2MB
```

---

## Hosting Provider Setup

### Option 1: Netlify (Recommended)

**Configuration**: `netlify.toml` (already provided)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. Verify deployment
curl -I https://your-site.netlify.app
# Check headers: CSP, X-Frame-Options, etc.
```

**Custom Domain**:
```bash
netlify domains:add yourdomain.com
```

**Environment Variables**: None required

---

### Option 2: Cloudflare Pages

**Configuration**: Create `_headers` file:

```bash
cat > dist/_headers << 'EOF'
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://generativelanguage.googleapis.com; worker-src 'self' blob:; object-src 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
EOF
```

**Deployment**:
```bash
# 1. Build
npm run build

# 2. Add _headers to dist
cp _headers dist/

# 3. Deploy via Cloudflare dashboard
# - Connect your Git repo
# - Build command: npm run build
# - Build output: dist
# - Environment variables: (none required)
```

---

### Option 3: AWS S3 + CloudFront

**Setup**:

```bash
# 1. Create S3 bucket
aws s3 mb s3://your-transformation-engine

# 2. Configure bucket for static hosting
aws s3 website s3://your-transformation-engine \
  --index-document index.html \
  --error-document index.html

# 3. Build and upload
npm run build
aws s3 sync dist/ s3://your-transformation-engine --delete

# 4. Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-transformation-engine.s3.amazonaws.com \
  --default-root-object index.html
```

**Add Response Headers** via Lambda@Edge:

```javascript
// Add CSP headers
exports.handler = (event, context, callback) => {
  const response = event.Records[0].cf.response;
  response.headers['content-security-policy'] = [{
    key: 'Content-Security-Policy',
    value: "connect-src 'self' https://generativelanguage.googleapis.com; ..."
  }];
  callback(null, response);
};
```

---

## Verification & Testing

### 1. Network Traffic Audit

**Browser DevTools**:
1. Open DevTools (F12)
2. Go to Network tab
3. Use the app (generate prompts, upload media)
4. Verify:
   - ✅ All API calls go to `generativelanguage.googleapis.com`
   - ✅ No calls to your hosting provider (except static files)
   - ✅ No unexpected domains

**Privacy Dashboard**:
1. Click "Privacy" button in left sidebar
2. Check "Network Activity" section
3. Verify:
   - ✅ Total requests to approved domains only
   - ✅ No unexpected domains listed

### 2. Storage Verification

**IndexedDB**:
1. DevTools → Application → IndexedDB
2. Verify:
   - ✅ `transformation-engine` database exists
   - ✅ Data stored locally
   - ✅ Nothing on your server

**Encrypted Storage**:
1. DevTools → Application → Local Storage
2. Verify:
   - ✅ `enc_gemini_api_key` entry (encrypted ciphertext)
   - ✅ No plaintext API keys

### 3. API Key Test

**Test User Experience**:
1. Open app in incognito window
2. Verify: Prompted for API key
3. Enter test key
4. Set TTL to 1 hour
5. Generate a prompt
6. Reload page
7. Verify: Key persists (not prompted again)
8. Wait 1 hour + 1 minute
9. Verify: Key expired (prompted again)

### 4. Content Security Policy Test

```bash
# Test CSP headers
curl -I https://your-site.netlify.app | grep -i "content-security-policy"

# Should show:
# content-security-policy: connect-src 'self' https://generativelanguage.googleapis.com; ...
```

### 5. Bundle Inspection

**Check for API key leakage**:
```bash
# Download production bundle
curl https://your-site.netlify.app/assets/index-*.js -o bundle.js

# Search for API keys
grep -i "AIza" bundle.js
# Should return: nothing

# Search for env variables
grep -i "VITE_GEMINI_API_KEY" bundle.js
# Should return: nothing
```

---

## Monitoring & Maintenance

### User-Side Monitoring

**Privacy Dashboard** (built-in):
- Real-time network activity monitoring
- Export audit logs
- Storage usage tracking
- API key expiration tracking

**Access**: Click "Privacy" button in app

### Host-Side Monitoring

**What to Monitor**:
- ✅ Uptime (static file serving)
- ✅ CDN cache hit rate
- ✅ Bandwidth usage

**What NOT to Monitor**:
- ❌ User behavior
- ❌ API usage
- ❌ Data storage
- ❌ Form submissions

**Why**: You have zero visibility into user data. This is by design.

### Security Updates

**When to Rebuild**:
1. Dependency updates (npm audit)
2. React/Vite security patches
3. Browser API changes
4. CSP policy updates

**Update Process**:
```bash
# 1. Update dependencies
npm update
npm audit fix

# 2. Test locally
npm run dev

# 3. Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

---

## Troubleshooting

### Issue: Users Report "API Key Not Working"

**Diagnosis**:
1. Check if key format is valid
2. Verify key has Gemini API enabled in Google Cloud Console
3. Check billing is enabled
4. Verify no API quota exceeded

**Solution**: Guide users to Google AI Studio to get valid key

---

### Issue: "Content Blocked by CSP"

**Symptoms**: Console errors about blocked resources

**Diagnosis**:
```javascript
// Open DevTools Console
// Look for: "Refused to connect to ... because it violates the following Content Security Policy directive"
```

**Solution**:
1. If blocking legitimate resource: Update CSP in `index.html` and `netlify.toml`
2. If blocking unexpected resource: Investigate for malicious code

---

### Issue: Images/Videos Not Loading

**Symptoms**: Uploaded media not displaying

**Diagnosis**:
- Check IndexedDB quota (DevTools → Application)
- Check CSP allows `blob:` and `data:` URIs

**Solution**:
- CSP already allows: `img-src 'self' data: blob:;`
- If quota exceeded: Guide user to Settings → Data & Cache → Clear

---

### Issue: Network Requests to Unexpected Domains

**🚨 CRITICAL SECURITY ISSUE 🚨**

**Symptoms**: Privacy Dashboard shows requests to domains other than `generativelanguage.googleapis.com`

**Action**:
1. **Immediate**: Take site offline
2. **Investigate**: Check for compromised dependencies
3. **Audit**: Review all npm packages (`npm audit`)
4. **Rebuild**: From clean state
5. **Report**: If malicious package found, report to npm

---

## Best Practices

### 1. No Analytics

**Don't add**:
- Google Analytics
- Plausible
- Mixpanel
- Any tracking scripts

**Why**: Violates privacy-first design

**Alternative**: Use Netlify Analytics (server-side, no client tracking)

### 2. No Embedded API Keys

**Never**:
```javascript
// ❌ DON'T DO THIS
const API_KEY = "AIza..."; // Hardcoded key
```

**Always**:
- Prompt users for their own keys
- Store encrypted in browser
- Provide TTL options

### 3. Regular Security Audits

```bash
# Weekly
npm audit

# Monthly
npm outdated

# Before each deploy
npm audit fix
```

### 4. Transparency

**Provide**:
- Link to this documentation
- Link to Privacy Dashboard
- Link to source code (open source)

**Educate users**:
- How data stays local
- How API keys work
- How to verify privacy

---

## Cost Estimation

### Hosting Costs

**Netlify** (Recommended):
- Free tier: 100GB bandwidth/month
- Estimated users: 10,000 visits/month
- Cost: **$0/month** (under free tier)

**Cloudflare Pages**:
- Free tier: Unlimited bandwidth
- Cost: **$0/month**

**AWS S3 + CloudFront**:
- S3: ~$0.023/GB storage
- CloudFront: ~$0.085/GB transfer
- Estimated: **~$5-10/month** for 10,000 users

### API Costs

**You pay**: $0 (users bring their own keys)

**Users pay**: Variable based on usage
- Gemini API: ~$0.00015 per 1K characters
- Average prompt: ~2K characters = $0.0003
- 100 prompts/month = $0.03/month per user

---

## Support & Community

### Documentation

- **User Guide**: `docs/user_guide.md`
- **Architecture**: `ARCHITECTURE.md`
- **Privacy**: This document

### Getting Help

**For Users**:
1. Check Privacy Dashboard for network issues
2. Review user guide
3. Check browser console for errors

**For Developers**:
1. Review `CLAUDE.md` for project overview
2. Check `ARCHITECTURE.md` for technical details
3. Open issue on GitHub

---

## Legal & Compliance

### Data Protection

**GDPR Compliance**:
- ✅ No data collection
- ✅ No data processing
- ✅ No cookies (except functional)
- ✅ No tracking
- ✅ User data stays in browser

**CCPA Compliance**:
- ✅ No personal information collected
- ✅ No data sold
- ✅ No data shared

### Terms of Service

**Recommended TOS**:
- Users responsible for their own API keys
- Users responsible for their own content
- Host provides software "as-is"
- No warranty, no liability for user actions
- Users must comply with Google's Gemini API ToS

### Privacy Policy

**Template**:
```
This application:
- Runs entirely in your browser
- Stores all data locally (IndexedDB)
- Makes no network requests except to Google Gemini API
- Collects no personal information
- Uses no tracking or analytics
- Requires your own API key (never stored on our servers)

We (the host) cannot see:
- Your prompts
- Your images/videos
- Your API key
- Your usage patterns
- Any of your data

Your privacy is guaranteed by the architecture, not by policy.
```

---

## Conclusion

This deployment guide ensures:
- **Privacy**: Zero data collection by host
- **Security**: Strong CSP, encrypted keys, audit tools
- **Transparency**: Open source, auditable, verifiable
- **Scalability**: Static files scale infinitely
- **Cost**: Free or near-free hosting

For questions or issues, open a GitHub issue or review the documentation.

**Happy deploying!**
