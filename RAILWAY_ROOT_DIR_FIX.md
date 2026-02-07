# Fix Railway Root Directory Configuration

## Problem
Railway is trying to install packages that don't exist in your package.json (hono, express, acorn, markdown-it). This suggests Railway might be looking at the wrong directory.

## Solution: Set Root Directory in Railway

### For Backend Service:

1. Go to: https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
2. Click on your service
3. Go to "Settings" tab
4. Under "Source", make sure:
   - **Root Directory** is set to: `backend`
   - If it's not set, click "Edit" and set it to `backend`
5. Save the changes

### For Frontend Service:

1. Go to: https://railway.com/project/51de7b51-98b9-47b3-8ae1-f6f9022e13d2
2. Click on your service
3. Go to "Settings" tab
4. Under "Source", make sure:
   - **Root Directory** is set to: `frontend`
   - If it's not set, click "Edit" and set it to `frontend`
5. Save the changes

## Alternative: Use railway.toml in Root

If Railway is reading from the root, you can create a `railway.toml` at the root level that specifies the services:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd backend && npm run start"
```

But the better solution is to set the Root Directory in Railway dashboard settings.

## Verify

After setting the root directory:
1. Railway will automatically redeploy
2. Check the build logs - it should now run `npm ci` in the correct directory
3. The build should succeed

