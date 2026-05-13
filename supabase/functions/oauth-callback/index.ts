import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Receives the OAuth2 implicit-grant redirect from Google.
// Google redirects the popup here with the token in the URL fragment.
// Fragments are never sent to the server, so we serve an HTML page that
// reads window.location.hash client-side and posts the token back to the opener.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
      },
    });
  }

  const html = `<!doctype html>
<html>
<head><meta charset="UTF-8"><title>Signing in…</title></head>
<body>
<p style="font-family:sans-serif;color:#555;text-align:center;margin-top:60px;font-size:16px">
  Completing sign in…
</p>
<script>
  var params = {};
  window.location.hash.slice(1).split('&').forEach(function(pair) {
    var kv = pair.split('=');
    params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
  });
  var msg = params.error
    ? { type: 'oauth_callback', error: params.error }
    : { type: 'oauth_callback', access_token: params.access_token,
        token_type: params.token_type, expires_in: params.expires_in };
  if (window.opener) {
    window.opener.postMessage(msg, '*');
  }
  window.close();
<\/script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
