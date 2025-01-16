export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };

    try {
      const url = new URL(request.url);
      const replicateApiKey = env.REPLICATE_API_TOKEN;

      if (!replicateApiKey) {
        throw new Error('Replicate API token not configured');
      }

      // Original API endpoint
      if (url.pathname.startsWith('/api/predictions')) {
        const replicateUrl = url.pathname === '/api/predictions' 
          ? 'https://api.replicate.com/v1/predictions'
          : `https://api.replicate.com/v1/predictions/${url.pathname.split('/').pop()}`;

        let replicateRequest;
        if (request.method === 'POST') {
          const body = await request.json();
          
          replicateRequest = new Request(replicateUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${replicateApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
        } else {
          replicateRequest = new Request(replicateUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${replicateApiKey}`,
            },
          });
        }

        const response = await fetch(replicateRequest);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return new Response(JSON.stringify(data), {
          headers: corsHeaders,
        });
      }

      // Recraft API endpoint
      if (url.pathname.startsWith('/api/recraft/predictions')) {
        const replicateUrl = 'https://api.replicate.com/v1/models/recraft-ai/recraft-v3/predictions';

        let replicateRequest;
        if (request.method === 'POST') {
          const body = await request.json();
          
          replicateRequest = new Request(replicateUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${replicateApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: {
                prompt: body.input.prompt,
                size: body.input.size || "1365x1024",
                style: "any"
              }
            }),
          });
        } else {
          const predictionId = url.pathname.split('/').pop();
          replicateRequest = new Request(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${replicateApiKey}`,
            },
          });
        }

        const response = await fetch(replicateRequest);
        const data = await response.json();

        if (data.error || data.detail) {
          throw new Error(data.error || data.detail);
        }

        return new Response(JSON.stringify(data), {
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: corsHeaders,
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};