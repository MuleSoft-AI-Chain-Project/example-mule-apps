# Switching Between Local and CloudHub APIs

## 📝 How It Works

You can easily switch between local and CloudHub APIs using the `.env.local` file.

## 🔧 Setup

### 1. Create the .env.local file

Create a file named `.env.local` in the project root:

```bash
cd /Users/jreizevoort/Downloads/Temp/mac-knowledge-store-static
touch .env.local
```

### 2. Add your URLs

Edit `.env.local` with this content:

```env
# ============================================
# API Base URL Configuration
# ============================================
# Uncomment ONE of the following options:

# Option 1: Local MuleSoft (localhost)
VITE_API_BASE_URL=http://localhost:8081

# Option 2: CloudHub (remote)
# VITE_API_BASE_URL=https://your-app.cloudhub.io

# Option 3: Same origin (when deployed with MuleSoft)
# VITE_API_BASE_URL=
```

## 🔄 Switching Between Environments

### To Use Local (localhost:8081)

Edit `.env.local`:
```env
# Local is ACTIVE
VITE_API_BASE_URL=http://localhost:8081

# CloudHub is COMMENTED OUT
# VITE_API_BASE_URL=https://your-app.cloudhub.io
```

### To Use CloudHub

Edit `.env.local`:
```env
# Local is COMMENTED OUT
# VITE_API_BASE_URL=http://localhost:8081

# CloudHub is ACTIVE
VITE_API_BASE_URL=https://your-app.cloudhub.io
```

### After Changing

**In Development:**
```bash
# Stop dev server (Ctrl+C)
# Start again
npm run dev
```

**For Production:**
```bash
# Rebuild with new URL
npm run build
npm run deploy
```

## 🎯 Quick Switch Commands

### Switch to Local
```bash
# Edit .env.local and uncomment local URL
vim .env.local
# Restart dev server
npm run dev
```

### Switch to CloudHub
```bash
# Edit .env.local and uncomment CloudHub URL
vim .env.local
# Restart dev server
npm run dev
```

## 💡 Tips

1. **`.env.local` is gitignored** - Your local configuration won't be committed
2. **Only one URL active** - Make sure only one `VITE_API_BASE_URL` line is uncommented
3. **Restart required** - Dev server must be restarted after changing `.env.local`
4. **Check current URL** - Open browser console and check Network tab to see which URL is being called

## 🔍 Verify Current Configuration

Add this temporarily to `src/App.jsx` to see current API URL:

```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
```

Check browser console (F12) to see which URL is active.

## 📋 Example Workflows

### Daily Work (Local)
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8081

npm run dev
# Work locally, MuleSoft running on localhost
```

### Testing CloudHub
```bash
# .env.local  
VITE_API_BASE_URL=https://your-app.cloudhub.io

npm run dev
# Test against CloudHub deployment
```

### Deploy to MuleSoft (Same Origin)
```bash
# .env.local
VITE_API_BASE_URL=

npm run deploy
# Deployed with MuleSoft, uses same origin
```

---

**Simple, flexible, no code changes needed - just edit `.env.local`!** 🎯

