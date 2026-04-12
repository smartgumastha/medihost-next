import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

function getAuth(request: NextRequest) {
  var cookieValue = request.cookies.get("medihost_auth")?.value;
  return getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
}

export async function GET(request: NextRequest) {
  var auth = getAuth(request);
  if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  var sp = request.nextUrl.searchParams;
  var endpoint = sp.get("endpoint") || "orders";
  sp.delete("endpoint");
  var qs = sp.toString();
  var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/lis/${endpoint}${qs ? "?" + qs : ""}`;
  var res = await fetch(url, { headers: { Authorization: `Bearer ${auth.hmsToken || auth.token}` } });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  var auth = getAuth(request);
  if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  var body = await request.json();
  var endpoint = body._endpoint || "samples";
  var id = body._id || "";
  delete body._endpoint;
  delete body._id;

  var path = id ? `${BACKEND}/api/hospitals/${auth.hospitalId}/lis/${endpoint}/${id}` : `${BACKEND}/api/hospitals/${auth.hospitalId}/lis/${endpoint}`;
  var res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.hmsToken || auth.token}` },
    body: JSON.stringify(body),
  });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
