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
  var url = `${BACKEND}/api/hospitals/${auth.hospitalId}/appointments${searchParams ? "?" + searchParams : ""}`;
  var res = await fetch(url, {
    headers: { Authorization: `Bearer ${auth.hmsToken || auth.token}` },
  });

  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  var cookieValue = request.cookies.get("medihost_auth")?.value;
  var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
  if (!auth || !auth.hospitalId || !auth.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var body = await request.json();
  var res = await fetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.hmsToken || auth.token}`,
    },
    body: JSON.stringify(body),
  });

  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: NextRequest) {
  var cookieValue = request.cookies.get("medihost_auth")?.value;
  var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
  if (!auth || !auth.hospitalId || !auth.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var body = await request.json();
  var { appointment_id, ...rest } = body;
  var res = await fetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/appointments/${appointment_id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.hmsToken || auth.token}`,
    },
    body: JSON.stringify(rest),
  });

  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest) {
  var cookieValue = request.cookies.get("medihost_auth")?.value;
  var auth = getAuthFromCookie(cookieValue ? decodeURIComponent(cookieValue) : undefined);
  if (!auth || !auth.hospitalId || !auth.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var { appointment_id } = await request.json();
  var res = await fetch(`${BACKEND}/api/hospitals/${auth.hospitalId}/appointments/${appointment_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${auth.hmsToken || auth.token}` },
  });

  var data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
