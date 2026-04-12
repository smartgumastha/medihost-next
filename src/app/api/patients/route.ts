import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    console.log("[POST /api/patients] cookie length:", cookieValue?.length, "first50:", cookieValue?.substring(0, 50));
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) {
      console.log("[POST /api/patients] Auth check failed — hospitalId:", auth?.hospitalId, "hasToken:", !!auth?.token);
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    var token = auth.hmsToken || auth.token;
    console.log("[POST /api/patients] AUTH KEYS:", Object.keys(auth).join(","));
    console.log("[POST /api/patients] hospitalId:", auth.hospitalId, "hmsToken exists:", !!auth.hmsToken, "token first20:", token?.substring(0, 20));
    var body = await request.json();
    var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/patients`;
    var res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    console.log("[GET /api/patients] cookie length:", cookieValue?.length, "first50:", cookieValue?.substring(0, 50));
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) {
      console.log("[GET /api/patients] Auth check failed — hospitalId:", auth?.hospitalId, "hasToken:", !!auth?.token);
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    var token = auth.hmsToken || auth.token;
    console.log("[GET /api/patients] AUTH KEYS:", Object.keys(auth).join(","));
    console.log("[GET /api/patients] hospitalId:", auth.hospitalId, "hmsToken exists:", !!auth.hmsToken, "token first20:", token?.substring(0, 20));
    var searchParams = request.nextUrl.searchParams.toString();
    var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/patients${searchParams ? "?" + searchParams : ""}`;
    var res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

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
