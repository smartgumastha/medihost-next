import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";

var BACKEND = "https://smartgumastha-backend-production.up.railway.app";

export async function GET(request: NextRequest) {
  var cookieValue = request.cookies.get("medihost_auth")?.value;
  var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
  if (!auth || !auth.hospitalId || !auth.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var searchParams = request.nextUrl.searchParams.toString();
  var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/reports/revenue-trend${searchParams ? "?" + searchParams : ""}`;
  var res = await fetch(url, {
    headers: { Authorization: `Bearer ${auth.hmsToken || auth.token}` },
  });

  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
