# Environment Indicator

## 📍 What You'll See

A small badge in the **bottom-right corner** showing which API environment is active:

### Option 1: Local (localhost:8081)
```
💻 Local  localhost:8081
```
- **Color:** Green
- **Shows when:** `VITE_API_BASE_URL=http://localhost:8081`

### Option 2: CloudHub (Remote)
```
☁️ CloudHub  your-app.cloudhub.io
```
- **Color:** Purple
- **Shows when:** `VITE_API_BASE_URL=https://your-app.cloudhub.io`

### Option 3: Same Origin (Deployed with MuleSoft)
```
🔗 Same Origin
```
- **Color:** Blue
- **Shows when:** `VITE_API_BASE_URL=` (empty)

---

## 🎨 Features

- ✅ **Always visible** - Bottom-right corner
- ✅ **Small and unobtrusive** - Doesn't block content
- ✅ **Color-coded** - Easy to identify at a glance
- ✅ **Hover tooltip** - Shows full URL
- ✅ **No interaction needed** - Just displays info

---

## 🔍 How to Use

1. **Deploy with different .env.local settings**
2. **Look at bottom-right corner**
3. **Verify you're using the right environment**

### Example Workflow

```bash
# Switch to Local
echo "VITE_API_BASE_URL=http://localhost:8081" > .env.local
npm run deploy

# Check UI - should show: 💻 Local  localhost:8081
```

```bash
# Switch to CloudHub
echo "VITE_API_BASE_URL=https://your-app.cloudhub.io" > .env.local
npm run deploy

# Check UI - should show: ☁️ CloudHub  your-app.cloudhub.io
```

```bash
# Switch to Same Origin
echo "VITE_API_BASE_URL=" > .env.local
npm run deploy

# Check UI - should show: 🔗 Same Origin
```

---

## 💡 Benefits

- ✅ **No confusion** - Always know which backend you're using
- ✅ **Quick verification** - Instant visual feedback
- ✅ **Prevents mistakes** - Won't accidentally test against wrong environment
- ✅ **Debugging aid** - First thing to check when something doesn't work

---

## 🎯 What It Looks Like

The indicator appears in the bottom-right as a small, semi-transparent badge:

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         Your Application            │
│                                     │
│                          💻 Local   │
│                    localhost:8081   │
└─────────────────────────────────────┘
```

**Position:** Fixed bottom-right  
**Size:** Compact, just enough to read  
**Transparency:** Slightly see-through  
**Always on top:** Z-index 50

---

## 🔧 Customization

If you want to move or style it differently, edit:
```
/src/components/EnvironmentIndicator.jsx
```

Change position:
```javascript
className="fixed bottom-4 right-4"  // Current
className="fixed top-4 right-4"     // Top right
className="fixed bottom-4 left-4"   // Bottom left
```

---

**Now you'll always know which environment you're connected to!** 🎯

