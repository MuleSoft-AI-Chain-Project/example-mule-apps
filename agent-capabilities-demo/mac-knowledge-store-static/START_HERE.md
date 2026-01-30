# 🎯 Quick Start Guide

## What You Have Now

Your Next.js app is now a **static React site** integrated with your **MuleSoft backend**!

## 🚀 Start Using It Right Now

### Step 1: Restart MuleSoft
In **Anypoint Studio**:
- Right-click your project
- Select "Run As" → "Mule Application"

### Step 2: Open Your App
```bash
open http://localhost:8081/web/
```

**That's it!** Your app should be running with:
- ✅ Black UI with all features
- ✅ Working API calls
- ✅ No CORS errors
- ✅ Same functionality as before

---

## 🛠️ Making Changes

### Quick Deploy (One Command)
```bash
cd /Users/jreizevoort/Downloads/Temp/advanced-ui/static-site
npm run deploy
```

Then restart MuleSoft in Anypoint Studio.

### Development Mode (Hot Reload)
```bash
cd /Users/jreizevoort/Downloads/Temp/advanced-ui/static-site

# One-time setup
echo "VITE_API_BASE_URL=http://localhost:8081" > .env.local

# Start dev server (restarts instantly on changes)
npm run dev
```

Opens at `http://localhost:3001` with hot-reload!

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│  MuleSoft Application (Port 8081)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  HTTP Listeners:                                    │
│  ├─ /web/*        → Static UI (React)              │
│  ├─ /store        → Create store API               │
│  ├─ /getstores    → List stores API                │
│  ├─ /doc          → Upload document API            │
│  ├─ /crawl        → Crawl website API              │
│  ├─ /query        → Query store API                │
│  ├─ /tools        → Tools API                      │
│  └─ /*            → CORS interceptor (OPTIONS)     │
│                                                     │
└─────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
         │  Serves UI                   │  API Calls
         │  (index.html + assets)       │  (JSON)
         │                              │
         └──────────────────────────────┘
              Same Origin - No CORS!
```

---

## 🎨 What Was Changed

### From This (Next.js):
```
Browser → Next.js Server → MuleSoft API
          (API routes)
```

### To This (Static):
```
Browser → MuleSoft (serves UI + API)
          (same origin)
```

**Benefits:**
- ✅ Simpler architecture
- ✅ No CORS issues
- ✅ Single deployment
- ✅ Production-ready

---

## 📁 Project Locations

### Edit Source Code Here:
```
/Users/jreizevoort/Downloads/Temp/advanced-ui/static-site/src/
```

### Deployed Files Here:
```
/Users/jreizevoort/AnypointStudio/workspaces/721/advanced-agent/
  advanced-agent-1.1.4-mule-application/src/main/resources/webapp/
```

### MuleSoft Config Here:
```
/Users/jreizevoort/AnypointStudio/workspaces/721/advanced-agent/
  advanced-agent-1.1.4-mule-application/src/main/mule/
```

---

## 🧪 Test It Now!

1. ✅ **Restart MuleSoft** in Anypoint Studio
2. ✅ **Open** `http://localhost:8081/web/`
3. ✅ **Create a store** - should work without errors!
4. ✅ **Upload a document** - test the file upload
5. ✅ **Query the store** - test the chat interface

---

## 📚 More Info

- **`INTEGRATION_COMPLETE.md`** - Detailed completion report
- **`DEPLOY_WITH_MULE.md`** - Full deployment guide
- **`README.md`** - Getting started guide

---

## 🆘 Troubleshooting

### Blank page?
- Check files exist in `/src/main/resources/webapp/`
- Restart MuleSoft

### API not working?
- Check browser console (F12)
- Check MuleSoft console in Studio
- Verify endpoints match in both places

### Changes not showing?
```bash
npm run deploy
# Then restart MuleSoft
```

---

## ✨ You're All Set!

**Next step:** Restart MuleSoft and open `http://localhost:8081/web/` 🚀

