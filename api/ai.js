/* global process */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method not allowed.' } });
  }

  // 1. Read API key from server environment
  const serverApiKey = process.env.NVIDIA_API_KEY;
  
  // 2. Fallback to client provided key if server key is missing (for local testing without .env if desired)
  const clientAuthorization = req.headers.authorization;
  const authorization = serverApiKey ? `Bearer ${serverApiKey}` : clientAuthorization;

  if (!authorization || authorization === 'Bearer ') {
    return res.status(401).json({
      error: {
        message: 'Missing server NVIDIA_API_KEY. Please configure NVIDIA_API_KEY in Vercel Environment Variables.',
      },
    });
  }

  // Determine endpoint based on query param ?test=true
  const isTest = req.query.test === 'true' || req.method === 'GET';
  const endpoint = isTest ? `${NVIDIA_BASE_URL}/models` : `${NVIDIA_BASE_URL}/chat/completions`;
  const method = isTest ? 'GET' : 'POST';

  try {
    const fetchOptions = {
      method,
      headers: {
        'Authorization': authorization,
      }
    };
    
    if (method === 'POST') {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(req.body || {});
    }

    // Abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
    fetchOptions.signal = controller.signal;

    const upstream = await fetch(endpoint, fetchOptions);
    clearTimeout(timeoutId);

    // Forward status code
    res.status(upstream.status);

    if (upstream.status === 401) {
       return res.json({ error: { message: 'Invalid API key provided to NVIDIA.' } });
    }

    const contentType = upstream.headers.get('content-type') || '';
    
    // Parse response
    let body;
    const textBody = await upstream.text();
    
    if (contentType.includes('application/json')) {
      try {
        body = JSON.parse(textBody);
      } catch (parseError) {
        return res.status(500).json({ error: { message: 'Response parsing failed. Upstream returned invalid JSON.' } });
      }
      return res.json(body);
    } else {
      // If it's not JSON, return as text
      res.setHeader('Content-Type', 'text/plain');
      return res.send(textBody);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: {
          message: 'NVIDIA timeout. The API took too long to respond.',
        },
      });
    }
    
    return res.status(502).json({
      error: {
        message: 'Network unavailable. Failed to reach NVIDIA API.',
        details: error.message
      },
    });
  }
}
