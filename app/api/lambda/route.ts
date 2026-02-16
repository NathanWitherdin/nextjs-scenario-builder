import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const url = process.env.NEXT_PUBLIC_LAMBDA_URL;
    if (!url)
      return new Response("Missing NEXT_PUBLIC_LAMBDA_URL", { status: 500 });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const html = await resp.text();
    return new Response(html, {
      status: resp.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e: any) {
    return new Response(`Proxy error: ${e?.message || e}`, { status: 500 });
  }
}
