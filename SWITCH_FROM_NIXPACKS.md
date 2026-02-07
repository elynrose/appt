# Switch from Deprecated Nixpacks

## Current Status
- Using **Nixpacks** (deprecated)
- Need to switch to a supported buildpack

## Available Buildpack Options in Railway

Railway typically offers these buildpack options:

1. **Railpack** (Recommended)
   - Railway's own buildpack
   - Better WebSocket support
   - Actively maintained

2. **Metal Build Environment**
   - You mentioned using this
   - This is the build environment, not the buildpack
   - You still need to choose a buildpack

3. **Dockerfile**
   - If you have a Dockerfile
   - Full control over build process

## Steps to Switch

### Option 1: Switch to Railpack (Recommended)

1. **In Railway Dashboard:**
   - Go to: https://railway.com/project/5518da0f-8de5-4191-ab0c-912fe4d35c55
   - Click your backend service
   - Go to **Settings** → **Buildpack**

2. **Change Buildpack:**
   - Select **Railpack** (or whatever non-Nixpacks option is available)
   - Save

3. **Redeploy:**
   - Railway will automatically redeploy
   - Or trigger manual redeploy

### Option 2: Use Dockerfile

If Railpack isn't available or doesn't work:

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:20
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5050
   CMD ["node", "src/index.js"]
   ```

2. **In Railway:**
   - Settings → Buildpack
   - Select **Dockerfile**
   - Save and redeploy

## What to Check

After switching buildpacks:

1. **Deployment succeeds** - Check Railway logs
2. **Backend starts** - Should see "Backend listening on 5050"
3. **WebSocket works** - Make a test call and check for `[WebSocket]` logs

## Important Notes

- **Metal Build Environment** is the build infrastructure (faster builds)
- **Buildpack** is what actually builds your app (Nixpacks, Railpack, Dockerfile)
- You can use Metal with any buildpack

## Next Steps

1. **Switch buildpack** from Nixpacks to Railpack (or Dockerfile)
2. **Wait for redeploy**
3. **Test WebSocket** with a call
4. **Check logs** for `[WebSocket]` connection attempts

The forum post suggested Railpack might fix WebSocket issues, so this is worth trying!

