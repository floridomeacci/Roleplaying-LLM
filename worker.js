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
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const url = new URL(request.url);
      const replicateApiKey = env.REPLICATE_API_TOKEN;

      if (!replicateApiKey) {
        throw new Error('Replicate API token not configured');
      }

      // Handle root path for profile image generation
      if (url.pathname === '/') {
        if (request.method === 'POST') {
          const body = await request.json();
          
          const replicateRequest = new Request('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
              'Authorization': `Token ${replicateApiKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'wait'
            },
            body: JSON.stringify({
              version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
              input: {
                prompt: body.prompt,
                width: body.width || 1024,
                height: body.height || 1024,
                scheduler: body.scheduler || "K_EULER",
                num_outputs: body.num_outputs || 1,
                guidance_scale: body.guidance_scale || 0,
                negative_prompt: body.negative_prompt || "worst quality, low quality, nsfw, nude, naked, suggestive, inappropriate, adult content, explicit content, violence, gore, blood, disturbing content, offensive content, underwear, swimsuit, bikini, lingerie, cleavage, revealing clothing, sexually suggestive, inappropriate poses",
                num_inference_steps: body.num_inference_steps || 4
              }
            })
          });

          const response = await fetch(replicateRequest);
          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          return new Response(JSON.stringify(data), {
            headers: corsHeaders
          });
        }
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
              'Prefer': 'wait'
            },
            body: JSON.stringify({
              version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
              input: body
            }),
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
        const replicateUrl = 'https://api.replicate.com/v1/predictions';

        let replicateRequest;
        if (request.method === 'POST') {
          const body = await request.json();
          
          replicateRequest = new Request(replicateUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${replicateApiKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'wait'
            },
            body: JSON.stringify({
              version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
              input: {
                prompt: body.input.prompt,
                width: body.input.width || 1024,
                height: body.input.height || 1024,
                scheduler: body.input.scheduler || "K_EULER",
                num_outputs: body.input.num_outputs || 1,
                guidance_scale: body.input.guidance_scale || 0,
                negative_prompt: body.input.negative_prompt || "worst quality, low quality, nsfw, nude, naked, suggestive, inappropriate, adult content, explicit content, violence, gore, blood, disturbing content, offensive content, underwear, swimsuit, bikini, lingerie, cleavage, revealing clothing, sexually suggestive, inappropriate poses",
                num_inference_steps: body.input.num_inference_steps || 4
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