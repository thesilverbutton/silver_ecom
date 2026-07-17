/**
 * Shiprocket API client.
 * Uses REST API with email/password auth. Token cached and refreshed on 401.
 */

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

interface ShiprocketToken {
  token: string;
  expiresAt: number; // unix ms
}

let cachedToken: ShiprocketToken | null = null;

async function authenticate(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured");
  }

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket auth failed: ${res.status}`);
  }

  const data = (await res.json()) as { token: string };
  // Shiprocket tokens are valid ~10 days; cache for 9 days
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };

  return data.token;
}

export async function getShiprocketToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  return authenticate();
}

/**
 * Make an authenticated request to the Shiprocket API.
 * Retries once on 401 with a fresh token.
 */
export async function shiprocketFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = await getShiprocketToken();

  const makeRequest = (t: string) =>
    fetch(`${SHIPROCKET_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
        ...options.headers,
      },
    });

  let res = await makeRequest(token);

  // Retry on 401 with fresh token
  if (res.status === 401) {
    cachedToken = null;
    token = await authenticate();
    res = await makeRequest(token);
  }

  return res;
}
