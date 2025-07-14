import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!process.env.DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        { error: "Discord bot token not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://discord.com/api/v10/users/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Discord API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user from Discord" },
        { status: response.status }
      );
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching Discord user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
