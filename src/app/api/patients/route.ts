import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { hmsFetch } from "@/lib/hms-fetch";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    var body = await request.json();
    var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/patients`;
    var res = await hmsFetch(url, auth, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    var text = await res.text();
    var data;
    try { data = JSON.parse(text); } catch { data = { error: text.substring(0, 200) }; }

    if (!res.ok) {
      console.error("[POST /api/patients] Backend error:", res.status, text.substring(0, 300));
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[POST /api/patients] Exception:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    var searchParams = request.nextUrl.searchParams.toString();
    var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/patients${searchParams ? "?" + searchParams : ""}`;
    var res = await hmsFetch(url, auth);

    var text = await res.text();
    var data;
    try { data = JSON.parse(text); } catch { data = { error: text.substring(0, 200) }; }

    if (!res.ok) {
      console.error("[GET /api/patients] Backend error:", res.status, text.substring(0, 300));
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[GET /api/patients] Exception:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
