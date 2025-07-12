-- Create tables for Discord bot dashboard
-- Run this script to set up your database schema

-- Guilds table
CREATE TABLE IF NOT EXISTS guilds (
    guild_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    owner_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Guild settings table
CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id BIGINT PRIMARY KEY,
    staff_log_channel_id BIGINT,
    muted_role_id BIGINT,
    join_leave_channel_id BIGINT,
    ticket_channel_id BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    roles TEXT[]
);

-- Commands table
CREATE TABLE IF NOT EXISTS commands (
    name TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_enabled BOOLEAN DEFAULT TRUE,
    cooldown INTEGER DEFAULT 0,
    permissions TEXT[],
    type TEXT DEFAULT 'slash'
);

-- Moderation logs table
CREATE TABLE IF NOT EXISTS mod_logs (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL,
    moderator_id VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation logs with usernames view
CREATE OR REPLACE VIEW mod_logs_with_usernames AS
SELECT 
    ml.*,
    u1.username as user_username,
    u2.username as moderator_username
FROM mod_logs ml
LEFT JOIN users u1 ON ml.user_id = u1.id
LEFT JOIN users u2 ON ml.moderator_id = u2.id;

-- Punishments table
CREATE TABLE IF NOT EXISTS punishments (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    reason TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE
);

-- Giveaways table
CREATE TABLE IF NOT EXISTS giveaways (
    id SERIAL PRIMARY KEY,
    prize TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    winners_count INTEGER DEFAULT 1,
    created_by TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    ended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER
);

-- Giveaway winners table
CREATE TABLE IF NOT EXISTS giveaway_winners (
    id SERIAL PRIMARY KEY,
    giveaway_id INTEGER REFERENCES giveaways(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    channel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embed_color INTEGER,
    image_url TEXT,
    thumbnail_url TEXT,
    footer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL
);

-- Reaction role embeds table
CREATE TABLE IF NOT EXISTS reaction_role_embeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    title TEXT,
    description TEXT,
    color TEXT,
    footer_text TEXT,
    footer_icon TEXT,
    author_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reaction roles table
CREATE TABLE IF NOT EXISTS reaction_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    emoji TEXT NOT NULL,
    role_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR PRIMARY KEY,
    guild_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    color INTEGER,
    permissions INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Staff roles table
CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id TEXT NOT NULL,
    role_name TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mod_logs_guild_id ON mod_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_mod_logs_created_at ON mod_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_punishments_user_id ON punishments(user_id);
CREATE INDEX IF NOT EXISTS idx_punishments_active ON punishments(active);
CREATE INDEX IF NOT EXISTS idx_giveaways_ended ON giveaways(ended);
CREATE INDEX IF NOT EXISTS idx_giveaways_end_time ON giveaways(end_time);
CREATE INDEX IF NOT EXISTS idx_reaction_roles_guild_id ON reaction_roles(guild_id);
CREATE INDEX IF NOT EXISTS idx_reaction_roles_message_id ON reaction_roles(message_id);
