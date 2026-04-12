import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

function getAuth(request: NextRequest) {
  var cookieValue = request.cookies.get("medihost_auth")?.value;
  return getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
}

// GET — fetch pharmacy orders or medicine inventory
export async function GET(request: NextRequest) {
  var auth = getAuth(request);
  if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  var sp = request.nextUrl.searchParams;
  var type = sp.get("type") || "orders";
  sp.delete("type");
  var qs = sp.toString();

  var url: string;
  if (type === "inventory") {
    url = `${BACKEND}/api/hospitals/${auth.hospitalId}/medicines${qs ? "?" + qs : ""}`;
  } else if (type === "tokens") {
    // Get today's tokens to find completed visits with prescriptions
    url = `${BACKEND}/api/hospitals/${auth.hospitalId}/tokens${qs ? "?" + qs : ""}`;
  } else {
    // Get pharmacy orders from visit_orders
    url = `${BACKEND}/api/hospitals/${auth.hospitalId}/orders${qs ? "?" + qs : ""}`;
  }

  var res = await fetch(url, { headers: { Authorization: `Bearer ${auth.hmsToken || auth.token}` } });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST — create order or update dispense status
export async function POST(request: NextRequest) {
  var auth = getAuth(request);
  if (!auth || !auth.hospitalId || !auth.token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  var body = await request.json();
  var res = await fetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.hmsToken || auth.token}` },
    body: JSON.stringify(body),
  });
  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
