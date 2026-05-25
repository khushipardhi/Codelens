/* global process */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Proxy-Key');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed.' } });
  }

  const serverApiKey = process.env.NVIDIA_API_KEY;
  const clientAuthorization = req.headers.authorization;
  const authorization = serverApiKey ? `Bearer ${serverApiKey}` : clientAuthorization;

  if (!authorization) {
    return res.status(401).json({
      error: {
        message: 'NVIDIA_API_KEY is not configured in Vercel, and no client Authorization header was provided.',
      },
    });
  }

  try {
    const upstream = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    return res.send(body);
  } catch (error) {
    return res.status(502).json({
      error: {
        message: error?.message || 'Unable to reach NVIDIA API.',
      },
    });
  }
}
