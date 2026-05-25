# CodeLens Vercel Deployment

## Required Vercel Settings

Set this server-side environment variable in Vercel:

```txt
NVIDIA_API_KEY=your_nvidia_api_key_here
```

Do not expose the NVIDIA key as `VITE_NVIDIA_API_KEY` in production unless you intentionally want a browser-side key.

## Build Settings

Vercel reads these from `vercel.json`:

```txt
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

## Production AI Proxy

The frontend uses:

```txt
VITE_API_PROXY_URL=/api/nvidia/chat/completions
```

Requests are forwarded through:

```txt
api/nvidia/chat/completions.js
api/nvidia/models.js
```

This keeps the NVIDIA API key on the Vercel serverless side instead of placing it in the React bundle.

## Local Verification

```txt
npm run build
npm run lint
```
