import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { hmsFetch } from "@/lib/hms-fetch";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

export async function GET(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    var searchParams = request.nextUrl.searchParams.toString();
    var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/tokens${searchParams ? "?" + searchParams : ""}`;
    var res = await hmsFetch(url, auth);
    var text = await res.text();
    var data; try { data = JSON.parse(text); } catch { data = { success: false, error: text.substring(0, 200) }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[GET /api/triage] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var res = await hmsFetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/vitals`, auth, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    var text = await res.text();
    var data; try { data = JSON.parse(text); } catch { data = { success: false, error: text.substring(0, 200) }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[POST /api/triage] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { token_id, ...rest } = body;
    var res = await hmsFetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/tokens/${token_id}/status`, auth, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest),
    });
    var text = await res.text();
    var data; try { data = JSON.parse(text); } catch { data = { success: false, error: text.substring(0, 200) }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[PUT /api/triage] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
