import { AuthUser } from "./auth";

const BACKEND = "https://smartgumastha-backend-production.up.railway.app";

/**
 * Fetch from HMS backend with automatic token refresh on 401.
 * If hmsToken gets a 401, exchanges partner token for a fresh HMS token and retries.
 */
export async function hmsFetch(
  url: string,
  auth: AuthUser,
  init?: RequestInit
): Promise<Response> {
  var token = auth.hmsToken || auth.token;
  var headers = { ...init?.headers, Authorization: `Bearer ${token}` } as Record<string, string>;

  var res = await fetch(url, { ...init, headers });

  // If 401 and we have a partner token, try to exchange for fresh HMS token
  if (res.status === 401 && auth.token) {
    console.log("[hms-fetch] Got 401, attempting token refresh via partner-auth/hms-token");
    try {
      var exchangeRes = await fetch(`${BACKEND}/api/presence/partner-auth/hms-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: "{}",
      });
      var exchangeData = await exchangeRes.json();

      if (exchangeData.success && exchangeData.hms_token) {
        console.log("[hms-fetch] Token refresh succeeded, retrying request");
        headers.Authorization = `Bearer ${exchangeData.hms_token}`;
        res = await fetch(url, { ...init, headers });
      } else {
        console.log("[hms-fetch] Token refresh failed:", exchangeData.error || "no hms_token");
      }
    } catch (err) {
      console.error("[hms-fetch] Token refresh exception:", err instanceof Error ? err.message : err);
    }
  }

  return res;
}
