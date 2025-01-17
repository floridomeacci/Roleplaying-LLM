export default {
  async fetch(request, env) {
    // CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    try {
      // List R2 objects
      if (url.pathname === '/list') {
        const objects = await env.ANIMATIONS.list();
        return new Response(JSON.stringify({
          files: objects.objects.map(obj => ({
            name: obj.key,
            size: obj.size,
            uploaded: obj.uploaded,
          }))
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      // Get specific R2 object
      if (url.pathname.startsWith('/file/')) {
        const key = url.pathname.replace('/file/', '');
        const object = await env.ANIMATIONS.get(key);

        if (!object) {
          return new Response('File not found', {
            status: 404,
            headers: corsHeaders
          });
        }

        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000'
          }
        });
      }

      // Forward request to animation API
      if (url.pathname.startsWith('/api/')) {
        const apiUrl = 'https://tamagotchianimation.brancaskitchen.workers.dev' + url.pathname;
        
        let apiRequest;
        if (request.method === 'POST') {
          const body = await request.json();
          apiRequest = new Request(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });
        } else {
          apiRequest = new Request(apiUrl, {
            method: request.method,
            headers: request.headers
          });
        }

        const response = await fetch(apiRequest);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      return new Response('Not found', {
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};