import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { guild_id } = await req.json();
  if (!guild_id) {
    return NextResponse.json({ error: "Missing guild_id" }, { status: 400 });
  }
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      console.error("Discord bot token not configured");
      return NextResponse.json(
        { error: "Discord bot token not configured" },
        { status: 500 }
      );
    }
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guild_id}/roles`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30000),
      }
    );
    const data = await response.text();
    console.log("Discord API response status:", response.status);
    console.log("Discord API raw response:", data);
    if (!response.ok) {
      if (data.includes("<!DOCTYPE")) {
        return NextResponse.json(
          { error: `Discord API returned HTML (status: ${response.status})` },
          { status: response.status }
        );
      }
      const parsedError = JSON.parse(data);
      return NextResponse.json(
        { error: parsedError.message || "Failed to fetch roles" },
        { status: response.status }
      );
    }
    return NextResponse.json(JSON.parse(data), { status: 200 });
  } catch (err) {
    console.error("Error in fetch-discord-roles:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST to fetch roles" }, { status: 405 });
}