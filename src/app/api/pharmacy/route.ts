import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { hmsFetch } from "@/lib/hms-fetch";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

export async function GET(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    var sp = request.nextUrl.searchParams;
    var type = sp.get("type") || "orders";
    sp.delete("type");
    var qs = sp.toString();

    var url: string;
    if (type === "inventory") {
      url = `${BACKEND}/api/hospitals/${auth.hospitalId}/medicines${qs ? "?" + qs : ""}`;
    } else if (type === "tokens") {
      url = `${BACKEND}/api/hospitals/${auth.hospitalId}/tokens${qs ? "?" + qs : ""}`;
    } else {
      url = `${BACKEND}/api/hospitals/${auth.hospitalId}/orders${qs ? "?" + qs : ""}`;
    }

    var res = await hmsFetch(url, auth);
    var text = await res.text();
    var data; try { data = JSON.parse(text); } catch { data = { success: false, error: text.substring(0, 200) }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[GET /api/pharmacy] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var res = await hmsFetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/orders`, auth, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    var text = await res.text();
    var data; try { data = JSON.parse(text); } catch { data = { success: false, error: text.substring(0, 200) }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[POST /api/pharmacy] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
