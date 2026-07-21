# Deploy Static Site with MuleSoft Backend

This guide explains how to deploy the static site alongside your MuleSoft application so both UI and API are served from the same origin.

## 🎯 Architecture

```
MuleSoft Application (Port 8081)
├── /web/*          → Static UI (React app)
├── /store          → Create knowledge store API
├── /getstores      → List stores API
├── /doc            → Upload document API
├── /crawl          → Crawl website API
├── /query          → Query store API
└── /tools          → Tools API
```

**Benefits of this setup:**
- ✅ No CORS issues (same origin)
- ✅ Single deployment
- ✅ Production-ready
- ✅ Easy to maintain

## 🚀 Quick Deploy

### 1. Build and Deploy in One Command

```bash
cd /Users/jreizevoort/Downloads/Temp/advanced-ui/static-site
./deploy-to-mule.sh
```

This script will:
1. Build the static site
2. Clear the old webapp directory
3. Copy new files to MuleSoft's webapp folder
4. Show you the next steps

### 2. Restart MuleSoft Application

In **Anypoint Studio**:
- Right-click your project
- Select "Run As" → "Mule Application"
- Or click the green "Run" button

### 3. Access Your Application

Open your browser to:
```
http://localhost:8081/web/
```

**Note the trailing slash!** The MuleSoft listener uses `/web/*` pattern.

## 🛠️ Development Workflow

### Option A: Develop Standalone (with API calls to MuleSoft)

**Terminal 1 - Run MuleSoft Backend:**
```bash
# Start in Anypoint Studio
```

**Terminal 2 - Run Static Site Dev Server:**
```bash
cd /Users/jreizevoort/Downloads/Temp/advanced-ui/static-site

# Create .env.local with backend URL
echo "VITE_API_BASE_URL=http://localhost:8081" > .env.local

# Start dev server
npm run dev
# Opens at http://localhost:3001
```

This gives you:
- ✅ Hot reload for UI changes
- ✅ Live API calls to MuleSoft
- ⚠️ Requires CORS (already configured in MuleSoft)

### Option B: Develop Integrated (deploy after each change)

```bash
# Make changes to React components in src/
vim src/App.jsx

# Build and deploy
./deploy-to-mule.sh

# Restart MuleSoft in Anypoint Studio
# Refresh browser at http://localhost:8081/web/
```

**Recommended:** Use Option A during active development, Option B for testing production build.

## 📁 File Locations

### Static Site Source
```
/Users/jreizevoort/Downloads/Temp/advanced-ui/static-site/
├── src/                    # React source code
│   ├── components/         # UI components
│   ├── config/            # API configuration
│   └── main.jsx           # Entry point
├── dist/                   # Built static files (after npm run build)
└── deploy-to-mule.sh      # Deployment script
```

### MuleSoft Deployment Target
```
/Users/jreizevoort/AnypointStudio/workspaces/721/advanced-agent/
└── advanced-agent-1.1.4-mule-application/
    └── src/main/resources/webapp/     # ← Static files deployed here
        ├── index.html
        └── assets/
            ├── index-xxx.js
            ├── index-xxx.css
            └── mac-logo-xxx.png
```

### MuleSoft Configuration
```
/Users/jreizevoort/AnypointStudio/workspaces/721/advanced-agent/
└── advanced-agent-1.1.4-mule-application/
    └── src/main/mule/
        ├── mac-vector-store-demo.xml  # Main flows
        └── global.xml                  # Global config
```

## 🔧 Configuration Details

### API Configuration (Static Site)

The static site is configured to work with **same-origin** API calls when deployed with MuleSoft:

**File:** `src/config/api.js`
```javascript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',  // Empty = same origin
  endpoints: {
    createStore: '/store',
    getStore: '/getstores',
    // ... etc
  }
};
```

### CORS Configuration (MuleSoft)

The MuleSoft application includes a **generic CORS interceptor** that handles all OPTIONS preflight requests:

**File:** `src/main/mule/mac-vector-store-demo.xml`
```xml
<flow name="cors-interceptor-flow">
  <http:listener path="/*" allowedMethods="OPTIONS" />
  <!-- Returns CORS headers for all OPTIONS requests -->
</flow>
```

All API flows also include CORS response headers.

## 🧪 Testing

### Test Static Deployment
```bash
# Deploy
./deploy-to-mule.sh

# Start MuleSoft in Anypoint Studio

# Test in browser
open http://localhost:8081/web/
```

### Test Standalone Development
```bash
# Terminal 1: MuleSoft running in Studio

# Terminal 2:
cd /Users/jreizevoort/Downloads/Temp/advanced-ui/static-site
echo "VITE_API_BASE_URL=http://localhost:8081" > .env.local
npm run dev
```

## 🐛 Troubleshooting

### "Blank page at /web/"
- Check that files exist in `/src/main/resources/webapp/`
- Ensure MuleSoft application is running
- Check Anypoint Studio console for errors

### "CORS errors"
- When using standalone dev server, make sure CORS interceptor is in MuleSoft XML
- Check that OPTIONS requests return 200 with CORS headers
- Verify `.env.local` has correct `VITE_API_BASE_URL`

### "404 on API calls"
- When deployed with MuleSoft: Make sure `baseURL` is empty string
- When standalone: Make sure `.env.local` has `VITE_API_BASE_URL=http://localhost:8081`
- Check MuleSoft console for actual endpoint paths

### "Changes not showing up"
- Run `./deploy-to-mule.sh` to rebuild and deploy
- Hard refresh browser (Cmd+Shift+R on Mac)
- Check browser DevTools → Network tab to see if new files are loaded

## 📝 Making Changes

### Updating UI Components

1. **Edit source files:**
   ```bash
   cd /Users/jreizevoort/Downloads/Temp/advanced-ui/static-site
   vim src/components/CreateStore.jsx
   ```

2. **Deploy changes:**
   ```bash
   ./deploy-to-mule.sh
   ```

3. **Restart MuleSoft** in Anypoint Studio

4. **Refresh browser** at `http://localhost:8081/web/`

### Updating API Endpoints

1. **Edit MuleSoft flow:**
   ```bash
   # In Anypoint Studio, edit:
   # src/main/mule/mac-vector-store-demo.xml
   ```

2. **If you change paths or responses, update frontend config:**
   ```bash
   vim src/config/api.js
   ```

3. **Deploy:**
   ```bash
   ./deploy-to-mule.sh
   ```

## 🚀 Production Deployment

For production deployment:

1. **Update baseURL for production:**
   ```bash
   # Option 1: Environment variable
   VITE_API_BASE_URL=https://your-production-domain.com npm run build
   
   # Option 2: Edit config (not recommended)
   vim src/config/api.js
   # Change: baseURL: import.meta.env.VITE_API_BASE_URL || ''
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy to CloudHub or RTF:**
   - Copy `dist/` contents to MuleSoft project's `/src/main/resources/webapp/`
   - Deploy MuleSoft application as usual
   - Access at: `https://your-app.cloudhub.io/web/`

## 💡 Tips

- **Fast development:** Use `npm run dev` with `.env.local` pointing to MuleSoft
- **Testing production build:** Use `./deploy-to-mule.sh` and test at `/web/`
- **Version control:** Only commit `src/` folder, not `dist/` or `webapp/`
- **API changes:** Update both MuleSoft XML and `src/config/api.js` together

