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

  var sp = request.nextUrl.searchParams.toString();
  var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/bills${sp ? "?" + sp : ""}`;
  var res = await fetch(url, { headers: { Authorization: `Bearer ${auth.hmsToken || auth.token}` } });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  var auth = getAuth(request);
  if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  var body = await request.json();
  var res = await fetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.hmsToken || auth.token}` },
    body: JSON.stringify(body),
  });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: NextRequest) {
  var auth = getAuth(request);
  if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  var body = await request.json();
  var billId = body.bill_id;
  delete body.bill_id;
  var res = await fetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/bills/${billId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.hmsToken || auth.token}` },
    body: JSON.stringify(body),
  });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
