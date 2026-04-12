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
    var endpoint = sp.get("endpoint") || "orders";
    sp.delete("endpoint");
    var qs = sp.toString();
    var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/lis/${endpoint}${qs ? "?" + qs : ""}`;
    var res = await hmsFetch(url, auth);
    var text = await res.text();
    var data; try { data = JSON.parse(text); } catch { data = { success: false, error: text.substring(0, 200) }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[GET /api/laboratory] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    var cookieValue = request.cookies.get("medihost_auth")?.value;
    var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
    if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var endpoint = body._endpoint || "samples";
    var id = body._id || "";
    delete body._endpoint;
    delete body._id;

    var path = id ? `${BACKEND}/api/hospitals/${auth.hospitalId}/lis/${endpoint}/${id}` : `${BACKEND}/api/hospitals/${auth.hospitalId}/lis/${endpoint}`;
    var res = await hmsFetch(path, auth, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    var text = await res.text();
    var data; try { data = JSON.parse(text); } catch { data = { success: false, error: text.substring(0, 200) }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("[POST /api/laboratory] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
