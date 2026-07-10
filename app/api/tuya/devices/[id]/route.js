// app/api/tuya/devices/[id]/route.js
import { NextResponse } from "next/server";
import { setTuyaSwitch } from "@/lib/tuyaServer";

function configFromHeaders(req) {
  return {
    clientId: req.headers.get("x-tuya-client-id") || "",
    clientSecret: req.headers.get("x-tuya-client-secret") || "",
    uid: req.headers.get("x-tuya-uid") || "",
    region: req.headers.get("x-tuya-region") || "eu",
  };
}

export async function PATCH(req, { params }) {
  const config = configFromHeaders(req);
  if (!config.clientId || !config.clientSecret) {
    return NextResponse.json({ error: "missing Tuya credentials" }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    await setTuyaSwitch(config, params.id, !!body.on);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Tuya command failed" }, { status: 502 });
  }
}
