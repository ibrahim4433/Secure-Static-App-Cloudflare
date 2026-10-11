/**
 * Cloudflare Universal Secure Asset Gateway
 * Acts as an edge proxy and secure streaming bridge for:
 * 1. Storage backends (Cloudflare R2, AWS S3, custom origins)
 * 2. Telegram Bot API storage (zero-cost file hosting)
 * 3. Secure token-protected binary releases
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "download";
    const source = url.searchParams.get("source") || "auto"; // "telegram" | "direct" | "auto"

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    try {
      // ----------------------------------------------------
      // MODE 1: Telegram Bot File Streaming (Zero-Cost Storage)
      // ----------------------------------------------------
      const fileId = url.searchParams.get("id");
      if (fileId || source === "telegram") {
        if (!fileId) {
          return new Response("Missing 'id' parameter for Telegram upstream", { status: 400 });
        }

        const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
        if (!BOT_TOKEN) {
          return new Response("Telegram Bot Token is not configured in Worker secrets", { status: 500 });
        }

        // Cache lookup for images and static assets
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        if (action === "image") {
          const cached = await cache.match(cacheKey);
          if (cached) return cached;
        }

        // Request file metadata from Telegram
        const metaRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
        const metaData = await metaRes.json();

        if (!metaData.ok) {
          return new Response(`Upstream Telegram Error: ${metaData.description}`, { status: 400 });
        }

        const filePath = metaData.result.file_path;
        const streamUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
        const fileRes = await fetch(streamUrl);

        return formatStreamResponse(fileRes, url, action, cacheKey, cache);
      }

      // ----------------------------------------------------
      // MODE 2: Direct Upstream Proxy (S3 / R2 / GitHub Releases / Custom Origin)
      // ----------------------------------------------------
      const targetUrl = url.searchParams.get("url");
      if (targetUrl) {
        // Optional upstream authentication via Worker secret
        const headers = new Headers();
        if (env.UPSTREAM_AUTH_BEARER) {
          headers.set("Authorization", `Bearer ${env.UPSTREAM_AUTH_BEARER}`);
        }

        const upstreamRes = await fetch(targetUrl, { headers });
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);

        return formatStreamResponse(upstreamRes, url, action, cacheKey, cache);
      }

      return new Response(
        JSON.stringify({
          service: "Secure-Static-App-Cloudflare Gateway",
          status: "healthy",
          usage: {
            telegram_upstream: "?id=<telegram_file_id>&action=[download|image]&filename=<filename>",
            direct_upstream: "?url=<encoded_target_url>&action=[download|image]&filename=<filename>"
          }
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};

/**
 * Format stream headers and cache responses
 */
async function formatStreamResponse(upstreamRes, url, action, cacheKey, cache) {
  const newHeaders = new Headers(upstreamRes.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");

  const filename = url.searchParams.get("filename") || "asset.bin";

  if (action === "download") {
    newHeaders.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
  } else if (action === "image") {
    newHeaders.set("Cache-Control", "public, s-maxage=86400, max-age=86400");
  }

  const response = new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: newHeaders,
  });

  if (action === "image" && upstreamRes.status === 200) {
    await cache.put(cacheKey, response.clone());
  }

  return response;
}
