# 🔧 Fixed: Duplicate CORS Headers Issue

## Problem
When creating a store, you got the error:
```
"Header Access-Control-Allow-Origin does not support multiple values"
```

The store was created successfully, but the error appeared in the UI.

## Root Cause
The CORS headers were being set in the MuleSoft flows' `<http:response>` section. However, since you're serving both the **UI and API from the same origin** (`http://localhost:8081`), you don't need CORS headers at all!

**Same-origin requests don't require CORS.**

## Solution Applied

Removed all CORS header configurations from these flows:
- ✅ `mac-create-store` (line ~27-36)
- ✅ `mac-add-doc-to-store` (line ~41-50)
- ✅ `mac-add-doc-to-store-url` (line ~599-608)

**Before:**
```xml
<http:listener path="/store" allowedMethods="POST">
  <http:response>
    <http:headers><![CDATA[#[output application/java
---
{
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': 'true'
}]]]></http:headers>
  </http:response>
</http:listener>
```

**After:**
```xml
<http:listener path="/store" allowedMethods="POST" config-ref="HTTP_Listener_config" />
```

Clean and simple! No CORS configuration needed for same-origin requests.

## Why This Works

### Same-Origin Architecture
```
Browser → http://localhost:8081/web/        (UI)
       ↓
       → http://localhost:8081/store        (API)
          Same origin = No CORS needed! ✅
```

### Cross-Origin Would Need CORS
```
Browser → http://localhost:3001/            (UI - Vite dev server)
       ↓
       → http://localhost:8081/store        (API - MuleSoft)
          Different origins = CORS needed ⚠️
```

## Testing

**Restart your MuleSoft application** in Anypoint Studio and test:

1. Open `http://localhost:8081/web/`
2. Create a new knowledge store
3. Should work **without any errors** ✅
4. The error message should be gone!

## If You Use Standalone Dev Server

If you're using `npm run dev` (port 3001) to develop with the Vite dev server, you would need CORS. But since you're deploying the static site WITH MuleSoft (same origin), CORS is not needed and was causing the duplicate header issue.

## Summary

✅ **Fixed:** Removed all CORS headers from MuleSoft flows  
✅ **Why:** Same-origin requests don't need CORS  
✅ **Result:** No more "multiple values" error  
✅ **Benefit:** Cleaner, simpler configuration  

**Next step:** Restart MuleSoft and test! 🚀

