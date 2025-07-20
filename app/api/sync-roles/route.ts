import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { guild_id } = await req.json();
  if (!guild_id) {
    return NextResponse.json({ error: "Missing guild_id" }, { status: 400 });
  }
  try {
    const apiUrl = process.env.DASHBOARD_API_URL || "https://min-api.onrender.com";
    console.log("Sync API URL:", apiUrl);
    const response = await fetch(`${apiUrl}/api/sync-discord-roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DASHBOARD_API_KEY}`,
      },
      body: JSON.stringify({ guild_id }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.text();
    console.log("Sync API response status:", response.status);
    console.log("Sync API raw response:", data);
    if (!response.ok) {
      if (data.includes("<!DOCTYPE")) {
        return NextResponse.json(
          { error: `Sync API returned HTML (status: ${response.status}), check DASHBOARD_API_URL` },
          { status: response.status }
        );
      }
      const parsedError = JSON.parse(data);
      return NextResponse.json(
        { error: parsedError.error || "Failed to sync roles" },
        { status: response.status }
      );
    }
    return NextResponse.json(JSON.parse(data), { status: 200 });
  } catch (err) {
    console.error("Error in sync-roles:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to sync roles" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST to sync roles" }, { status: 405 });
}