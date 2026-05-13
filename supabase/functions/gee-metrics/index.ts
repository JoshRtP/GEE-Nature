import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEE_BASE = "https://earthengine.googleapis.com/v1";
const CLOUD_PROJECT = "gen-lang-client-0499108456";
const ASSET_ID = "projects/gen-lang-client-0499108456/assets/EMEA_France_26";

// Fetches a short-lived access token via service account JWT
async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/earthengine.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const sigInput = `${enc(header)}.${enc(payload)}`;

  // Import the RSA private key
  const keyData = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(sigInput)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const jwt = `${sigInput}.${sigB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json() as { access_token: string };
  return tokenData.access_token;
}

// Fetches feature collection info from GEE
async function fetchFeatureCollection(token: string) {
  const url = `${GEE_BASE}/${ASSET_ID}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GEE asset fetch failed: ${res.status} ${err}`);
  }
  return res.json();
}

// Runs a GEE computation to get NDVI stats per field
async function computeNDVIStats(token: string, featureIds: string[]) {
  // Use Sentinel-2 SR harmonized collection
  const script = {
    expression: {
      functionInvocationValue: {
        functionName: "Collection.map",
        arguments: {
          collection: {
            functionInvocationValue: {
              functionName: "Image.clipToCollection",
              arguments: {
                input: {
                  functionInvocationValue: {
                    functionName: "ImageCollection.first",
                    arguments: {
                      collection: {
                        functionInvocationValue: {
                          functionName: "ImageCollection.filterDate",
                          arguments: {
                            collection: {
                              functionInvocationValue: {
                                functionName: "ImageCollection.load",
                                arguments: {
                                  id: { constantValue: "COPERNICUS/S2_SR_HARMONIZED" },
                                },
                              },
                            },
                            start: { constantValue: "2024-04-01" },
                            end: { constantValue: "2024-09-30" },
                          },
                        },
                      },
                    },
                  },
                },
                collection: {
                  functionInvocationValue: {
                    functionName: "FeatureCollection.load",
                    arguments: {
                      id: { constantValue: ASSET_ID },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const url = `${GEE_BASE}/projects/${CLOUD_PROJECT}:computeValue`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(script),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GEE compute failed: ${res.status} ${err}`);
  }
  return res.json();
}

// Gets feature geometries via getPixels / getFeatures
async function getFeatures(token: string) {
  const url = `${GEE_BASE}/projects/${CLOUD_PROJECT}/value:compute`;
  const body = {
    expression: {
      functionInvocationValue: {
        functionName: "FeatureCollection.toList",
        arguments: {
          collection: {
            functionInvocationValue: {
              functionName: "FeatureCollection.load",
              arguments: {
                id: { constantValue: ASSET_ID },
              },
            },
          },
          count: { constantValue: 100 },
        },
      },
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GEE getFeatures failed: ${res.status} ${err}`);
  }
  return res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get("GEE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({
          error: "GEE_SERVICE_ACCOUNT_JSON secret not configured",
          hint: "Add your Google service account JSON as the GEE_SERVICE_ACCOUNT_JSON secret in Supabase Edge Function secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await getAccessToken(serviceAccountJson);

    const [assetInfo, features] = await Promise.all([
      fetchFeatureCollection(token),
      getFeatures(token),
    ]);

    return new Response(
      JSON.stringify({ assetInfo, features }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
