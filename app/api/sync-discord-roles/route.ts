// app/api/sync-discord-roles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

// Optional: Define UserRole interface to match user_roles schema
interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at?: string | null;
  assigned_by?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guild_id } = body;

    if (!guild_id) {
      return NextResponse.json({ error: "Guild ID is required" }, { status: 400 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      console.error("Discord bot token not configured");
      return NextResponse.json(
        {
          error: "Discord bot token not configured. Please add DISCORD_BOT_TOKEN to your Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    console.log(`Fetching roles and members for guild: ${guild_id}`);

    // Fetch roles from Discord API
    const discordRolesResponse = await fetch(
      `https://discord.com/api/v10/guilds/${guild_id}/roles`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!discordRolesResponse.ok) {
      const errorText = await discordRolesResponse.text();
      console.error("Discord API error (roles):", {
        status: discordRolesResponse.status,
        statusText: discordRolesResponse.statusText,
        body: errorText,
      });
      if (discordRolesResponse.status === 401) {
        return NextResponse.json(
          { error: "Invalid Discord bot token. Please check your DISCORD_BOT_TOKEN environment variable in Vercel." },
          { status: 401 }
        );
      } else if (discordRolesResponse.status === 403) {
        return NextResponse.json(
          {
            error: "Bot does not have permission to access this guild. Make sure the bot is added to your Discord server with proper permissions.",
          },
          { status: 403 }
        );
      } else if (discordRolesResponse.status === 404) {
        return NextResponse.json({ error: "Guild not found. Please check the guild ID." }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Discord API error: ${discordRolesResponse.status} ${discordRolesResponse.statusText}` },
        { status: discordRolesResponse.status }
      );
    }

    const discordRoles: DiscordRole[] = await discordRolesResponse.json();
    console.log(`Fetched ${discordRoles.length} roles from Discord`);

    // Fetch members from Discord API
    let members: any[] = [];
    let after: string | undefined;
    do {
      const url = `https://discord.com/api/v10/guilds/${guild_id}/members?limit=1000${after ? `&after=${after}` : ""}`;
      const memberResponse = await fetch(url, {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!memberResponse.ok) {
        const errorText = await memberResponse.text();
        console.error("Discord API error (members):", {
          status: memberResponse.status,
          statusText: memberResponse.statusText,
          body: errorText,
        });
        return NextResponse.json(
          { error: `Failed to fetch members: ${memberResponse.status} ${memberResponse.statusText}` },
          { status: memberResponse.status }
        );
      }

      const batch = await memberResponse.json();
      members.push(...batch);
      after = batch.length === 1000 ? batch[batch.length - 1].user.id : undefined;
    } while (after);

    console.log(`Fetched ${members.length} members from Discord`);

    // Get Supabase client
    const supabase = await createClient();
    if (!supabase) {
      console.error("Failed to create Supabase client");
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Sync role metadata to roles table
    console.log(`Clearing existing roles for guild: ${guild_id}`);
    const { error: deleteError } = await supabase
      .from("roles")
      .delete()
      .eq("guild_id", guild_id)
      .not("role_id", "like", "custom_%");

    if (deleteError) {
      console.error("Error deleting existing roles:", deleteError);
      return NextResponse.json({ error: "Failed to clean existing roles" }, { status: 500 });
    }

    const rolesToInsert = discordRoles.map((role) => ({
      role_id: role.id,
      guild_id,
      name: role.name,
      color: role.color,
      position: role.position,
      permissions: Number(role.permissions), // Convert to number to match schema
      hoist: role.hoist,
      mentionable: role.mentionable,
      managed: role.managed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log(`Inserting ${rolesToInsert.length} roles into roles table`);
    const { error: insertError } = await supabase.from("roles").insert(rolesToInsert);

    if (insertError) {
      console.error("Database insert error (roles):", insertError);
      return NextResponse.json({ error: "Failed to save roles to database", details: insertError.message }, { status: 500 });
    }

    // Sync user-role assignments to user_roles table
    const userRoleData = members
      .flatMap((member: any) =>
        member.roles.map((role_id: string) => ({
          user_id: member.user.id,
          role_id,
          assigned_at: new Date().toISOString(),
          assigned_by: "system",
        }))
      )
      .filter((role: any) => role.role_id !== guild_id); // Exclude @everyone role

    console.log(`Upserting ${userRoleData.length} user-role assignments`);
    const { error: userRoleError } = await supabase
      .from("user_roles")
      .upsert(userRoleData, {
        onConflict: "user_roles_user_id_role_id_key",
        ignoreDuplicates: true,
      });

    if (userRoleError) {
      console.error("Error syncing user roles:", userRoleError);
      return NextResponse.json(
        { error: "Failed to sync user roles", details: userRoleError.message },
        { status: 500 }
      );
    }

    // Log to mod_logs
    await supabase.from("mod_logs").insert({
      guild_id,
      user_id: "system",
      moderator_id: "system",
      action: "role_sync",
      details: { synced_roles: userRoleData.length, synced_role_metadata: rolesToInsert.length },
      created_at: new Date().toISOString(),
    });

    console.log(`Successfully synced ${discordRoles.length} roles and ${userRoleData.length} user-role assignments`);

    return NextResponse.json({
      success: true,
      count: { roles: discordRoles.length, user_roles: userRoleData.length },
      message: `Successfully synced ${discordRoles.length} roles and ${userRoleData.length} user-role assignments`,
    });
  } catch (error) {
    console.error("Sync roles error:", error);
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to sync roles from Discord" }, { status: 405 });
}