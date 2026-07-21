# MAC Knowledge Store - Static Site

## 🎉 Complete Static Site Conversion - Ready to Use!

This is the complete static version of your Next.js MAC Knowledge Store application, built with Vite + React.

## ✨ Features

- ✅ **100% Identical UI** - Exact same look and feel as the original Next.js app
- ✅ **Client-Side API Calls** - All API calls moved to the client
- ✅ **Static Build** - Generates optimized static files in `dist/` folder
- ✅ **Hot Module Reloading** - Fast development experience
- ✅ **Production Ready** - Deploy anywhere (GitHub Pages, Netlify, Vercel, S3, etc.)
- ✅ **Easy Development** - Clean, modular component structure

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API URL

**Option A:** Create `.env.local` file (recommended)

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**Option B:** Edit `src/config/api.js` directly

### 3. Start Development Server

```bash
npm run dev
```

Opens at http://localhost:3001 with hot reload

### 4. Build for Production

```bash
npm run build
```

Static files will be in `dist/` folder - this is your deployable static site!

### 5. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
static-site/
├── src/
│   ├── components/
│   │   ├── icons/
│   │   │   └── Icons.jsx              # All Heroicon SVG components
│   │   ├── ui/
│   │   │   ├── Modal.jsx              # Modal dialog component
│   │   │   └── Accordion.jsx          # Collapsible accordion
│   │   ├── CreateStore.jsx            # Create knowledge store
│   │   ├── UploadDocument.jsx         # Upload documents
│   │   ├── CrawlWebsite.jsx           # Website crawler
│   │   ├── TabsCard.jsx               # Tabbed interface
│   │   ├── QueryStore.jsx             # Query interface with chat
│   │   ├── VoiceRecorder.jsx          # Voice input
│   │   └── LLMSettingsPanel.jsx       # LLM configuration panel
│   ├── config/
│   │   └── api.js                     # API configuration
│   ├── types/
│   │   └── types.js                   # Type definitions
│   ├── App.jsx                        # Main app component
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Global styles
├── public/
│   └── mac-logo.png                   # Logo
├── index.html                         # HTML entry point
├── vite.config.js                     # Vite configuration
├── tailwind.config.cjs                # Tailwind CSS config
├── postcss.config.cjs                 # PostCSS config
├── package.json                       # Dependencies
└── README.md                          # This file
```

## 🔧 API Configuration

### Environment Variables

Set `VITE_API_BASE_URL` to your backend URL:

```env
# Development
VITE_API_BASE_URL=http://localhost:3000

# Production
VITE_API_BASE_URL=https://api.yourbackend.com

# Same origin (empty string)
VITE_API_BASE_URL=
```

### API Endpoints

The app calls these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/create-store` | POST | Create knowledge store |
| `/api/get-store` | GET | List all stores |
| `/api/upload-document` | POST | Upload document |
| `/api/crawl-website` | POST | Crawl website |
| `/api/query-store` | POST | Query store |
| `/api/upload-audio` | POST | Voice input |
| `/api/get-tools` | GET | Get tools |
| `/api/add-tools` | POST | Add tool |
| `/api/token-usage` | POST | Log usage |

## ⚠️ Backend CORS Requirements

Your backend must allow CORS from the frontend origin:

**Express.js Example:**

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001', // or your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'X-LLM-Type',
    'X-LLM-Model',
    'X-Temperature',
    'X-Max-Tokens',
    'X-Input-Limit',
    'X-Chat-Memory',
    'X-Max-Messages',
    'X-Toxicity-Detection',
    'X-Grounded',
    'X-Pre-Decoration',
    'X-Post-Decoration',
    'X-RAG',
    'X-LLM-Settings'
  ]
}));
```

## 📦 Deployment

### Build Static Site

```bash
npm run build
```

This creates optimized static files in `dist/` folder.

### Deploy to Platforms

**GitHub Pages:**
```bash
npm run build
# Push dist/ folder to gh-pages branch
```

**Netlify:**
```bash
# Connect your repo, set build command: npm run build
# Set publish directory: dist
```

**Vercel:**
```bash
vercel --prod
# Or connect via Vercel dashboard
```

**AWS S3:**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

**Any Static Host:**
Upload the `dist/` folder contents.

## 🎨 Development

### Component Development

All components are in `src/components/`. Edit any file and see changes instantly with hot reload.

### Adding New Components

1. Create file in `src/components/`
2. Import in `App.jsx`
3. Use component

### Styling

Uses Tailwind CSS. Edit `tailwind.config.cjs` for customization.

## 🔍 Troubleshooting

### API Calls Failing

1. Check `VITE_API_BASE_URL` is set correctly
2. Verify backend CORS is configured
3. Check browser console for errors
4. Ensure backend is running

### Build Errors

1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf dist node_modules/.vite`
3. Check Node.js version (requires Node 16+)

### UI Differences

The UI should be 100% identical. If you notice differences:
1. Check browser console for errors
2. Verify all CDN libraries loaded (Recharts, React Markdown)
3. Compare with original Next.js app side-by-side

## 📊 What's Different from Next.js Version

✅ **Same:**
- Exact same UI/UX
- All functionality preserved
- Same components and logic

🔄 **Changed:**
- No server-side rendering (pure client-side)
- API calls from browser (not server)
- Built with Vite instead of Next.js
- File extensions: `.jsx` instead of `.tsx`
- No Next.js Image component (uses regular `<img>`)

## 🎯 Future Development

### Option 1: Keep Developing Here
- Edit files in `src/`
- Run `npm run dev` for testing
- Build with `npm run build` for deployment

### Option 2: Keep Both Versions
- Develop in Next.js version
- Periodically update static version
- Deploy static version for production

## 📝 Scripts

```bash
npm run dev      # Start development server (http://localhost:3001)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

Same as original Next.js application.

## 🤝 Contributing

This is a static conversion. For major changes, consider updating the original Next.js app first, then regenerating the static version.

---

**Ready to deploy! 🚀**

The `dist/` folder after `npm run build` contains your complete static site.
Upload it anywhere and it will work!
