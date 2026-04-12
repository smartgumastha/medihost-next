import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

export async function POST(request: NextRequest) {
  var cookieValue = request.cookies.get("medihost_auth")?.value;
  var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
  if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  var body = await request.json();
  var res = await fetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/bills/from-orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify(body),
  });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
